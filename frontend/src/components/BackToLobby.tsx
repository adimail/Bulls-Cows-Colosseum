import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function BackToLobby() {
  return (
    <Link
      to="/"
      className="z-50 flex items-center gap-3 text-stone-500 hover:text-amber-400 transition-all"
    >
      <div className="p-3 border-2 border-stone-800 hover:border-amber-500/50 rounded-full bg-black/60 backdrop-blur-sm shadow-lg transition-colors">
        <ArrowLeft size={20} />
      </div>
    </Link>
  );
}
