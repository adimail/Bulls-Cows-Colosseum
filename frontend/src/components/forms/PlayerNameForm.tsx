import { useState } from "react";
import { useNavigate } from "react-router-dom";
import StoneInput from "../ui/StoneInput";
import LegendaryButton from "../ui/LegendaryButton";

interface PlayerNameFormProps {
  onSubmit: (name: string) => void;
  buttonText: string;
  variant?: "gold" | "crimson";
}

export default function PlayerNameForm({
  onSubmit,
  buttonText,
  variant = "gold",
}: PlayerNameFormProps) {
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 w-full">
      <StoneInput
        label="Gladiator Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="MAXIMUS"
        className="text-xl"
        autoFocus
        required
      />
      <LegendaryButton
        type="submit"
        variant={variant}
        className="w-full"
        disabled={!name.trim()}
      >
        {buttonText}
      </LegendaryButton>
      <LegendaryButton
        type="button"
        variant="gold"
        className="w-full"
        onClick={() => navigate("/")}
      >
        Return to Lobby
      </LegendaryButton>
    </form>
  );
}
