package websocket

import (
	"encoding/json"
	"log/slog"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/adimail/colosseum/internal/game"
	"github.com/gorilla/websocket"
	"golang.org/x/time/rate"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

type Room struct {
	GameState      *game.GameState
	Clients        map[*Client]bool
	Mutex          sync.Mutex
	CreatedAt      time.Time
	LastActivityAt time.Time
}

type RoomAction struct {
	Client *Client
	Name   string
	Code   string
}

type GameAction struct {
	Client *Client
	Type   string
	Data   string
}

type Hub struct {
	clients      map[*Client]bool
	Rooms        map[string]*Room
	register     chan *Client
	unregister   chan *Client
	createRoom   chan *RoomAction
	joinRoom     chan *RoomAction
	spectateRoom chan *RoomAction
	leaveRoom    chan *RoomAction
	gameAction   chan *GameAction
	Mutex        sync.Mutex
}

func NewHub() *Hub {
	hub := &Hub{
		register:     make(chan *Client),
		unregister:   make(chan *Client),
		createRoom:   make(chan *RoomAction),
		joinRoom:     make(chan *RoomAction),
		spectateRoom: make(chan *RoomAction),
		leaveRoom:    make(chan *RoomAction),
		gameAction:   make(chan *GameAction),
		clients:      make(map[*Client]bool),
		Rooms:        make(map[string]*Room),
	}
	go hub.cleanupStaleRooms()
	return hub
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			h.Mutex.Lock()
			h.clients[client] = true
			h.Mutex.Unlock()

		case client := <-h.unregister:
			h.handleUnregister(client)

		case action := <-h.createRoom:
			h.handleCreateRoom(action)

		case action := <-h.joinRoom:
			h.handleJoinRoom(action)

		case action := <-h.spectateRoom:
			h.handleSpectateRoom(action)

		case action := <-h.leaveRoom:
			h.handleLeaveRoom(action)

		case action := <-h.gameAction:
			h.handleGameAction(action)
		}
	}
}

func (h *Hub) handleUnregister(client *Client) {
	h.Mutex.Lock()
	if _, ok := h.clients[client]; ok {
		delete(h.clients, client)
		close(client.send)
	}

	roomCode := client.roomCode
	if roomCode == "" {
		h.Mutex.Unlock()
		return
	}

	room, roomExists := h.Rooms[roomCode]
	h.Mutex.Unlock()

	if !roomExists {
		return
	}

	room.Mutex.Lock()
	defer room.Mutex.Unlock()

	delete(room.Clients, client)

	if len(room.Clients) == 0 {
		h.Mutex.Lock()
		delete(h.Rooms, roomCode)
		h.Mutex.Unlock()
		return
	}

	if client.role == "spectator" {
		if room.GameState.Spectators > 0 {
			room.GameState.Spectators--
		}
	} else {
		pid := game.PlayerID(client.playerID)

		if pid == game.Player1 {
			if room.GameState.P2.Name != "" {
				var p2Client *Client
				for c := range room.Clients {
					if c.playerID == string(game.Player2) {
						p2Client = c
						break
					}
				}

				if p2Client != nil {
					p2Client.playerID = string(game.Player1)
				}

				room.GameState.P1.Name = room.GameState.P2.Name
				room.GameState.OwnerID = game.Player1

				room.GameState.P1.Secret = ""
				room.GameState.P1.Guesses = []game.Guess{}
				room.GameState.P1.IsWinner = false
				room.GameState.P1.IsReady = false

				room.GameState.P2 = &game.PlayerState{ID: game.Player2, Guesses: []game.Guess{}}

				room.GameState.Status = "waiting"
				room.GameState.Turn = game.Player1
				room.GameState.Winner = ""
			}
		} else if pid == game.Player2 {
			room.GameState.P2 = &game.PlayerState{ID: game.Player2, Guesses: []game.Guess{}}

			room.GameState.P1.Secret = ""
			room.GameState.P1.Guesses = []game.Guess{}
			room.GameState.P1.IsWinner = false
			room.GameState.P1.IsReady = false

			room.GameState.Status = "waiting"
			room.GameState.Turn = game.Player1
			room.GameState.Winner = ""
		}
	}

	h.broadcastState(room)
}

func sanitizeName(name string) string {
	name = strings.TrimSpace(name)
	if len(name) > 50 {
		name = name[:50]
	}
	return strings.Map(func(r rune) rune {
		if r < 32 || r == 127 {
			return -1
		}
		return r
	}, name)
}

func (h *Hub) generateUniqueRoomCode() string {
	for {
		code := game.GenerateRoomCode()
		h.Mutex.Lock()
		_, exists := h.Rooms[code]
		h.Mutex.Unlock()
		if !exists {
			return code
		}
	}
}

func (h *Hub) handleCreateRoom(action *RoomAction) {
	code := h.generateUniqueRoomCode()
	now := time.Now()
	room := &Room{
		GameState:      game.NewGame(code),
		Clients:        make(map[*Client]bool),
		CreatedAt:      now,
		LastActivityAt: now,
	}

	action.Client.roomCode = code
	action.Client.playerID = string(game.Player1)
	action.Client.role = "player"

	room.Mutex.Lock()
	defer room.Mutex.Unlock()

	room.Clients[action.Client] = true
	room.GameState.P1.Name = sanitizeName(action.Name)

	h.Mutex.Lock()
	h.Rooms[code] = room
	h.Mutex.Unlock()

	h.broadcastState(room)
}

