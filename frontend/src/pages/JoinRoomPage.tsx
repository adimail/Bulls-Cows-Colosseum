import BackToLobby from "../components/BackToLobby";
import LegendaryCard from "../components/ui/LegendaryCard";
import RoomCodeForm from "../components/forms/RoomCodeForm";

export default function JoinRoomPage() {
  return (
    <div
      className="min-h-screen bg-image-overlay text-parchment font-roman flex items-center justify-center p-4 md:flex-row flex-col md:gap-0 gap-8"
      style={{
        backgroundImage:
          "url(https://images.unsplash.com/photo-1714259184249-b3f85962cfda?q=80&w=2672&auto=format&fit=crop)",
      }}
    >
      <BackToLobby />
      <div className="pillar-side left-0 border-r border-stone-800"></div>
      <div className="pillar-side right-0 border-l border-stone-800"></div>

      <div className="w-full max-w-lg">
        <LegendaryCard title="Join Arena">
          <RoomCodeForm />
        </LegendaryCard>
      </div>
    </div>
  );
}
