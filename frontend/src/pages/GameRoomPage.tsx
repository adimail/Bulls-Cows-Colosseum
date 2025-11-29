import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGameStore } from "../stores/useGameStore";

export default function GameRoomPage() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const {
    gameState,
    joinRoom,
    leaveRoom,
    setSecret,
    submitGuess,
    playerId,
    restartGame,
    error: globalError,
    clearError,
  } = useGameStore();
  const [input, setInput] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [inputError, setInputError] = useState<string | null>(null);

  useEffect(() => {
    if (globalError) {
      setInputError(globalError);
      const timer = setTimeout(() => {
        clearError();
        setInputError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [globalError, clearError]);

  const handleJoinClick = () => {
    if (playerName.trim() && gameId) {
      joinRoom(playerName.trim(), gameId);
    }
  };

  if (!gameState) {
    if (globalError && !inputError) {
      return (
        <div className="min-h-screen bg-roma-black text-roma-white flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-md bg-roma-stone/10 p-8 rounded-lg border border-roma-red text-center">
            <h2 className="text-3xl font-cinzel text-roma-red mb-4">
              Error Joining Room
            </h2>
            <p className="text-lg mb-8">{globalError}</p>
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

    return (
      <div className="min-h-screen bg-roma-black text-roma-white flex items-center justify-center">
        <div className="bg-roma-stone/10 p-8 rounded border border-roma-bronze">
          <h2 className="text-2xl font-cinzel text-roma-gold mb-4">
            Join Room {gameId}
          </h2>
          <input
            type="text"
            placeholder="Enter your name"
            className="w-full bg-roma-black border border-roma-stone p-2 mb-4 text-white"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
          />
          <button
            onClick={handleJoinClick}
            className="w-full bg-roma-gold text-roma-black font-bold py-2 rounded"
            disabled={!playerName}
          >
            Join Game
          </button>
        </div>
      </div>
    );
  }

  const isPlayer1 = playerId === "p1";
  const myState = isPlayer1 ? gameState.p1 : gameState.p2;
  const oppState = isPlayer1 ? gameState.p2 : gameState.p1;
  const isMyTurn = gameState.turn === playerId;

  const validateInput = (value: string): string | null => {
    if (value.length !== 4) {
      return "Must be 4 digits.";
    }
    if (new Set(value).size !== 4) {
      return "Digits must be unique.";
    }
    return null;
  };

  const handleAction = () => {
    setInputError(null);
    clearError();

    const validationError = validateInput(input);
    if (validationError) {
      setInputError(validationError);
      return;
    }

    if (!myState.secret) {
      setSecret(input);
    } else if (gameState.status === "active") {
      submitGuess(input);
    }
    setInput("");
  };

  const handleLeave = () => {
    if (confirm("Are you sure you want to leave?")) {
      leaveRoom();
      navigate("/");
    }
  };

  const getStatusMessage = () => {
    if (gameState.status === "completed") return "";
    if (!myState.secret) {
      return "Set your 4-digit secret code.";
    }
    if (gameState.status === "setup") {
      return `Waiting for ${oppState.name || "opponent"} to set their secret.`;
    }
    if (gameState.status === "active") {
      if (isMyTurn) {
        return "Your turn! Enter your guess.";
      }
      return `Waiting for ${oppState.name || "opponent"} to guess...`;
    }
    return "";
  };

  const renderRematchControls = () => {
    if (!myState.isReady && !oppState.isReady) {
      return (
        <button
          onClick={restartGame}
          className="bg-roma-gold text-roma-black px-6 py-2 rounded font-bold"
        >
          Play Again
        </button>
      );
    }
    if (myState.isReady && !oppState.isReady) {
      return (
        <button
          disabled
          className="bg-roma-stone text-roma-black px-6 py-2 rounded font-bold opacity-70"
        >
          Waiting for Opponent...
        </button>
      );
    }
    if (!myState.isReady && oppState.isReady) {
      return (
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <p className="text-roma-sand">
            {oppState.name || "Opponent"} wants a rematch!
          </p>

          <button
            onClick={restartGame}
            className="bg-roma-gold text-roma-black px-6 py-2 rounded font-bold"
          >
            Accept Rematch
          </button>
        </div>
      );
    }
    return (
      <button
        disabled
        className="bg-roma-stone text-roma-black px-6 py-2 rounded font-bold opacity-70"
      >
        Starting...
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-roma-black text-roma-white font-roman p-4">
      <header className="flex justify-between items-center mb-8 border-b border-roma-stone/20 pb-4">
        <div>
          <h1 className="text-2xl font-cinzel text-roma-gold">
            Room: {gameState.roomCode}
          </h1>
          <p className="text-roma-stone">
            Status: <span className="uppercase">{gameState.status}</span>
            {" | "}
            Spectators: <span>{gameState.spectators}</span>
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
            }}
            className="cursor-pointer rounded bg-roma-stone/20 px-4 py-2 text-roma-sand transition-colors hover:bg-roma-stone/40"
          >
            Copy Link
          </button>
          <button
            onClick={handleLeave}
            className="cursor-pointer rounded bg-roma-red/80 px-4 py-2 text-roma-white transition-colors hover:bg-roma-red"
          >
            Leave Room
          </button>
        </div>
      </header>

      {gameState.status === "completed" && (
        <div className="my-8 bg-roma-stone/10 p-6 rounded border border-roma-gold text-center flex flex-col items-center">
          <h2 className="text-4xl font-cinzel text-roma-gold mb-4">
            Game Over
          </h2>

          <p className="text-2xl mb-6">
            {gameState.winner === playerId ? "You Won!" : "You Lost!"}
          </p>

          <div className="flex flex-col items-center gap-4">
            {renderRematchControls()}

            <button
              onClick={() => {
                leaveRoom();
                navigate("/");
              }}
              className="border border-roma-stone text-roma-stone px-6 py-2 rounded"
            >
              Lobby
            </button>
          </div>
        </div>
      )}

      {gameState.status === "waiting" && !myState.name && (
        <div className="text-center py-20">
          <h2 className="text-4xl font-cinzel text-roma-stone mb-4">
            Waiting for Opponent...
          </h2>
          <p className="text-xl">Share the room code: {gameState.roomCode}</p>
        </div>
      )}

      {(gameState.status === "setup" ||
        gameState.status === "active" ||
        gameState.status === "completed" ||
        (gameState.status === "waiting" && myState.name)) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-roma-stone/10 p-6 rounded border border-roma-gold/30">
            <h3 className="text-xl font-cinzel text-roma-gold mb-2">
              {myState.name} (You)
            </h3>
            <div
              className={`mb-4 text-3xl font-nums tracking-widest text-center bg-roma-black p-4 rounded border transition-colors ${
                myState.secret ? "border-roma-gold" : "border-roma-stone/30"
              }`}
            >
              {myState.secret || "????"}
            </div>

            <div className="h-64 overflow-y-auto custom-scrollbar mb-4 space-y-2">
              {myState.guesses.map((g, i) => (
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

            {gameState.status !== "completed" && (
              <>
                <div className="h-10 text-center mb-2">
                  {inputError ? (
                    <p className="text-roma-red">{inputError}</p>
                  ) : (
                    <p className="text-roma-sand">{getStatusMessage()}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={4}
                    value={input}
                    onChange={(e) =>
                      setInput(e.target.value.replace(/\D/g, ""))
                    }
                    placeholder={!myState.secret ? "Set Secret" : "Enter Guess"}
                    className={`flex-1 bg-roma-black border p-2 rounded text-white text-center font-nums tracking-widest ${
                      inputError
                        ? "border-roma-red"
                        : "border-roma-stone focus:border-roma-gold"
                    }`}
                    disabled={
                      !!myState.secret &&
                      (gameState.status === "setup" || !isMyTurn)
                    }
                  />
                  <button
                    onClick={handleAction}
                    disabled={
                      input.length !== 4 ||
                      (!!myState.secret &&
                        (gameState.status === "setup" || !isMyTurn))
                    }
                    className="bg-roma-gold text-roma-black font-bold px-4 rounded disabled:opacity-50"
                  >
                    Submit
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="bg-roma-stone/10 p-6 rounded border border-roma-stone/30 opacity-80">
            <h3 className="text-xl font-cinzel text-roma-stone mb-2">
              {oppState.name || "Opponent"}
            </h3>
            <div className="mb-4 text-3xl font-nums tracking-widest text-center bg-roma-black p-4 rounded border border-roma-stone/30 text-roma-stone">
              {gameState.status === "completed" ? oppState.secret : "????"}
            </div>

            <div className="h-64 overflow-y-auto custom-scrollbar space-y-2">
              {oppState.guesses.map((g, i) => (
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
      )}
    </div>
  );
}
