import { useEffect, useRef } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { useGameStore } from "./stores/useGameStore";
import HomePage from "./pages/HomePage";
import CreateRoomPage from "./pages/CreateRoomPage";
import GameRoomPage from "./pages/GameRoomPage";
import SpectatePage from "./pages/SpectatePage";
import GamesPage from "./pages/GamesPage";
import NotFoundPage from "./pages/NotFoundPage";
import HelpPage from "./pages/HelpPage";
import ReloadPrompt from "./components/ReloadPrompt";

function Notification() {
  const notification = useGameStore((state) => state.notification);

  if (!notification) {
    return null;
  }

  return (
    <div className="fixed top-5 right-5 z-50 max-w-sm bg-dark-card border border-bronze text-parchment p-4 font-roman shadow-lg">
      <p>{notification}</p>
    </div>
  );
}

export default function App() {
  const navigate = useNavigate();
  const connect = useGameStore((state) => state.connect);
  const pokeSoundRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    connect(navigate);

    const playSound = () => {
      pokeSoundRef.current?.play().catch((error) => {
        console.log("Audio playback failed:", error);
      });
    };

    window.addEventListener("playPokeSound", playSound);

    return () => {
      window.removeEventListener("playPokeSound", playSound);
    };
  }, [connect, navigate]);

  return (
    <>
      <audio ref={pokeSoundRef} src="/poke.mp3" preload="auto" />
      <Notification />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/create" element={<CreateRoomPage />} />
        <Route path="/games" element={<GamesPage />} />
        <Route path="/help" element={<HelpPage />} />
        <Route path="/room/:gameId" element={<GameRoomPage />} />
        <Route path="/spectate/:gameId" element={<SpectatePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <ReloadPrompt />
    </>
  );
}
