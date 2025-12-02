import { ButtonHTMLAttributes } from "react";

interface LegendaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "gold" | "crimson";
}

export default function LegendaryButton({
  children,
  variant = "gold",
  className = "",
  ...props
}: LegendaryButtonProps) {
  const variantClass = variant === "crimson" ? "btn-crimson" : "btn-gold";

  return (
    <button className={`btn-legendary ${variantClass} ${className}`} {...props}>
      {children}
    </button>
  );
}