func (h *Hub) handleJoinRoom(action *RoomAction) {
	h.Mutex.Lock()
	room, ok := h.Rooms[action.Code]
	if ok {
		room.Mutex.Lock()
	}
	h.Mutex.Unlock()

	if !ok {
		action.Client.send <- []byte(`{"type":"error","payload":"Room not found"}`)
		return
	}
	defer room.Mutex.Unlock()

	if room.GameState.P2.Name != "" {
		action.Client.send <- []byte(`{"type":"redirect","payload":"/spectate/` + action.Code + `"}`)
		return
	}

	action.Client.roomCode = action.Code
	action.Client.playerID = string(game.Player2)
	action.Client.role = "player"
	room.Clients[action.Client] = true
	room.GameState.P2.Name = sanitizeName(action.Name)
	room.LastActivityAt = time.Now()
	room.GameState.Status = "setup"

	h.broadcastState(room)
}

func (h *Hub) handleSpectateRoom(action *RoomAction) {
	h.Mutex.Lock()
	room, ok := h.Rooms[action.Code]
	if ok {
		room.Mutex.Lock()
	}
	h.Mutex.Unlock()

	if !ok {
		action.Client.send <- []byte(`{"type":"error","payload":"Room not found"}`)
		return
	}
	defer room.Mutex.Unlock()

	action.Client.roomCode = action.Code
	action.Client.role = "spectator"
	room.Clients[action.Client] = true
	room.GameState.Spectators++

	h.broadcastState(room)
}

func (h *Hub) handleLeaveRoom(action *RoomAction) {
	h.handleUnregister(action.Client)
}

func (h *Hub) handleGameAction(action *GameAction) {
	h.Mutex.Lock()
	room, ok := h.Rooms[action.Client.roomCode]
	if ok {
		room.Mutex.Lock()
	}
	h.Mutex.Unlock()

	if !ok {
		return
	}
	defer room.Mutex.Unlock()

	pid := game.PlayerID(action.Client.playerID)
	room.LastActivityAt = time.Now()
	stateChanged := false

	switch action.Type {
	case "secret":
		if room.GameState.Status == "waiting" || room.GameState.Status == "setup" {
			if game.IsValidSecret(action.Data) {
				room.GameState.SetSecret(pid, action.Data)
				stateChanged = true
			} else {
				errorMsg := `{"type":"error","payload":"Invalid code. Must be 4 unique digits."}`
				select {
				case action.Client.send <- []byte(errorMsg):
				default:
				}
			}
		}
	case "guess":
		if room.GameState.Status == "active" && room.GameState.Turn == pid {
			if game.IsValidSecret(action.Data) {
				room.GameState.MakeGuess(pid, action.Data)
				stateChanged = true
			} else {
				errorMsg := `{"type":"error","payload":"Invalid guess. Must be 4 unique digits."}`
				select {
				case action.Client.send <- []byte(errorMsg):
				default:
				}
			}
		}
	case "restart":
		if room.GameState.Status != "completed" {
			return
		}
		if pid == game.Player1 {
			room.GameState.P1.IsReady = true
		} else if pid == game.Player2 {
			room.GameState.P2.IsReady = true
		}
		stateChanged = true

		if room.GameState.P1.IsReady && room.GameState.P2.IsReady {
			room.GameState.Reset()
		}
	}

	if stateChanged {
		h.broadcastState(room)
	}
}

func (h *Hub) broadcastState(room *Room) {
	clients := make([]*Client, 0, len(room.Clients))
	for client := range room.Clients {
		clients = append(clients, client)
	}

	for _, client := range clients {
		stateCopy := *room.GameState
		p1Copy := *room.GameState.P1
		p2Copy := *room.GameState.P2
		stateCopy.P1 = &p1Copy
		stateCopy.P2 = &p2Copy

		if client.role != "spectator" && stateCopy.Status != "completed" {
			if game.PlayerID(client.playerID) == game.Player1 {
				stateCopy.P2.Secret = ""
			} else {
				stateCopy.P1.Secret = ""
			}
		}

		stateJSON, err := json.Marshal(stateCopy)
		if err != nil {
			slog.Error("error marshalling state", "error", err)
			continue
		}

		msg := map[string]interface{}{
			"type":     "state",
			"payload":  json.RawMessage(stateJSON),
			"playerId": client.playerID,
			"role":     client.role,
		}
		bytes, err := json.Marshal(msg)
		if err != nil {
			slog.Error("error marshalling message", "error", err)
			continue
		}

		select {
		case client.send <- bytes:
		case <-time.After(2 * time.Second):
			slog.Warn("slow client detected, triggering unregister", "room", room.GameState.RoomCode, "player", client.playerID)
			go func(c *Client) { h.unregister <- c }(client)
		}
	}
}

func (h *Hub) ServeWS(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		slog.Error("failed to upgrade websocket", "error", err)
		return
	}
	client := &Client{
		hub:     h,
		conn:    conn,
		send:    make(chan []byte, 256),
		limiter: rate.NewLimiter(rate.Every(time.Second/2), 5),
	}
	client.hub.register <- client

	go client.writePump()
	go client.readPump()
}

func (h *Hub) cleanupStaleRooms() {
	ticker := time.NewTicker(5 * time.Minute)
	defer ticker.Stop()
	for range ticker.C {
		toDelete := []string{}
		h.Mutex.Lock()
		now := time.Now()
		for code, room := range h.Rooms {
			room.Mutex.Lock()
			if now.Sub(room.LastActivityAt) > 30*time.Minute {
				toDelete = append(toDelete, code)
			}
			room.Mutex.Unlock()
		}

		for _, code := range toDelete {
			if room, ok := h.Rooms[code]; ok {
				room.Mutex.Lock()
				for client := range room.Clients {
					close(client.send)
				}
				room.Mutex.Unlock()
				delete(h.Rooms, code)
				slog.Info("cleaned up stale room", "code", code)
			}
		}
		h.Mutex.Unlock()
	}
}
