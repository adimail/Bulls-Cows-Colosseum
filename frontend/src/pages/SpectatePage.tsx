import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGameStore } from "../stores/useGameStore";

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
      <div className="min-h-screen bg-roma-black text-roma-white flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-roma-stone/10 p-8 rounded-lg border border-roma-red text-center">
          <h2 className="text-3xl font-cinzel text-roma-red mb-4">
            Room Not Found
          </h2>
          <p className="text-lg mb-8">{error}</p>
          <button
            onClick={() => navigate("/")}
            className="w-full py-3 bg-roma-gold hover:bg-roma-gold/80 text-roma-black font-bold rounded transition-colors"
          >
            Return to Lobby
          </button>
        </div>
      </div>
    );
  }

  if (!gameState) return <div className="text-white p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-roma-black text-roma-white font-roman p-4">
      <header className="flex justify-between items-center mb-8 border-b border-roma-stone/20 pb-4">
        <div>
          <h1 className="text-2xl font-cinzel text-roma-stone">
            Spectating Room: {gameState.roomCode}
          </h1>
          <div className="flex gap-4 text-sm text-roma-stone">
            <span>Status: {gameState.status}</span>
            <span>Spectators: {gameState.spectators}</span>
          </div>
        </div>
        <button
          onClick={() => {
            leaveRoom();
            navigate("/");
          }}
          className="text-roma-red hover:text-red-400"
        >
          Leave
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-roma-stone/10 p-6 rounded border border-roma-stone/30">
          <h3 className="text-xl font-cinzel text-roma-gold mb-2">
            {gameState.p1.name}
          </h3>
          <div className="mb-4 text-3xl font-nums tracking-widest text-center bg-roma-black p-4 rounded border border-roma-stone/30">
            {gameState.p1.secret || "Not Set"}
          </div>
          <div className="h-96 overflow-y-auto custom-scrollbar space-y-2">
            {gameState.p1.guesses.map((g, i) => (
              <div
                key={i}
                className="flex justify-between bg-roma-black/50 p-2 rounded"
              >
                <span className="font-nums tracking-wider">{g.code}</span>
                <span className="text-roma-sand">
                  {g.bulls}B {g.cows}C
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-roma-stone/10 p-6 rounded border border-roma-stone/30">
          <h3 className="text-xl font-cinzel text-roma-gold mb-2">
            {gameState.p2.name || "Waiting..."}
          </h3>
          <div className="mb-4 text-3xl font-nums tracking-widest text-center bg-roma-black p-4 rounded border border-roma-stone/30">
            {gameState.p2.secret || "Not Set"}
          </div>
          <div className="h-96 overflow-y-auto custom-scrollbar space-y-2">
            {gameState.p2.guesses.map((g, i) => (
              <div
                key={i}
                className="flex justify-between bg-roma-black/50 p-2 rounded"
              >
                <span className="font-nums tracking-wider">{g.code}</span>
                <span className="text-roma-sand">
                  {g.bulls}B {g.cows}C
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {gameState.status === "completed" && (
        <div className="mt-8 text-center">
          <h2 className="text-4xl font-cinzel text-roma-gold">
            Winner:{" "}
            {gameState.winner === "p1" ? gameState.p1.name : gameState.p2.name}
          </h2>
        </div>
      )}
    </div>
  );
}
