import { useEffect, useState } from "react";
import { RefreshCw, Trophy } from "lucide-react";
import BackToLobby from "../components/BackToLobby";

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
          "url(https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1600&q=80&auto=format)",
      }}
    >
      <div className="pillar-side left-0 border-r border-stone-800"></div>
      <div className="pillar-side right-0 border-l border-stone-800"></div>

      <div className="p-4 md:p-8 max-w-5xl mx-auto relative z-10">
        <BackToLobby />

        <header className="mb-12 text-center mt-12">
          <h1 className="text-4xl md:text-6xl font-cinzel font-bold text-gold-gradient mb-4 drop-shadow-lg">
            The Archives
          </h1>
          <p className="text-stone-400 font-cinzel tracking-widest uppercase text-sm">
            History of the Fallen and the Victorious
          </p>
        </header>

        <div className="card-legendary p-8 md:p-12">
          <div className="flex justify-between items-center mb-8 border-b border-stone-800 pb-4">
            <h2 className="text-2xl md:text-3xl font-cinzel text-stone-300 flex items-center gap-3">
              <Trophy className="text-amber-500" /> Recorded Battles
            </h2>
            <button
              onClick={fetchHistory}
              disabled={loading}
              className="text-stone-500 hover:text-amber-400 disabled:opacity-50 transition-colors p-2 hover:bg-stone-800 rounded-full"
            >
              <RefreshCw
                className={`h-6 w-6 ${loading ? "animate-spin" : ""}`}
              />
            </button>
          </div>

          <div className="custom-scrollbar pr-2">
            {loading && history.length === 0 ? (
              <p className="text-stone-500 italic text-center py-12 font-cinzel">
                Unrolling scrolls...
              </p>
            ) : history.length === 0 ? (
              <p className="text-stone-500 italic text-center py-12 font-cinzel">
                No battles recorded in the archives.
              </p>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead className="text-stone-500 font-cinzel text-xs uppercase tracking-widest sticky top-0 bg-stone-900/95 backdrop-blur-sm z-10">
                  <tr>
                    <th className="p-4 border-b border-stone-800">Date</th>
                    <th className="p-4 border-b border-stone-800">Victor</th>
                    <th className="p-4 border-b border-stone-800">
                      Combatants
                    </th>
                  </tr>
                </thead>
                <tbody className="text-lg">
                  {history.map((game, index) => (
                    <tr
                      key={index}
                      className="hover:bg-white/5 transition-colors border-b border-stone-800/50 last:border-0"
                    >
                      <td className="p-4 text-stone-500 font-mono text-sm">
                        {new Date(game.timestamp).toLocaleString()}
                      </td>
                      <td className="p-4 font-bold text-amber-500 font-cinzel">
                        {game.winner}
                      </td>
                      <td className="p-4 text-stone-300">
                        {game.p1Name}{" "}
                        <span className="text-stone-600 text-sm mx-2">VS</span>{" "}
                        {game.p2Name}
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
