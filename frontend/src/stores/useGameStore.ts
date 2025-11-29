import { create } from "zustand";
import { NavigateFunction } from "react-router-dom";

interface Guess {
  code: string;
  bulls: number;
  cows: number;
  timestamp: number;
}

interface PlayerState {
  id: string;
  name: string;
  secret: string;
  guesses: Guess[];
  isWinner: boolean;
  isReady: boolean;
}

interface GameState {
  roomCode: string;
  status: string;
  turn: string;
  ownerId: string;
  p1: PlayerState;
  p2: PlayerState;
  spectators: number;
  winner?: string;
}

interface GameStore {
  socket: WebSocket | null;
  gameState: GameState | null;
  playerId: string | null;
  role: "player" | "spectator" | null;
  error: string | null;
  connect: (navigate: NavigateFunction) => void;
  createRoom: (name: string) => void;
  joinRoom: (name: string, code: string) => void;
  spectateRoom: (code: string) => void;
  leaveRoom: () => void;
  setSecret: (secret: string) => void;
  submitGuess: (guess: string) => void;
  restartGame: () => void;
  clearError: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  socket: null,
  gameState: null,
  playerId: null,
  role: null,
  error: null,

  connect: (navigate) => {
    if (get().socket) return;

    const connectWebSocket = () => {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      const socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        console.log("Connected to WebSocket");
      };

      socket.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        switch (msg.type) {
          case "state":
            set({
              gameState: msg.payload,
              playerId: msg.playerId || null,
              role: msg.role || null,
              error: null,
            });
            break;
          case "error":
            set({ error: msg.payload });
            break;
          case "redirect":
            navigate(msg.payload);
            break;
        }
      };

      socket.onclose = () => {
        console.log("Disconnected, attempting to reconnect in 3 seconds...");
        set({ socket: null, gameState: null, playerId: null, role: null });
        setTimeout(() => {
          connectWebSocket();
        }, 3000);
      };

      socket.onerror = (err) => {
        console.error("WebSocket error:", err);
        socket.close();
      };

      set({ socket });
    };

    connectWebSocket();
  },

  clearError: () => set({ error: null }),

  createRoom: (name) => {
    const socket = get().socket;
    if (socket) {
      socket.send(
        JSON.stringify({
          type: "create_room",
          payload: { name },
        }),
      );
    }
  },

  joinRoom: (name, code) => {
    get().clearError();
    const socket = get().socket;
    if (socket) {
      socket.send(
        JSON.stringify({
          type: "join_room",
          payload: { name, code },
        }),
      );
    }
  },

  spectateRoom: (code) => {
    get().clearError();
    const socket = get().socket;
    if (socket) {
      socket.send(
        JSON.stringify({
          type: "spectate",
          payload: { code },
        }),
      );
    }
  },

  leaveRoom: () => {
    const socket = get().socket;
    const gameState = get().gameState;
    if (socket && gameState) {
      socket.send(
        JSON.stringify({
          type: "leave_room",
          payload: { room_id: gameState.roomCode },
        }),
      );
      set({ gameState: null, playerId: null, role: null });
    }
  },

  setSecret: (secret) => {
    const socket = get().socket;
    if (socket) {
      socket.send(
        JSON.stringify({
          type: "secret",
          payload: { data: secret },
        }),
      );
    }
  },

  submitGuess: (guess) => {
    const socket = get().socket;
    if (socket) {
      socket.send(
        JSON.stringify({
          type: "submit_guess",
          payload: { data: guess },
        }),
      );
    }
  },

  restartGame: () => {
    const socket = get().socket;
    if (socket) {
      socket.send(
        JSON.stringify({
          type: "restart",
          payload: null,
        }),
      );
    }
  },
}));
