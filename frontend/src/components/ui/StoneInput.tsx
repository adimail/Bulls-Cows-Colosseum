import { InputHTMLAttributes } from "react";

interface StoneInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  containerClassName?: string;
}

export default function StoneInput({
  label,
  className = "",
  containerClassName = "",
  ...props
}: StoneInputProps) {
  return (
    <div className={`w-full ${containerClassName}`}>
      {label && (
        <label className="block text-stone-400 font-cinzel text-sm tracking-widest uppercase ml-1 mb-2">
          {label}
        </label>
      )}
      <input className={`input-stone ${className}`} {...props} />
    </div>
  );
}
