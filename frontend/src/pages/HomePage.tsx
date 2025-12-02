import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { RefreshCw, Swords, Scroll, Trophy, Users } from "lucide-react";
import RoomCodeForm from "../components/forms/RoomCodeForm";
import LegendaryCard from "../components/ui/LegendaryCard";
import LegendaryButton from "../components/ui/LegendaryButton";

interface RoomInfo {
  roomCode: string;
  ownerName: string;
  playerCount: number;
  status: string;
  createdAt: string;
}

interface GameHistory {
  timestamp: string;
  p1Name: string;
  p2Name: string;
  winner: string;
}

export default function HomePage() {
  const [rooms, setRooms] = useState<RoomInfo[]>([]);
  const [history, setHistory] = useState<GameHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [serverStatus, setServerStatus] = useState<
    "checking" | "online" | "offline"
  >("checking");

  useEffect(() => {
    let intervalId: number;
    let timeoutId: number;

    const checkHealth = async () => {
      try {
        const response = await fetch("/api/health");
        if (response.ok) {
          setServerStatus("online");
          clearInterval(intervalId);
          clearTimeout(timeoutId);
        }
      } catch (error) {
        console.log("Server health check failed, retrying...");
      }
    };

    checkHealth();
    intervalId = setInterval(checkHealth, 3000);
    timeoutId = setTimeout(() => {
      if (serverStatus === "checking") {
        setServerStatus("offline");
        clearInterval(intervalId);
      }
    }, 50000);

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, [serverStatus]);

  const fetchRooms = () => {
    setLoading(true);
    fetch("/api/rooms")
      .then((res) => res.json())
      .then((data) => setRooms(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  const fetchHistory = () => {
    setHistoryLoading(true);
    fetch("/api/games")
      .then((res) => {
        if (!res.ok) {
          return [];
        }
        return res.json();
      })
      .then((data) => setHistory(data || []))
      .catch((err) => console.error(err))
      .finally(() => setHistoryLoading(false));
  };

  useEffect(() => {
    if (serverStatus === "online") {
      fetchRooms();
      fetchHistory();
    }
  }, [serverStatus]);

  const StatusScreen = ({
    title,
    message,
  }: {
    title: string;
    message: string;
  }) => (
    <div
      className="min-h-screen bg-image-overlay text-parchment font-roman flex items-center justify-center p-4 text-center"
      style={{
        backgroundImage:
          "url(https://images.unsplash.com/photo-1746558071199-ec38d4eb8bbd?q=80&w=1287&auto=format&fit=crop)",
      }}
    >
      <LegendaryCard className="max-w-2xl">
        <h1 className="text-4xl md:text-5xl font-cinzel text-gold-gradient mb-6 drop-shadow-lg">
          {title}
        </h1>
        <p className="text-xl text-stone-300 font-roman italic">{message}</p>
      </LegendaryCard>
    </div>
  );

  if (serverStatus === "checking") {
    return (
      <StatusScreen
        title="Summoning the Legions..."
        message="The gates of the Colosseum are opening. Prepare yourself, Gladiator."
      />
    );
  }

  if (serverStatus === "offline") {
    return (
      <StatusScreen
        title="The Arena is Silent"
        message="The gods are not favoring us today. The server could not be reached."
      />
    );
  }

  return (
    <div
      className="min-h-screen bg-image-overlay text-parchment font-roman overflow-x-hidden"
      style={{
        backgroundImage:
          "url(https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1600&q=80&auto=format)",
      }}
    >
      <div className="pillar-side left-0 border-r border-stone-800"></div>
      <div className="pillar-side right-0 border-l border-stone-800"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-12 md:py-20">
        <header className="mb-16 text-center relative">
          <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-yellow-900/50 to-transparent -z-10"></div>
          <h1 className="text-5xl md:text-7xl font-cinzel font-black text-gold-gradient mb-4 tracking-tighter drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]">
            COLOSSEUM
          </h1>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 text-stone-400 font-cinzel tracking-widest text-sm md:text-base uppercase">
            <span className="flex items-center gap-2">
              <Swords size={16} className="text-crimson" /> Bulls & Cows
            </span>
            <span className="hidden md:inline text-yellow-900">•</span>
            <Link
              to="/help"
              className="hover:text-amber-400 transition-colors flex items-center gap-2"
            >
              <Scroll size={16} /> Rules of Engagement
            </Link>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
          <div className="lg:col-span-7 space-y-12 sticky top-0">
            <LegendaryCard className="p-3 md:p-5">
              <h2 className="text-2xl font-cinzel text-amber-100 mb-8 flex items-center gap-3 border-b border-stone-800 pb-4">
                <Swords className="text-crimson" /> Enter the Arena
              </h2>
              <div className="space-y-5">
                <Link to="/create" className="block group">
                  <LegendaryButton
                    variant="crimson"
                    className="md:text-lg md:py-4 px-0 w-full"
                  >
                    Create New Game
                  </LegendaryButton>
                </Link>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-stone-800"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-[#151210] text-stone-500 font-cinzel uppercase tracking-widest">
                      Or Join Existing
                    </span>
                  </div>
                </div>

                <RoomCodeForm variant="inline" />
              </div>
            </LegendaryCard>

            <LegendaryCard className="p-3 md:p-5">
              <div className="flex justify-between items-center mb-8 border-b border-stone-800 pb-4">
                <h2 className="text-xl md:text-2xl font-cinzel text-stone-300 flex items-center gap-3">
                  <Users className="text-amber-600" /> Public Lobby
                </h2>
                <button
                  onClick={fetchRooms}
                  disabled={loading}
                  className="text-stone-500 hover:text-amber-400 transition-colors p-2 hover:bg-stone-800 rounded-full"
                >
                  <RefreshCw
                    className={`h-6 w-6 ${loading ? "animate-spin" : ""}`}
                  />
                </button>
              </div>

              <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                {loading && rooms.length === 0 ? (
                  <div className="text-center py-12 text-stone-600 italic font-cinzel">
                    Scouting for battles...
                  </div>
                ) : rooms.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-stone-800 rounded-lg">
                    <p className="text-stone-500 font-cinzel mb-2">
                      The arena is empty.
                    </p>
                    <p className="text-stone-600 text-sm">
                      Be the first to start a match.
                    </p>
                  </div>
                ) : (
                  rooms.map((room) => (
                    <div
                      key={room.roomCode}
                      className="group flex flex-col md:flex-row justify-between items-center p-6 bg-stone-900/40 border border-stone-800 hover:border-amber-700/50 transition-all duration-300 hover:bg-stone-900/80"
                    >
                      <div className="mb-4 md:mb-0 text-center md:text-left">
                        <p className="font-cinzel font-bold text-amber-100 text-lg group-hover:text-gold-gradient">
                          {room.ownerName}
                        </p>
                        <p className="text-xs text-stone-500 font-mono tracking-widest mt-1">
                          CODE:{" "}
                          <span className="text-stone-300">
                            {room.roomCode}
                          </span>
                        </p>
                      </div>
                      {room.playerCount >= 2 ? (
                        <Link to={`/spectate/${room.roomCode}`}>
                          <button className="px-6 py-2 border border-stone-600 text-stone-400 font-cinzel text-sm hover:border-amber-500 hover:text-amber-500 transition-colors uppercase tracking-wider">
                            Spectate
                          </button>
                        </Link>
                      ) : (
                        <Link to={`/room/${room.roomCode}`}>
                          <button className="px-8 py-2 bg-amber-900/20 border border-amber-900/50 text-amber-500 font-cinzel font-bold text-sm hover:bg-amber-900/40 hover:border-amber-500 transition-all uppercase tracking-wider shadow-[0_0_15px_rgba(180,83,9,0.1)] hover:shadow-[0_0_20px_rgba(180,83,9,0.3)]">
                            Challenge
                          </button>
                        </Link>
                      )}
                    </div>
                  ))
                )}
              </div>
            </LegendaryCard>
          </div>

          <div className="lg:col-span-5">
            <LegendaryCard className="p-3 md:p-5 h-full border-t-4 border-t-amber-700">
              <div className="flex md:flex-row flex-col md:justify-between items-center mb-8 border-b border-stone-800 pb-4 gap-3 md:gap-0">
                <h2 className="text-xl font-cinzel text-stone-300 flex items-center gap-3">
                  <Trophy className="text-yellow-500" /> Hall of Fame
                </h2>
                <div className="flex items-center gap-3">
                  <Link
                    to="/games"
                    className="text-xs font-cinzel text-stone-500 hover:text-amber-400 uppercase tracking-widest"
                  >
                    View All
                  </Link>
                  <button
                    onClick={fetchHistory}
                    disabled={historyLoading}
                    className="text-stone-500 hover:text-amber-400 transition-colors"
                  >
                    <RefreshCw
                      className={`h-5 w-5 ${
                        historyLoading ? "animate-spin" : ""
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="space-y-1 custom-scrollbar pr-2">
                {historyLoading && history.length === 0 ? (
                  <div className="text-center py-12 text-stone-600 italic">
                    Consulting the scrolls...
                  </div>
                ) : history.length === 0 ? (
                  <div className="text-center py-12 text-stone-600 italic">
                    No legends written yet.
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead className="text-stone-600 font-cinzel text-xs uppercase tracking-widest border-b border-stone-800">
                      <tr>
                        <th className="pb-3 pl-2">Victor</th>
                        <th className="pb-3">Matchup</th>
                        <th className="pb-3 text-right pr-2">Date</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm font-roman">
                      {history.map((game, index) => (
                        <tr
                          key={index}
                          className="hover:bg-white/5 transition-colors group border-b border-stone-800/50 last:border-0"
                        >
                          <td className="py-4 pl-2 font-bold text-amber-500 group-hover:text-amber-300 transition-colors">
                            {game.winner}
                          </td>
                          <td className="py-4 text-stone-400">
                            <span className="text-stone-300">
                              {game.p1Name}
                            </span>{" "}
                            <span className="text-stone-600 text-xs mx-1">
                              VS
                            </span>{" "}
                            <span className="text-stone-300">
                              {game.p2Name}
                            </span>
                          </td>
                          <td className="py-4 text-right pr-2 text-stone-600 font-mono text-xs">
                            {new Date(game.timestamp).toLocaleDateString(
                              undefined,
                              { month: "short", day: "numeric" },
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </LegendaryCard>
          </div>
        </div>
      </div>
    </div>
  );
}
