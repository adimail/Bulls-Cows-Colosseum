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
    <div
      className="min-h-screen bg-image-overlay text-parchment font-roman"
      style={{
        backgroundImage:
          "url(https://images.unsplash.com/photo-1509024644558-2f56ce76c490?q=80&w=2670&auto=format&fit=crop)",
      }}
    >
      <div className="p-8">
        <header className="mb-8 text-center">
          <h1 className="text-5xl font-cinzel text-bronze mb-4">
            Game History
          </h1>
          <Link
            to="/"
            className="text-stone-light hover:text-bronze transition-colors"
          >
            &larr; Back to Lobby
          </Link>
        </header>

        <div className="max-w-4xl mx-auto bg-dark-card/80 backdrop-blur-sm p-8 border border-bronze/30">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-cinzel text-stone-light">
              All Matches
            </h2>
            <button
              onClick={fetchHistory}
              disabled={loading}
              className="text-stone-light hover:text-bronze disabled:opacity-50 transition-colors"
            >
              <RefreshCw
                className={`h-6 w-6 ${loading ? "animate-spin" : ""}`}
              />
            </button>
          </div>
          <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
            {loading && history.length === 0 ? (
              <p className="text-stone-light italic">Loading history...</p>
            ) : history.length === 0 ? (
              <p className="text-stone-light italic">No matches found.</p>
            ) : (
              <table className="w-full text-left">
                <thead className="text-stone-light uppercase text-sm sticky top-0 bg-dark-card/80 backdrop-blur-sm">
                  <tr>
                    <th className="p-3">Date</th>
                    <th className="p-3">Winner</th>
                    <th className="p-3">Players</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-bronze/20">
                  {history.map((game, index) => (
                    <tr key={index} className="hover:bg-dark-stone/30">
                      <td className="p-3 text-stone-light">
                        {new Date(game.timestamp).toLocaleString()}
                      </td>

                      <td className="p-3 font-bold text-bronze">
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
    </div>
  );
}
