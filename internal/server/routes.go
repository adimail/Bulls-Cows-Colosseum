package server

import (
	"encoding/json"
	"net/http"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"time"

	"github.com/adimail/colosseum/internal/game"
)

func (s *Server) routes() {
	s.Router.HandleFunc("/api/health", s.handleHealthCheck)
	s.Router.HandleFunc("/api/rooms", RateLimitMiddleware(s.handleGetRooms))
	s.Router.HandleFunc("/ws", RateLimitMiddleware(s.handleWebSocket))

	staticFileServer := http.FileServer(http.Dir(s.StaticDir))
	s.Router.Handle("/", s.spaHandler(staticFileServer))
}

func (s *Server) spaHandler(staticServer http.Handler) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		path := filepath.Join(s.StaticDir, r.URL.Path)

		if !strings.HasPrefix(r.URL.Path, "/api") {
			_, err := os.Stat(path)
			if os.IsNotExist(err) {
				http.ServeFile(w, r, filepath.Join(s.StaticDir, "index.html"))
				return
			}
		}

		staticServer.ServeHTTP(w, r)
	}
}

func (s *Server) handleHealthCheck(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("OK"))
}

type RoomInfo struct {
	RoomCode    string    `json:"roomCode"`
	OwnerName   string    `json:"ownerName"`
	PlayerCount int       `json:"playerCount"`
	Status      string    `json:"status"`
	CreatedAt   time.Time `json:"createdAt"`
}

func (s *Server) handleGetRooms(w http.ResponseWriter, r *http.Request) {
	s.Hub.Mutex.Lock()
	defer s.Hub.Mutex.Unlock()

	roomsList := make([]RoomInfo, 0, len(s.Hub.Rooms))
	for _, room := range s.Hub.Rooms {
		room.Mutex.Lock()

		if room.GameState.Status == "completed" {
			room.Mutex.Unlock()
			continue
		}

		var ownerName string
		if room.GameState.OwnerID == game.Player1 {
			ownerName = room.GameState.P1.Name
		} else {
			ownerName = room.GameState.P2.Name
		}

		playerCount := 0
		if room.GameState.P1 != nil && room.GameState.P1.Name != "" {
			playerCount++
		}
		if room.GameState.P2 != nil && room.GameState.P2.Name != "" {
			playerCount++
		}

		info := RoomInfo{
			RoomCode:    room.GameState.RoomCode,
			OwnerName:   ownerName,
			PlayerCount: playerCount,
			Status:      room.GameState.Status,
			CreatedAt:   room.CreatedAt,
		}
		roomsList = append(roomsList, info)
		room.Mutex.Unlock()
	}

	sort.Slice(roomsList, func(i, j int) bool {
		return roomsList[i].CreatedAt.After(roomsList[j].CreatedAt)
	})

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(roomsList); err != nil {
		http.Error(w, "Failed to encode rooms", http.StatusInternalServerError)
	}
}

func (s *Server) handleWebSocket(w http.ResponseWriter, r *http.Request) {
	s.Hub.ServeWS(w, r)
}
