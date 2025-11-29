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
    <div className="min-h-screen bg-dark-stone text-parchment font-roman flex">
      <div
        className="hidden md:block md:w-1/2 bg-cover bg-center"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1509024644558-2f56ce76c490?q=80&w=2670&auto=format&fit=crop)",
        }}
      ></div>
      <div className="w-full md:w-1/2 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-dark-card p-8 border border-bronze/30">
          <h2 className="text-3xl font-cinzel text-bronze mb-6 text-center">
            Join Game
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-stone-light mb-2">Room Code</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                maxLength={6}
                className="w-full bg-input-bg border border-bronze/50 p-3 text-parchment focus:border-bronze outline-none"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-bronze hover:bg-bronze/80 text-dark-stone font-bold transition-colors"
            >
              Enter Room
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
    </div>
  );
}
