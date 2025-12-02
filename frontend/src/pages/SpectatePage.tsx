import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGameStore } from "../stores/useGameStore";
import { Shield, Sword, Eye } from "lucide-react";
import BackToLobby from "../components/BackToLobby";

export default function SpectatePage() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { gameState, spectateRoom, leaveRoom, error, clearError } =
    useGameStore();

  useEffect(() => {
    if (gameId) {
      spectateRoom(gameId);
    }
    return () => {
      clearError();
    };
  }, [gameId, spectateRoom, clearError]);

  if (error) {
    return (
      <div className="min-h-screen bg-image-overlay flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md card-legendary p-10 text-center">
          <h2 className="text-3xl font-cinzel text-crimson mb-4">
            Arena Not Found
          </h2>
          <p className="text-lg mb-8 text-stone-300">{error}</p>
          <button
            onClick={() => navigate("/")}
            className="w-full btn-legendary btn-gold"
          >
            Return to Lobby
          </button>
        </div>
      </div>
    );
  }

  if (!gameState)
    return (
      <div className="min-h-screen bg-dark-stone flex items-center justify-center text-gold-gradient font-cinzel text-xl animate-pulse">
        Entering the Colosseum...
      </div>
    );

  return (
    <div
      className="min-h-screen bg-image-overlay text-parchment font-roman flex flex-col overflow-hidden"
      style={{
        backgroundImage:
          "url(https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1600&q=80&auto=format)",
      }}
    >
      <div className="pillar-side left-0 border-r border-stone-800"></div>
      <div className="pillar-side right-0 border-l border-stone-800"></div>

      <header className="relative z-20 bg-black/80 backdrop-blur-md border-b border-yellow-900/30 p-4 flex justify-between items-center shadow-2xl">
        <div className="flex items-center gap-4">
          <BackToLobby />
          <div className="ml-1">
            <h1 className="text-xl md:text-2xl font-cinzel font-bold text-stone-300 flex items-center gap-2">
              <Eye className="text-amber-500" /> Spectating:{" "}
              {gameState.roomCode}
            </h1>
            <div className="flex gap-4 text-xs font-cinzel text-stone-500 tracking-widest uppercase">
              <span>Status: {gameState.status}</span>
              <span>Spectators: {gameState.spectators}</span>
            </div>
          </div>
        </div>
        <button
          onClick={() => {
            leaveRoom();
            navigate("/");
          }}
          className="btn-legendary px-6 py-2 text-xs"
        >
          Leave
        </button>
      </header>

      <main className="flex-grow relative z-10 p-4 md:p-8 overflow-y-auto custom-scrollbar">
        {gameState.status === "completed" && (
          <div className="text-center mb-8 animate-in zoom-in duration-500">
            <h2 className="text-4xl md:text-5xl font-cinzel font-black text-gold-gradient drop-shadow-lg">
              VICTOR:{" "}
              {gameState.winner === "p1"
                ? gameState.p1.name
                : gameState.p2.name}
            </h2>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto h-[calc(100vh-200px)]">
          {/* Player 1 */}
          <div className="card-legendary flex flex-col p-1">
            <div className="bg-stone-900/90 flex-grow p-4 md:p-6 flex flex-col border border-stone-800">
              <div className="flex items-center justify-between mb-6 border-b border-stone-800 pb-4">
                <h3 className="text-xl font-cinzel font-bold text-amber-500 flex items-center gap-2">
                  <Shield size={20} /> {gameState.p1.name}
                </h3>
              </div>

              <div className="mb-6">
                <div className="text-center mb-2 text-stone-500 font-cinzel text-xs uppercase tracking-widest">
                  Secret Code
                </div>
                <div className="text-xl md:text-3xl font-nums tracking-[0.5em] text-center md:py-5 py-3 bg-black/40 border-2 border-amber-900/30 text-amber-100">
                  {gameState.p1.secret || "Not Set"}
                </div>
              </div>

              <div className="flex-grow overflow-y-auto custom-scrollbar space-y-1 bg-black/20 p-2 border border-stone-800/50">
                {gameState.p1.guesses.map((g, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center p-3 bg-stone-800/30 border-b border-stone-800"
                  >
                    <span className="font-nums text-xl tracking-widest text-stone-300">
                      {g.code}
                    </span>
                    <div className="flex gap-3 font-cinzel font-bold">
                      <span className="text-amber-500 w-8 text-right">
                        {g.bulls}B
                      </span>
                      <span className="text-stone-400 w-8 text-right">
                        {g.cows}C
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Player 2 */}
          <div className="card-legendary flex flex-col p-1">
            <div className="bg-stone-900/90 flex-grow p-4 md:p-6 flex flex-col border border-stone-800">
              <div className="flex items-center justify-between mb-6 border-b border-stone-800 pb-4">
                <h3 className="text-xl font-cinzel font-bold text-stone-400 flex items-center gap-2">
                  <Sword size={20} /> {gameState.p2.name || "Waiting..."}
                </h3>
              </div>

              <div className="mb-6">
                <div className="text-center mb-2 text-stone-500 font-cinzel text-xs uppercase tracking-widest">
                  Secret Code
                </div>
                <div className="text-xl md:text-3xl font-nums tracking-[0.5em] text-center md:py-5 py-3 bg-black/40 border-2 border-stone-800 text-stone-600">
                  {gameState.p2.secret || "Not Set"}
                </div>
              </div>

              <div className="flex-grow overflow-y-auto custom-scrollbar space-y-1 bg-black/20 p-2 border border-stone-800/50">
                {gameState.p2.guesses.map((g, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center p-3 bg-stone-800/30 border-b border-stone-800"
                  >
                    <span className="font-nums text-xl tracking-widest text-stone-300">
                      {g.code}
                    </span>
                    <div className="flex gap-3 font-cinzel font-bold">
                      <span className="text-amber-500 w-8 text-right">
                        {g.bulls}B
                      </span>
                      <span className="text-stone-400 w-8 text-right">
                        {g.cows}C
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
