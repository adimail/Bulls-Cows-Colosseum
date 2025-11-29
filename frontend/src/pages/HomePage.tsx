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

export default function HomePage() {
  const [rooms, setRooms] = useState<RoomInfo[]>([]);
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchRooms = () => {
    setLoading(true);
    fetch("/api/rooms")
      .then((res) => res.json())
      .then((data) => setRooms(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRooms();
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full max-w-4xl">
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
              <p className="text-roma-stone italic">No open rooms available.</p>
            ) : (
              rooms.map((room) => (
                <div
                  key={room.roomCode}
                  className="flex justify-between items-center p-4 bg-roma-black/50 border border-roma-stone/20 rounded"
                >
                  <div>
                    <p className="font-bold text-roma-gold">{room.ownerName}</p>
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
    </div>
  );
}
