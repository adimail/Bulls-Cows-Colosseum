import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { RefreshCw } from "lucide-react";

interface GameHistory {
  timestamp: string;
  p1Name: string;
  p2Name: string;
  winner: string;
}

export default function GamesPage() {
  const [history, setHistory] = useState<GameHistory[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = () => {
    setLoading(true);
    fetch("/api/games")
      .then((res) => {
        if (!res.ok) {
          return [];
        }
        return res.json();
      })
      .then((data) => setHistory(data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div className="min-h-screen bg-roma-black text-roma-white font-roman p-8">
      <header className="mb-8 text-center">
        <h1 className="text-5xl font-cinzel text-roma-gold mb-4">
          Game History
        </h1>
        <Link
          to="/"
          className="text-roma-sand hover:text-roma-gold transition-colors"
        >
          &larr; Back to Lobby
        </Link>
      </header>

      <div className="max-w-4xl mx-auto bg-roma-stone/10 p-8 rounded-lg border border-roma-bronze/30">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-cinzel text-roma-sand">All Matches</h2>
          <button
            onClick={fetchHistory}
            disabled={loading}
            className="text-roma-sand hover:text-roma-gold disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`h-6 w-6 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
          {loading && history.length === 0 ? (
            <p className="text-roma-stone italic">Loading history...</p>
          ) : history.length === 0 ? (
            <p className="text-roma-stone italic">No matches found.</p>
          ) : (
            <table className="w-full text-left">
              <thead className="text-roma-sand uppercase text-sm sticky top-0 bg-roma-stone/10 backdrop-blur-sm">
                <tr>
                  <th className="p-3">Date</th>
                  <th className="p-3">Winner</th>
                  <th className="p-3">Players</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-roma-stone/20">
                {history.map((game, index) => (
                  <tr key={index} className="hover:bg-roma-black/30">
                    <td className="p-3 text-roma-stone">
                      {new Date(game.timestamp).toLocaleString()}
                    </td>

                    <td className="p-3 font-bold text-roma-gold">
                      {game.winner}
                    </td>
                    <td className="p-3">
                      {game.p1Name} vs {game.p2Name}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
