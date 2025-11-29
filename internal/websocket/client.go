package websocket

import (
	"encoding/json"
	"log/slog"
	"time"

	"github.com/gorilla/websocket"
	"golang.org/x/time/rate"
)

const (
	writeWait      = 10 * time.Second
	pongWait       = 60 * time.Second
	pingPeriod     = (pongWait * 9) / 10
	maxMessageSize = 512
)

type Client struct {
	hub      *Hub
	conn     *websocket.Conn
	send     chan []byte
	roomCode string
	playerID string
	role     string
	limiter  *rate.Limiter
}

type Message struct {
	Type    string          `json:"type"`
	Payload json.RawMessage `json:"payload"`
}

type JoinPayload struct {
	Name string `json:"name"`
	Code string `json:"code"`
}

type CreatePayload struct {
	Name string `json:"name"`
}

type GameActionPayload struct {
	Data string `json:"data"`
}

type LeavePayload struct {
	RoomID string `json:"room_id"`
}

func (c *Client) readPump() {
	defer func() {
		c.hub.unregister <- c
		c.conn.Close()
	}()
	c.conn.SetReadLimit(maxMessageSize)
	c.conn.SetReadDeadline(time.Now().Add(pongWait))
	c.conn.SetPongHandler(func(string) error { c.conn.SetReadDeadline(time.Now().Add(pongWait)); return nil })
	for {
		_, message, err := c.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				slog.Warn("websocket read error", "error", err)
			}
			break
		}
		c.handleMessage(message)
	}
}

func (c *Client) handleMessage(msg []byte) {
	if !c.limiter.Allow() {
		return
	}

	var m Message
	if err := json.Unmarshal(msg, &m); err != nil {
		return
	}

	switch m.Type {
	case "create_room":
		var p CreatePayload
		json.Unmarshal(m.Payload, &p)
		c.hub.createRoom <- &RoomAction{Client: c, Name: p.Name}
	case "join_room":
		var p JoinPayload
		json.Unmarshal(m.Payload, &p)
		c.hub.joinRoom <- &RoomAction{Client: c, Name: p.Name, Code: p.Code}
	case "spectate":
		var p JoinPayload
		json.Unmarshal(m.Payload, &p)
		c.hub.spectateRoom <- &RoomAction{Client: c, Code: p.Code}
	case "leave_room":
		var p LeavePayload
		json.Unmarshal(m.Payload, &p)
		c.hub.leaveRoom <- &RoomAction{Client: c, Code: p.RoomID}
	case "secret":
		var p GameActionPayload
		json.Unmarshal(m.Payload, &p)
		c.hub.gameAction <- &GameAction{Client: c, Type: "secret", Data: p.Data}
	case "submit_guess":
		var p GameActionPayload
		json.Unmarshal(m.Payload, &p)
		c.hub.gameAction <- &GameAction{Client: c, Type: "guess", Data: p.Data}
	case "restart":
		c.hub.gameAction <- &GameAction{Client: c, Type: "restart"}
	case "poke":
		c.hub.gameAction <- &GameAction{Client: c, Type: "poke"}
	}
}

func (c *Client) writePump() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		c.conn.Close()
	}()
	for {
		select {
		case message, ok := <-c.send:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			w, err := c.conn.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}
			w.Write(message)

			if err := w.Close(); err != nil {
				return
			}
		case <-ticker.C:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}
