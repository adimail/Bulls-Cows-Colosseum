import { useState } from "react";
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 w-full">
      <StoneInput
        label="Gladiator Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="MAXIMUS"
        className="text-2xl"
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
    </form>
  );
}
