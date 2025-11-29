import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGameStore } from "../stores/useGameStore";
import { BellRing } from "lucide-react";

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
    pokeOpponent,
  } = useGameStore();
  const [input, setInput] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [inputError, setInputError] = useState<string | null>(null);
  const [canPoke, setCanPoke] = useState(true);

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

  const handlePoke = () => {
    if (!canPoke) return;
    pokeOpponent();
    setCanPoke(false);
    setTimeout(() => setCanPoke(true), 10000); // 10 second cooldown
  };

  if (!gameState) {
    if (globalError && !inputError) {
      return (
        <div
          className="min-h-screen bg-image-overlay text-parchment flex flex-col items-center justify-center p-4"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1509024644558-2f56ce76c490?q=80&w=2670&auto=format&fit=crop)",
          }}
        >
          <div className="w-full max-w-md bg-dark-card/80 backdrop-blur-sm p-8 border border-crimson text-center">
            <h2 className="text-3xl font-cinzel text-crimson mb-4">
              Error Joining Room
            </h2>
            <p className="text-lg mb-8">{globalError}</p>
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

    return (
      <div
        className="min-h-screen bg-image-overlay text-parchment flex items-center justify-center p-4"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1509024644558-2f56ce76c490?q=80&w=2670&auto=format&fit=crop)",
        }}
      >
        <div className="bg-dark-card/80 backdrop-blur-sm p-8 border border-bronze">
          <h2 className="text-2xl font-cinzel text-bronze mb-4">
            Join Room {gameId}
          </h2>
          <input
            type="text"
            placeholder="Enter your name"
            className="w-full bg-input-bg border border-bronze/50 p-2 mb-4 text-parchment"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
          />
          <button
            onClick={handleJoinClick}
            className="w-full bg-bronze text-dark-stone font-bold py-2"
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

  const showPokeButton =
    oppState.name &&
    ((gameState.status === "active" && !isMyTurn) ||
      (gameState.status === "setup" && myState.isReady && !oppState.isReady));

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
          className="bg-bronze text-dark-stone px-6 py-2 font-bold"
        >
          Play Again
        </button>
      );
    }
    if (myState.isReady && !oppState.isReady) {
      return (
        <button
          disabled
          className="bg-stone-light text-dark-stone px-6 py-2 font-bold opacity-70"
        >
          Waiting for Opponent...
        </button>
      );
    }
    if (!myState.isReady && oppState.isReady) {
      return (
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <p className="text-stone-light">
            {oppState.name || "Opponent"} wants a rematch!
          </p>

          <button
            onClick={restartGame}
            className="bg-bronze text-dark-stone px-6 py-2 font-bold"
          >
            Accept Rematch
          </button>
        </div>
      );
    }
    return (
      <button
        disabled
        className="bg-stone-light text-dark-stone px-6 py-2 font-bold opacity-70"
      >
        Starting...
      </button>
    );
  };

  return (
    <div
      className="min-h-screen bg-image-overlay text-parchment font-roman flex flex-col"
      style={{
        backgroundImage:
          "url(https://images.unsplash.com/photo-1509024644558-2f56ce76c490?q=80&w=2670&auto=format&fit=crop)",
      }}
    >
      <main className="flex-grow overflow-y-auto p-4 md:p-8 mb-40">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-bronze/20 pb-4 gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-cinzel text-bronze">
              Room: {gameState.roomCode}
            </h1>
            <p className="text-stone-light text-sm">
              Status: <span className="uppercase">{gameState.status}</span>
              {" | "}
              Spectators: <span>{gameState.spectators}</span>
            </p>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
              }}
              className="cursor-pointer bg-stone-light/20 px-3 py-2 text-sm md:px-4 md:py-2 md:text-base text-stone-light transition-colors hover:bg-stone-light/40"
            >
              Copy Link
            </button>
            <button
              onClick={handleLeave}
              className="cursor-pointer bg-crimson/80 px-3 py-2 text-sm md:px-4 md:py-2 md:text-base text-parchment transition-colors hover:bg-crimson"
            >
              Leave Room
            </button>
          </div>
        </header>

        {gameState.status === "completed" && (
          <div className="my-8 bg-dark-card/80 backdrop-blur-sm p-6 border border-bronze text-center flex flex-col items-center">
            <h2 className="text-3xl md:text-4xl font-cinzel text-bronze mb-4">
              Game Over
            </h2>

            <p className="text-xl md:text-2xl mb-6">
              {gameState.winner === playerId ? "You Won!" : "You Lost!"}
            </p>

            <div className="flex flex-col items-center gap-4">
              {renderRematchControls()}

              <button
                onClick={() => {
                  leaveRoom();
                  navigate("/");
                }}
                className="border border-stone-light text-stone-light px-6 py-2"
              >
                Lobby
              </button>
            </div>
          </div>
        )}

        {gameState.status === "waiting" && !myState.name && (
          <div className="text-center py-20">
            <h2 className="text-3xl md:text-4xl font-cinzel text-stone-light mb-4">
              Waiting for Opponent...
            </h2>
            <p className="text-lg md:text-xl">
              Share the room code: {gameState.roomCode}
            </p>
          </div>
        )}

        {(gameState.status === "setup" ||
          gameState.status === "active" ||
          gameState.status === "completed" ||
          (gameState.status === "waiting" && myState.name)) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
            <div className="bg-dark-card/80 backdrop-blur-sm p-4 md:p-6 border border-bronze/30">
              <h3 className="text-lg md:text-xl font-cinzel text-bronze mb-2">
                {myState.name} (You)
              </h3>
              <div
                className={`mb-4 text-2xl md:text-3xl font-nums tracking-widest text-center bg-dark-stone p-4 border transition-colors ${
                  myState.secret ? "border-bronze" : "border-bronze/30"
                }`}
              >
                {myState.secret || "????"}
              </div>

              <div className="h-48 md:h-64 overflow-y-auto custom-scrollbar mb-4 space-y-2">
                {myState.guesses.map((g, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center bg-dark-stone/50 p-2"
                  >
                    <span className="font-nums tracking-wider text-xl">
                      {g.code}
                    </span>
                    <div className="flex items-center gap-3 font-nums text-lg">
                      <span className="text-bronze font-bold w-8 text-center">
                        {g.bulls}B
                      </span>
                      <span className="text-parchment w-8 text-center">
                        {g.cows}C
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-dark-card/80 backdrop-blur-sm p-4 md:p-6 border border-bronze/30">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg md:text-xl font-cinzel text-stone-light">
                  {oppState.name || "Opponent"}
                </h3>
                {showPokeButton && (
                  <button
                    onClick={handlePoke}
                    disabled={!canPoke}
                    className="flex items-center gap-1 text-xs bg-stone-light/20 px-2 py-1 text-stone-light transition-colors hover:bg-stone-light/40 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <BellRing size={12} />
                    {canPoke ? "Poke" : "Poked"}
                  </button>
                )}
              </div>
              <div className="mb-4 text-2xl md:text-3xl font-nums tracking-widest text-center bg-dark-stone p-4 border border-bronze/30 text-stone-light">
                {gameState.status === "completed" ? oppState.secret : "????"}
              </div>

              <div className="h-48 md:h-64 overflow-y-auto custom-scrollbar space-y-2">
                {oppState.guesses.map((g, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center bg-dark-stone/50 p-2"
                  >
                    <span className="font-nums tracking-wider text-xl">
                      {g.code}
                    </span>
                    <div className="flex items-center gap-3 font-nums text-lg">
                      <span className="text-bronze font-bold w-8 text-center">
                        {g.bulls}B
                      </span>
                      <span className="text-parchment w-8 text-center">
                        {g.cows}C
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
      {gameState.status !== "completed" && (
        <div className="fixed left-0 right-0 ">
          <div className="fixed md:bottom-5 bottom-0 left-0 right-0 max-w-lg mx-auto bg-dark-stone border border-bronze/20 p-4">
            <div className="h-10 text-center">
              {inputError ? (
                <p className="text-crimson">{inputError}</p>
              ) : (
                <p className="text-stone-light">{getStatusMessage()}</p>
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                maxLength={4}
                value={input}
                onChange={(e) => setInput(e.target.value.replace(/\D/g, ""))}
                placeholder={!myState.secret ? "Set Secret" : "Enter Guess"}
                className={`flex-1 bg-input-bg border p-2 text-parchment text-center font-nums tracking-widest ${
                  inputError
                    ? "border-crimson"
                    : "border-bronze/50 focus:border-bronze"
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
                className="bg-bronze text-dark-stone font-bold px-4 disabled:opacity-50"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
