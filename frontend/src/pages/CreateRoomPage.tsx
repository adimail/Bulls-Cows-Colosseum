import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGameStore } from "../stores/useGameStore";

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
      className="min-h-screen bg-image-overlay text-parchment font-roman flex items-center justify-center p-4"
      style={{
        backgroundImage:
          "url(https://images.unsplash.com/photo-1509024644558-2f56ce76c490?q=80&w=2670&auto=format&fit=crop)",
      }}
    >
      <div className="w-full max-w-md bg-dark-card/80 backdrop-blur-sm p-6 md:p-8 border border-bronze/30">
        <h2 className="text-2xl md:text-3xl font-cinzel text-bronze mb-6 text-center">
          Create Room
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-stone-light mb-2">Your Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-input-bg border border-bronze/50 p-3 text-parchment focus:border-bronze outline-none"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-crimson hover:bg-crimson/80 text-parchment font-bold transition-colors"
          >
            Create Room
          </button>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="w-full py-3 text-stone-light hover:text-parchment transition-colors"
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}
