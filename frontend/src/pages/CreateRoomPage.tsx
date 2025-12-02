import { useNavigate } from "react-router-dom";
import { useGameStore } from "../stores/useGameStore";
import LegendaryCard from "../components/ui/LegendaryCard";
import PlayerNameForm from "../components/forms/PlayerNameForm";

export default function CreateRoomPage() {
  const createRoom = useGameStore((state) => state.createRoom);
  const gameState = useGameStore((state) => state.gameState);
  const navigate = useNavigate();

  if (gameState?.roomCode) {
    navigate(`/room/${gameState.roomCode}`);
    return null;
  }

  return (
    <div
      className="min-h-screen bg-image-overlay text-parchment font-roman flex items-center justify-center p-4 md:flex-row flex-col md:gap-0 gap-8"
      style={{
        backgroundImage:
          "url(https://images.unsplash.com/photo-1714259184249-b3f85962cfda?q=80&w=2672&auto=format&fit=crop)",
      }}
    >
      <div className="w-full max-w-lg">
        <LegendaryCard title="Create Room">
          <PlayerNameForm
            onSubmit={createRoom}
            buttonText="Establish Arena"
            variant="crimson"
          />
        </LegendaryCard>
      </div>
    </div>
  );
}
