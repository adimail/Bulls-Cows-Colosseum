import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function JoinRoomPage() {
  const [code, setCode] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length === 6) {
      navigate(`/room/${code}`);
    }
  };

  return (
    <div className="min-h-screen bg-roma-black text-roma-white font-roman flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-roma-stone/10 p-8 rounded-lg border border-roma-bronze/30">
        <h2 className="text-3xl font-cinzel text-roma-gold mb-6 text-center">
          Join Game
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-roma-sand mb-2">Room Code</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              maxLength={6}
              className="w-full bg-roma-black border border-roma-stone p-3 rounded text-roma-white focus:border-roma-gold outline-none"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-roma-bronze hover:bg-roma-bronze/80 text-roma-white font-bold rounded transition-colors"
          >
            Enter Room
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
