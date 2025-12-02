import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGameStore } from "../stores/useGameStore";
import { BellRing, Copy, LogOut, Shield, Sword, Loader } from "lucide-react";
import BackToLobby from "../components/BackToLobby";
import LegendaryCard from "../components/ui/LegendaryCard";
import LegendaryButton from "../components/ui/LegendaryButton";
import PlayerNameForm from "../components/forms/PlayerNameForm";

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
  const [inputError, setInputError] = useState<string | null>(null);
  const [canPoke, setCanPoke] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [fetchStatus, setFetchStatus] = useState<
    "loading" | "error" | "success"
  >("loading");
  const [roomInfo, setRoomInfo] = useState<{
    exists: boolean;
    ownerName: string;
  }>({ exists: false, ownerName: "" });

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

  useEffect(() => {
    if (gameState) return;
    if (!gameId) return;

    setFetchStatus("loading");

    fetch(`/api/room/${gameId}`)
      .then(async (res) => {
        if (res.status === 404) {
          setRoomInfo({ exists: false, ownerName: "" });
          setFetchStatus("success");
          return;
        }
        if (res.ok) {
          const data = await res.json();
          setRoomInfo({
            exists: true,
            ownerName: data.ownerName,
          });
          setFetchStatus("success");
        } else {
          setFetchStatus("error");
        }
      })
      .catch(() => {
        setFetchStatus("error");
      });
  }, [gameId, gameState]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [gameState?.p1.guesses, gameState?.p2.guesses]);

  const handlePoke = () => {
    if (!canPoke) return;
    pokeOpponent();
    setCanPoke(false);
    setTimeout(() => setCanPoke(true), 10000);
  };

  if (!gameState) {
    if (globalError && !inputError) {
      return (
        <div className="min-h-screen bg-image-overlay flex flex-col items-center justify-center p-4">
          <BackToLobby />
          <LegendaryCard
            title="Access Denied"
            className="max-w-md w-full text-center"
          >
            <p className="text-lg mb-8 text-stone-300">{globalError}</p>
            <LegendaryButton onClick={() => navigate("/")}>
              Return to Lobby
            </LegendaryButton>
          </LegendaryCard>
        </div>
      );
    }

    if (fetchStatus === "loading") {
      return (
        <div className="min-h-screen bg-image-overlay flex flex-col items-center justify-center p-4 text-parchment">
          <Loader className="w-12 h-12 animate-spin text-amber-500 mb-4" />
          <p className="font-cinzel text-xl">Consulting the oracles...</p>
        </div>
      );
    }

    if (fetchStatus === "error") {
      return (
        <div className="min-h-screen bg-image-overlay flex flex-col items-center justify-center p-4">
          <LegendaryCard title="Error" className="max-w-md w-full text-center">
            <p className="text-lg mb-8 text-stone-300">
              There was an error retrieving room details.
            </p>
            <LegendaryButton onClick={() => navigate("/")}>
              Return to Lobby
            </LegendaryButton>
          </LegendaryCard>
        </div>
      );
    }

    if (!roomInfo.exists) {
      return (
        <div className="min-h-screen bg-image-overlay flex flex-col items-center justify-center p-4">
          <BackToLobby />
          <LegendaryCard
            title="Arena Not Found"
            className="max-w-md w-full text-center"
          >
            <p className="text-lg mb-8 text-stone-300">
              The room <strong className="text-amber-500">{gameId}</strong> does
              not exist.
            </p>
            <LegendaryButton onClick={() => navigate("/")}>
              Return to Lobby
            </LegendaryButton>
          </LegendaryCard>
        </div>
      );
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
        <div className="w-full max-w-md">
          <LegendaryCard title={`Join ${roomInfo.ownerName}'s Room`}>
            <PlayerNameForm
              onSubmit={(name) => gameId && joinRoom(name, gameId)}
              buttonText="Enter Arena"
            />
          </LegendaryCard>
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

  const handleAction = (e?: React.FormEvent) => {
    e?.preventDefault();
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
    if (confirm("Are you sure you want to flee the arena?")) {
      leaveRoom();
      navigate("/");
    }
  };

  const getStatusMessage = () => {
    if (gameState.status === "completed") return "Battle Concluded";
    if (!myState.secret) {
      return "Carve your secret code into the stone.";
    }
    if (gameState.status === "setup") {
      return `Waiting for ${oppState.name || "opponent"} to prepare...`;
    }
    if (gameState.status === "active") {
      if (isMyTurn) {
        return "It is your turn to strike!";
      }
      return `${oppState.name || "Opponent"} is strategizing...`;
    }
    return "";
  };

  const renderRematchControls = () => {
    if (!myState.isReady && !oppState.isReady) {
      return (
        <LegendaryButton onClick={restartGame}>Challenge Again</LegendaryButton>
      );
    }
    if (myState.isReady && !oppState.isReady) {
      return (
        <LegendaryButton disabled className="opacity-70">
          Awaiting Opponent...
        </LegendaryButton>
      );
    }
    if (!myState.isReady && oppState.isReady) {
      return (
        <div className="flex flex-col gap-4 w-full">
          <p className="text-stone-400 italic text-center">
            {oppState.name} demands a rematch!
          </p>
          <LegendaryButton onClick={restartGame}>
            Accept Challenge
          </LegendaryButton>
        </div>
      );
    }
    return (
      <LegendaryButton disabled className="opacity-70">
        Preparing Arena...
      </LegendaryButton>
    );
  };

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
          <div className="ml-12 md:ml-0 pl-12 md:pl-0">
            <h1 className="text-xl md:text-2xl font-cinzel font-bold text-gold-gradient">
              Room: {gameState.roomCode}
            </h1>
            <div className="flex gap-4 text-xs font-cinzel text-stone-500 tracking-widest uppercase">
              <span>Status: {gameState.status}</span>
              <span>Spectators: {gameState.spectators}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
            }}
            className="p-2 text-stone-400 hover:text-amber-400 transition-colors"
            title="Copy Link"
          >
            <Copy size={20} />
          </button>
          <button
            onClick={handleLeave}
            className="p-2 text-stone-400 hover:text-crimson transition-colors"
            title="Leave Room"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="flex-grow relative z-10 p-4 md:p-8 overflow-y-auto custom-scrollbar pb-40">
        {gameState.status === "completed" && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <LegendaryCard className="text-center max-w-lg w-full">
              <h2 className="text-4xl md:text-5xl font-cinzel font-black text-gold-gradient mb-2 drop-shadow-lg">
                {gameState.winner === playerId ? "VICTORY" : "DEFEAT"}
              </h2>
              <p className="text-xl text-stone-300 font-roman italic mb-8">
                {gameState.winner === playerId
                  ? "The gods smile upon you."
                  : "You have fallen in battle."}
              </p>

              <div className="flex flex-col items-center gap-4">
                {renderRematchControls()}
                <button
                  onClick={() => {
                    leaveRoom();
                    navigate("/");
                  }}
                  className="text-stone-500 hover:text-stone-300 font-cinzel text-sm mt-4 uppercase tracking-widest"
                >
                  Return to Lobby
                </button>
              </div>
            </LegendaryCard>
          </div>
        )}

        {gameState.status === "waiting" && !myState.name && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <LegendaryCard className="max-w-2xl">
              <h2 className="text-3xl font-cinzel text-stone-300 mb-6">
                Awaiting Challenger
              </h2>
              <p className="text-xl text-stone-400 mb-8">
                Share this code to summon an opponent:
              </p>
              <div className="text-5xl font-cinzel font-bold text-gold-gradient tracking-[0.5em] mb-8 bg-black/30 p-6 rounded border border-stone-800">
                {gameState.roomCode}
              </div>
              <div className="animate-pulse text-stone-600 font-cinzel text-sm uppercase tracking-widest">
                The crowd is getting restless...
              </div>
            </LegendaryCard>
          </div>
        )}

        {(gameState.status === "setup" ||
          gameState.status === "active" ||
          gameState.status === "completed" ||
          (gameState.status === "waiting" && myState.name)) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto h-full">
            <div className="flex flex-col h-full">
              <div className="card-legendary flex-grow flex flex-col p-1">
                <div className="bg-stone-900/90 flex-grow p-4 md:p-6 flex flex-col border border-stone-800">
                  <div className="flex items-center justify-between mb-6 border-b border-stone-800 pb-4">
                    <h3 className="text-xl font-cinzel font-bold text-amber-500 flex items-center gap-2">
                      <Shield size={20} /> {myState.name}
                    </h3>
                    {isMyTurn && gameState.status === "active" && (
                      <span className="px-3 py-1 bg-amber-900/30 border border-amber-700/50 text-amber-500 text-xs font-cinzel uppercase tracking-widest animate-pulse">
                        Your Turn
                      </span>
                    )}
                  </div>

                  <div className="mb-6">
                    <div className="text-center mb-2 text-stone-500 font-cinzel text-xs uppercase tracking-widest">
                      Secret Code
                    </div>
                    <div
                      className={`text-3xl md:text-4xl font-nums tracking-[0.5em] text-center py-6 bg-black/40 border-2 ${
                        myState.secret
                          ? "border-amber-700/50 text-amber-100 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]"
                          : "border-stone-800 text-stone-700 border-dashed"
                      }`}
                    >
                      {myState.secret || "????"}
                    </div>
                  </div>

                  <div className="flex-grow overflow-hidden flex flex-col">
                    <div className="text-stone-500 font-cinzel text-xs uppercase tracking-widest mb-2 flex justify-between px-2">
                      <span>History</span>
                      <span>B / C</span>
                    </div>
                    <div
                      className="flex-grow overflow-y-auto custom-scrollbar space-y-1 bg-black/20 p-2 border border-stone-800/50"
                      ref={scrollRef}
                    >
                      {myState.guesses.map((g, i) => (
                        <div
                          key={i}
                          className="flex justify-between items-center p-3 bg-stone-800/30 border-b border-stone-800 last:border-0"
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
                      {myState.guesses.length === 0 && (
                        <div className="text-center text-stone-700 italic py-10">
                          No attempts made yet.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col h-full">
              <div className="card-legendary flex-grow flex flex-col p-1 border-stone-700">
                <div className="bg-stone-900/90 flex-grow p-4 md:p-6 flex flex-col border border-stone-800">
                  <div className="flex items-center justify-between mb-6 border-b border-stone-800 pb-4">
                    <h3 className="text-xl font-cinzel font-bold text-stone-400 flex items-center gap-2">
                      <Sword size={20} /> {oppState.name || "Opponent"}
                    </h3>
                    {showPokeButton && (
                      <button
                        onClick={handlePoke}
                        disabled={!canPoke}
                        className="flex items-center gap-2 text-xs font-cinzel uppercase tracking-widest text-stone-500 hover:text-amber-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <BellRing size={14} />
                        {canPoke ? "Provoke" : "Cooldown"}
                      </button>
                    )}
                  </div>

                  <div className="mb-6">
                    <div className="text-center mb-2 text-stone-500 font-cinzel text-xs uppercase tracking-widest">
                      Enemy Secret
                    </div>
                    <div className="text-3xl md:text-4xl font-nums tracking-[0.5em] text-center py-6 bg-black/40 border-2 border-stone-800 text-stone-600 shadow-inner">
                      {gameState.status === "completed"
                        ? oppState.secret
                        : "????"}
                    </div>
                  </div>

                  <div className="flex-grow overflow-hidden flex flex-col">
                    <div className="text-stone-500 font-cinzel text-xs uppercase tracking-widest mb-2 flex justify-between px-2">
                      <span>Enemy Strikes</span>
                      <span>B / C</span>
                    </div>
                    <div className="flex-grow overflow-y-auto custom-scrollbar space-y-1 bg-black/20 p-2 border border-stone-800/50">
                      {oppState.guesses.map((g, i) => (
                        <div
                          key={i}
                          className="flex justify-between items-center p-3 bg-stone-800/30 border-b border-stone-800 last:border-0"
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
                      {oppState.guesses.length === 0 && (
                        <div className="text-center text-stone-700 italic py-10">
                          The enemy has not struck yet.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {gameState.status !== "completed" && (
        <div className="fixed bottom-0 left-0 right-0 z-40 p-4 bg-gradient-to-t from-black via-black/95 to-transparent pt-12">
          <div className="max-w-lg mx-auto">
            <div className="text-center mb-4 h-6">
              {inputError ? (
                <p className="text-crimson font-cinzel font-bold animate-pulse">
                  {inputError}
                </p>
              ) : (
                <p className="text-stone-400 font-cinzel text-sm tracking-widest uppercase">
                  {getStatusMessage()}
                </p>
              )}
            </div>

            <form onSubmit={handleAction} className="flex gap-4">
              <div className="relative flex-1">
                <input
                  type="text"
                  maxLength={4}
                  value={input}
                  onChange={(e) => setInput(e.target.value.replace(/\D/g, ""))}
                  placeholder={!myState.secret ? "SET CODE" : "GUESS"}
                  className={`w-full bg-stone-900 border-2 p-4 text-center font-nums text-2xl tracking-[0.5em] text-amber-100 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] outline-none transition-colors ${
                    inputError
                      ? "border-crimson"
                      : "border-stone-600 focus:border-amber-600"
                  }`}
                  disabled={
                    !!myState.secret &&
                    (gameState.status === "setup" || !isMyTurn)
                  }
                />
                <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-amber-700 pointer-events-none"></div>
                <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-amber-700 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-amber-700 pointer-events-none"></div>
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-amber-700 pointer-events-none"></div>
              </div>

              <LegendaryButton
                type="submit"
                disabled={
                  input.length !== 4 ||
                  (!!myState.secret &&
                    (gameState.status === "setup" || !isMyTurn))
                }
                className="px-8 w-auto"
              >
                {!myState.secret ? "Lock" : "Strike"}
              </LegendaryButton>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
