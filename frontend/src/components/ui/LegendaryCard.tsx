import { ReactNode } from "react";

interface LegendaryCardProps {
  children: ReactNode;
  className?: string;
  title?: string;
}

export default function LegendaryCard({
  children,
  className = "",
  title,
}: LegendaryCardProps) {
  return (
    <div
      className={`card-legendary p-8 md:p-12 animate-in fade-in zoom-in duration-500 ${className}`}
    >
      {title && (
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-cinzel font-bold text-gold-gradient mb-2 drop-shadow-lg">
            {title}
          </h2>
          <div className="h-1 w-24 bg-gradient-to-r from-transparent via-amber-600 to-transparent mx-auto"></div>
        </div>
      )}
      {children}
    </div>
  );
}
