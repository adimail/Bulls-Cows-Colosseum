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
    <div className="min-h-screen bg-roma-black text-roma-white font-roman flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-roma-stone/10 p-8 rounded-lg border border-roma-bronze/30">
        <h2 className="text-3xl font-cinzel text-roma-gold mb-6 text-center">
          Create Room
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-roma-sand mb-2">Your Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-roma-black border border-roma-stone p-3 rounded text-roma-white focus:border-roma-gold outline-none"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-roma-red hover:bg-roma-red/80 text-roma-white font-bold rounded transition-colors"
          >
            Create Room
          </button>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="w-full py-3 text-roma-stone hover:text-roma-white transition-colors"
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}
