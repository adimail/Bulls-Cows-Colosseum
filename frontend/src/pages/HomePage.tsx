import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { RefreshCw } from "lucide-react";

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
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const navigate = useNavigate();

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
    fetchRooms();
    fetchHistory();
  }, []);

  const handleJoin = () => {
    if (joinCode.length === 6) {
      navigate(`/room/${joinCode}`);
    }
  };

  return (
    <div
      className="min-h-screen bg-image-overlay text-parchment font-roman"
      style={{
        backgroundImage:
          "url(https://images.unsplash.com/photo-1555992828-ca4dbe41d294?q=80&w=1364&auto=format&fit=crop)",
      }}
    >
      <div
        className="min-h-screen p-4 md:p-8 flex flex-col items-center backdrop-blur-xs"
        style={{ backgroundColor: "rgba(0,0,0,0.3)" }}
      >
        <header className="mb-8 md:mb-12 text-center">
          <h1 className="text-4xl md:text-6xl font-cinzel text-bronze mb-4">
            Bulls & Cows Colosseum
          </h1>
          <div className="flex md:flex-row flex-col  items-center justify-center md:gap-6">
            <p className="text-lg md:text-xl text-stone-light">
              The Ancient Game of Code Breaking
            </p>
            <span className="hidden md:block">{" | "}</span>
            <Link
              to="/help"
              className="text-lg md:text-xl text-stone-light hover:text-bronze transition-colors"
            >
              How to Play
            </Link>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 w-full max-w-7xl">
          <div className="space-y-8 md:sticky md:top-10 md:h-fit">
            <div className="bg-dark-card/80 backdrop-blur-sm p-6 md:p-8 border border-bronze/30">
              <h2 className="text-2xl md:text-3xl font-cinzel text-stone-light mb-6">
                Start Playing
              </h2>
              <div className="space-y-4">
                <Link
                  to="/create"
                  className="block w-full py-4 bg-crimson hover:bg-crimson/80 text-center text-parchment font-bold transition-colors"
                >
                  Create New Game
                </Link>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter Room Code"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    maxLength={6}
                    className="flex-1 bg-input-bg border border-bronze/50 p-3 text-parchment focus:border-bronze outline-none"
                  />
                  <button
                    onClick={handleJoin}
                    className="px-6 bg-bronze hover:bg-bronze/80 text-dark-stone font-bold transition-colors"
                  >
                    Join
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-dark-card/80 backdrop-blur-sm p-6 md:p-8 border border-bronze/30">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl md:text-3xl font-cinzel text-stone-light">
                  Public Lobby
                </h2>
                <button
                  onClick={fetchRooms}
                  disabled={loading}
                  className="text-stone-light hover:text-bronze disabled:opacity-50 transition-colors"
                >
                  <RefreshCw
                    className={`h-6 w-6 ${loading ? "animate-spin" : ""}`}
                  />
                </button>
              </div>
              <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
                {loading && rooms.length === 0 ? (
                  <p className="text-stone-light italic">Loading rooms...</p>
                ) : rooms.length === 0 ? (
                  <p className="text-stone-light italic">
                    No open rooms available.
                  </p>
                ) : (
                  rooms.map((room) => (
                    <div
                      key={room.roomCode}
                      className="flex justify-between items-center p-4 bg-dark-stone/50 border border-bronze/20"
                    >
                      <div>
                        <p className="font-bold text-parchment">
                          {room.ownerName}
                        </p>
                        <p className="text-sm text-stone-light">
                          Code: {room.roomCode}
                        </p>
                      </div>
                      {room.playerCount >= 2 ? (
                        <Link
                          to={`/spectate/${room.roomCode}`}
                          className="px-4 py-2 bg-stone-light/20 hover:bg-bronze hover:text-dark-stone text-stone-light border border-stone-light rounded-none transition-all"
                        >
                          Spectate
                        </Link>
                      ) : (
                        <Link
                          to={`/room/${room.roomCode}`}
                          className="px-4 py-2 bg-bronze/20 hover:bg-bronze hover:text-dark-stone text-bronze border border-bronze rounded-none transition-all"
                        >
                          Join
                        </Link>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="bg-dark-card/80 backdrop-blur-sm p-6 md:p-8 border border-bronze/30 h-fit">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl md:text-3xl font-cinzel text-stone-light">
                Recent Matches
              </h2>
              <div className="flex items-center gap-4">
                <Link
                  to="/games"
                  className="text-stone-light hover:text-bronze transition-colors text-sm font-semibold"
                >
                  View All
                </Link>
                <button
                  onClick={fetchHistory}
                  disabled={historyLoading}
                  className="text-stone-light hover:text-bronze disabled:opacity-50 transition-colors"
                >
                  <RefreshCw
                    className={`h-6 w-6 ${
                      historyLoading ? "animate-spin" : ""
                    }`}
                  />
                </button>
              </div>
            </div>
            <div className="space-y-2 max-h-[600px] overflow-y-auto custom-scrollbar">
              {historyLoading && history.length === 0 ? (
                <p className="text-stone-light italic">Loading history...</p>
              ) : history.length === 0 ? (
                <p className="text-stone-light italic">
                  No recent matches found.
                </p>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead className="text-stone-light uppercase">
                    <tr>
                      <th className="p-2">Winner</th>
                      <th className="p-2">Players</th>
                      <th className="p-2">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-bronze/20">
                    {history.map((game, index) => (
                      <tr key={index} className="hover:bg-dark-stone/30">
                        <td className="p-2 font-bold text-bronze">
                          {game.winner}
                        </td>
                        <td className="p-2">
                          {game.p1Name} vs {game.p2Name}
                        </td>
                        <td className="p-2 text-stone-light">
                          {new Date(game.timestamp).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
