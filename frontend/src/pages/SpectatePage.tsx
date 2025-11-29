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
      <div className="min-h-screen bg-dark-stone text-parchment flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-dark-card p-8 border border-crimson text-center">
          <h2 className="text-3xl font-cinzel text-crimson mb-4">
            Room Not Found
          </h2>
          <p className="text-lg mb-8">{error}</p>
          <button
            onClick={() => navigate("/")}
            className="w-full py-3 bg-bronze hover:bg-bronze/80 text-dark-stone font-bold transition-colors"
          >
            Return to Lobby
          </button>
        </div>
      </div>
    );
  }

  if (!gameState) return <div className="text-parchment p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-dark-stone text-parchment font-roman p-4 md:p-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-bronze/20 pb-4 gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-cinzel text-stone-light">
            Spectating Room: {gameState.roomCode}
          </h1>
          <div className="flex gap-4 text-sm text-stone-light">
            <span>Status: {gameState.status}</span>
            <span>Spectators: {gameState.spectators}</span>
          </div>
        </div>
        <button
          onClick={() => {
            leaveRoom();
            navigate("/");
          }}
          className="text-crimson hover:text-crimson/80"
        >
          Leave
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
        <div className="bg-dark-card p-4 md:p-6 border border-bronze/30">
          <h3 className="text-lg md:text-xl font-cinzel text-bronze mb-2">
            {gameState.p1.name}
          </h3>
          <div className="mb-4 text-2xl md:text-3xl font-nums tracking-widest text-center bg-dark-stone p-4 border border-bronze/30">
            {gameState.p1.secret || "Not Set"}
          </div>
          <div className="h-64 md:h-96 overflow-y-auto custom-scrollbar space-y-2">
            {gameState.p1.guesses.map((g, i) => (
              <div
                key={i}
                className="flex justify-between bg-dark-stone/50 p-2"
              >
                <span className="font-nums tracking-wider">{g.code}</span>
                <span className="text-stone-light">
                  {g.bulls}B {g.cows}C
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-dark-card p-4 md:p-6 border border-bronze/30">
          <h3 className="text-lg md:text-xl font-cinzel text-bronze mb-2">
            {gameState.p2.name || "Waiting..."}
          </h3>
          <div className="mb-4 text-2xl md:text-3xl font-nums tracking-widest text-center bg-dark-stone p-4 border border-bronze/30">
            {gameState.p2.secret || "Not Set"}
          </div>
          <div className="h-64 md:h-96 overflow-y-auto custom-scrollbar space-y-2">
            {gameState.p2.guesses.map((g, i) => (
              <div
                key={i}
                className="flex justify-between bg-dark-stone/50 p-2"
              >
                <span className="font-nums tracking-wider">{g.code}</span>
                <span className="text-stone-light">
                  {g.bulls}B {g.cows}C
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {gameState.status === "completed" && (
        <div className="mt-8 text-center">
          <h2 className="text-3xl md:text-4xl font-cinzel text-bronze">
            Winner:{" "}
            {gameState.winner === "p1" ? gameState.p1.name : gameState.p2.name}
          </h2>
        </div>
      )}
    </div>
  );
}
