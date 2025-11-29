import { useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { useGameStore } from "./stores/useGameStore";
import HomePage from "./pages/HomePage";
import CreateRoomPage from "./pages/CreateRoomPage";
import GameRoomPage from "./pages/GameRoomPage";
import SpectatePage from "./pages/SpectatePage";
import GamesPage from "./pages/GamesPage";
import NotFoundPage from "./pages/NotFoundPage";

export default function App() {
  const navigate = useNavigate();
  const connect = useGameStore((state) => state.connect);

  useEffect(() => {
    connect(navigate);
  }, [connect, navigate]);

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/create" element={<CreateRoomPage />} />
      <Route path="/games" element={<GamesPage />} />
      <Route path="/room/:gameId" element={<GameRoomPage />} />
      <Route path="/spectate/:gameId" element={<SpectatePage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
