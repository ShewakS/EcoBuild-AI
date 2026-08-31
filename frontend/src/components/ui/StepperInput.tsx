"use client";

interface StepperInputProps {
  id?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  label?: string;
  className?: string;
}

export function StepperInput({
  id,
  value,
  onChange,
  min = 0,
  max = 99,
  label,
  className = "",
}: StepperInputProps) {
  const decrement = () => {
    if (value > min) onChange(value - 1);
  };
  const increment = () => {
    if (value < max) onChange(value + 1);
  };

  return (
    <div id={id} className={`flex items-center gap-3 ${className}`}>
      <button
        type="button"
        onClick={decrement}
        disabled={value <= min}
        aria-label={`Decrease ${label}`}
        className="w-9 h-9 rounded-full bg-[#EDE8DC] text-[#1A4D2E] text-xl font-bold flex items-center justify-center hover:bg-[#1A4D2E] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#1A4D2E]/40"
      >
        −
      </button>
      <span className="w-10 text-center text-xl font-semibold text-[#1A4D2E] tabular-nums">
        {value}
      </span>
      <button
        type="button"
        onClick={increment}
        disabled={value >= max}
        aria-label={`Increase ${label}`}
        className="w-9 h-9 rounded-full bg-[#EDE8DC] text-[#1A4D2E] text-xl font-bold flex items-center justify-center hover:bg-[#1A4D2E] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#1A4D2E]/40"
      >
        +
      </button>
    </div>
  );
}
