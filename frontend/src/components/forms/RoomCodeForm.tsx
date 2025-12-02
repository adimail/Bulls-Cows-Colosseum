import { useState } from "react";
import { useNavigate } from "react-router-dom";
import StoneInput from "../ui/StoneInput";
import LegendaryButton from "../ui/LegendaryButton";

interface RoomCodeFormProps {
  variant?: "default" | "inline";
}

export default function RoomCodeForm({
  variant = "default",
}: RoomCodeFormProps) {
  const [code, setCode] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length === 6) {
      navigate(`/room/${code}`);
    }
  };

  if (variant === "inline") {
    return (
      <div className="flex flex-col md:flex-row gap-4">
        <StoneInput
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          maxLength={6}
          placeholder="ROOM CODE"
          className="text-xl uppercase placeholder:text-stone-700"
          containerClassName="flex-1"
        />
        <LegendaryButton
          onClick={handleSubmit}
          disabled={code.length !== 6}
          className="px-10 w-full md:w-auto"
        >
          Join
        </LegendaryButton>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 w-full">
      <StoneInput
        label="Room Code"
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        maxLength={6}
        placeholder="XY12Z3"
        className="text-2xl uppercase tracking-[0.5em]"
        autoFocus
        required
      />
      <LegendaryButton
        type="submit"
        className="w-full"
        disabled={code.length !== 6}
      >
        Enter Battle
      </LegendaryButton>
    </form>
  );
}
