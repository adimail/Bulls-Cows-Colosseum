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
    <div className="min-h-screen bg-roma-black text-roma-white font-roman p-8 flex flex-col items-center">
      <header className="mb-12 text-center">
        <h1 className="text-6xl font-cinzel text-roma-gold mb-4">
          Bulls & Cows
        </h1>
        <p className="text-xl text-roma-stone">
          The Ancient Game of Code Breaking
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 w-full max-w-7xl">
        <div className="space-y-8">
          <div className="bg-roma-stone/10 p-8 rounded-lg border border-roma-bronze/30">
            <h2 className="text-3xl font-cinzel text-roma-sand mb-6">
              Start Playing
            </h2>
            <div className="space-y-4">
              <Link
                to="/create"
                className="block w-full py-4 bg-roma-red hover:bg-roma-red/80 text-center text-roma-white font-bold rounded transition-colors"
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
                  className="flex-1 bg-roma-black border border-roma-stone p-3 rounded text-roma-white focus:border-roma-gold outline-none"
                />
                <button
                  onClick={handleJoin}
                  className="px-6 bg-roma-bronze hover:bg-roma-bronze/80 text-roma-white font-bold rounded transition-colors"
                >
                  Join
                </button>
              </div>
            </div>
          </div>

          <div className="bg-roma-stone/10 p-8 rounded-lg border border-roma-bronze/30">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-cinzel text-roma-sand">
                Public Lobby
              </h2>
              <button
                onClick={fetchRooms}
                disabled={loading}
                className="text-roma-sand hover:text-roma-gold disabled:opacity-50 transition-colors"
              >
                <RefreshCw
                  className={`h-6 w-6 ${loading ? "animate-spin" : ""}`}
                />
              </button>
            </div>
            <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
              {loading && rooms.length === 0 ? (
                <p className="text-roma-stone italic">Loading rooms...</p>
              ) : rooms.length === 0 ? (
                <p className="text-roma-stone italic">
                  No open rooms available.
                </p>
              ) : (
                rooms.map((room) => (
                  <div
                    key={room.roomCode}
                    className="flex justify-between items-center p-4 bg-roma-black/50 border border-roma-stone/20 rounded"
                  >
                    <div>
                      <p className="font-bold text-roma-gold">
                        {room.ownerName}
                      </p>
                      <p className="text-sm text-roma-stone">
                        Code: {room.roomCode}
                      </p>
                    </div>
                    {room.playerCount >= 2 ? (
                      <Link
                        to={`/spectate/${room.roomCode}`}
                        className="px-4 py-2 bg-roma-stone/20 hover:bg-roma-gold hover:text-roma-black text-roma-sand border border-roma-sand rounded transition-all"
                      >
                        Spectate
                      </Link>
                    ) : (
                      <Link
                        to={`/room/${room.roomCode}`}
                        className="px-4 py-2 bg-roma-stone/20 hover:bg-roma-gold hover:text-roma-black text-roma-gold border border-roma-gold rounded transition-all"
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

        <div className="bg-roma-stone/10 p-8 rounded-lg border border-roma-bronze/30">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-cinzel text-roma-sand">
              Recent Matches
            </h2>
            <div className="flex items-center gap-4">
              <Link
                to="/games"
                className="text-roma-sand hover:text-roma-gold transition-colors text-sm font-semibold"
              >
                View All
              </Link>
              <button
                onClick={fetchHistory}
                disabled={historyLoading}
                className="text-roma-sand hover:text-roma-gold disabled:opacity-50 transition-colors"
              >
                <RefreshCw
                  className={`h-6 w-6 ${historyLoading ? "animate-spin" : ""}`}
                />
              </button>
            </div>
          </div>
          <div className="space-y-2 max-h-[600px] overflow-y-auto custom-scrollbar">
            {historyLoading && history.length === 0 ? (
              <p className="text-roma-stone italic">Loading history...</p>
            ) : history.length === 0 ? (
              <p className="text-roma-stone italic">No recent matches found.</p>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="text-roma-sand uppercase">
                  <tr>
                    <th className="p-2">Winner</th>
                    <th className="p-2">Players</th>
                    <th className="p-2">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-roma-stone/20">
                  {history.map((game, index) => (
                    <tr key={index} className="hover:bg-roma-black/30">
                      <td className="p-2 font-bold text-roma-gold">
                        {game.winner}
                      </td>
                      <td className="p-2">
                        {game.p1Name} vs {game.p2Name}
                      </td>
                      <td className="p-2 text-roma-stone">
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
  );
}
