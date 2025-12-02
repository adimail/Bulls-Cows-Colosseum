import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGameStore } from "../stores/useGameStore";
import BackToLobby from "../components/BackToLobby";

export default function CreateRoomPage() {
  const [name, setName] = useState("");
  const createRoom = useGameStore((state) => state.createRoom);
  const gameState = useGameStore((state) => state.gameState);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      createRoom(name);
    }
  };

  if (gameState?.roomCode) {
    navigate(`/room/${gameState.roomCode}`);
  }

  return (
    <div
      className="min-h-screen bg-image-overlay text-parchment font-roman flex items-center justify-center p-4 md:flex-row flex-col md:gap-0 gap-8"
      style={{
        backgroundImage:
          "url(https://images.unsplash.com/photo-1714259184249-b3f85962cfda?q=80&w=2672&auto=format&fit=crop)",
      }}
    >
      <BackToLobby />
      <div className="pillar-side left-0 border-r border-stone-800"></div>
      <div className="pillar-side right-0 border-l border-stone-800"></div>

      <div className="w-full max-w-lg card-legendary p-8 md:p-12 animate-in fade-in zoom-in duration-500">
        <div className="text-center mb-10">
          <h2 className="text-4xl md:text-5xl font-cinzel font-bold text-gold-gradient mb-2 drop-shadow-lg">
            Create Room
          </h2>
          <div className="h-1 w-24 bg-gradient-to-r from-transparent via-amber-600 to-transparent mx-auto"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-2">
            <label className="block text-stone-400 font-cinzel text-sm tracking-widest uppercase ml-1">
              Gladiator Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-stone text-2xl"
              placeholder="MAXIMUS"
              autoFocus
              required
            />
          </div>

          <div className="space-y-4 pt-4">
            <button
              type="submit"
              className="w-full btn-legendary btn-crimson text-lg"
            >
              Establish Arena
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
