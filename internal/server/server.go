package server

import (
	"context"
	"net/http"
	"time"

	"github.com/adimail/colosseum/internal/websocket"
)

type Server struct {
	Addr       string
	StaticDir  string
	Router     *http.ServeMux
	Hub        *websocket.Hub
	httpServer *http.Server
}

func NewServer(addr, staticDir string) *Server {
	hub := websocket.NewHub()
	go hub.Run()

	router := http.NewServeMux()

	s := &Server{
		Addr:      addr,
		StaticDir: staticDir,
		Router:    router,
		Hub:       hub,
	}

	s.httpServer = &http.Server{
		Addr:         s.Addr,
		Handler:      s.Router,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	s.routes()
	return s
}

func (s *Server) Start() error {
	return s.httpServer.ListenAndServe()
}

func (s *Server) Shutdown(ctx context.Context) error {
	return s.httpServer.Shutdown(ctx)
}
