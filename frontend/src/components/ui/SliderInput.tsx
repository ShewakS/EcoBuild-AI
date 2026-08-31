"use client";

import React, { useState, useEffect } from "react";

interface PresetOption {
  label: string;
  value: number;
}

interface SliderInputProps {
  id?: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  formatValue?: (v: number) => string;
  presets?: (number | PresetOption)[];
  className?: string;
}

export function SliderInput({
  id,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit = "",
  formatValue,
  presets,
  className = "",
}: SliderInputProps) {
  // Local string state to allow smooth typing without immediately clamping while typing
  const [typedValue, setTypedValue] = useState<string>(value.toString());

  useEffect(() => {
    setTypedValue(value.toString());
  }, [value]);

  const effectiveMax = Math.max(max, value);
  const clampedValue = Math.max(min, Math.min(effectiveMax, value));
  const pct = effectiveMax > min ? ((clampedValue - min) / (effectiveMax - min)) * 100 : 0;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setTypedValue(raw);
    const num = parseFloat(raw);
    if (!isNaN(num) && num >= 0) {
      onChange(num);
    }
  };

  const handleBlur = () => {
    const num = parseFloat(typedValue);
    if (isNaN(num) || num < min) {
      onChange(min);
      setTypedValue(min.toString());
    } else {
      onChange(num);
      setTypedValue(num.toString());
    }
  };

  const handleStep = (direction: 1 | -1) => {
    const next = Math.max(min, value + direction * step);
    onChange(next);
  };

  return (
    <div id={id} className={`w-full flex flex-col gap-2.5 ${className}`}>
      {/* Top bar: Min label, Editable numeric input box with unit, Max label */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-[#7A8C6E]">
          {min.toLocaleString()} {unit}
        </span>

        {/* Input box with stepper */}
        <div className="inline-flex items-center rounded-xl bg-[#EDE8DC] p-1 border border-[#DDD8CD]/80 shadow-xs focus-within:ring-2 focus-within:ring-[#1A4D2E]/30">
          <button
            type="button"
            onClick={() => handleStep(-1)}
            disabled={value <= min}
            aria-label="Decrease value"
            className="w-7 h-7 rounded-lg bg-white/70 text-[#1A4D2E] hover:bg-white text-base font-bold flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            −
          </button>
          <div className="flex items-center px-2">
            <input
              type="number"
              min={min}
              max={effectiveMax * 5}
              step={step}
              value={typedValue}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className="w-20 text-center font-bold text-base text-[#1A4D2E] bg-transparent focus:outline-none tabular-nums"
              aria-label={`Current value ${unit}`}
            />
            {unit && (
              <span className="text-xs font-bold text-[#7A8C6E] ml-0.5 select-none">
                {unit}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => handleStep(1)}
            aria-label="Increase value"
            className="w-7 h-7 rounded-lg bg-white/70 text-[#1A4D2E] hover:bg-white text-base font-bold flex items-center justify-center transition-all"
          >
            +
          </button>
        </div>

        <span className="text-xs font-semibold text-[#7A8C6E]">
          {effectiveMax.toLocaleString()} {unit}
        </span>
      </div>

      {/* Interactive slider track */}
      <div className="relative w-full py-1 flex items-center">
        <input
          type="range"
          min={min}
          max={effectiveMax}
          step={step}
          value={clampedValue}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{
            background: `linear-gradient(to right, #1A4D2E 0%, #2E7D52 ${pct}%, #EDE8DC ${pct}%, #EDE8DC 100%)`,
          }}
          className="w-full cursor-pointer h-2.5 rounded-full"
          aria-label={`Slider value: ${value} ${unit}`}
        />
      </div>

      {/* Optional quick preset chips */}
      {presets && presets.length > 0 && (
        <div className="flex items-center flex-wrap gap-1.5 pt-0.5">
          <span className="text-[10px] uppercase font-bold text-[#7A8C6E] mr-1 tracking-wider">
            Presets:
          </span>
          {presets.map((preset, idx) => {
            const val = typeof preset === "number" ? preset : preset.value;
            const lbl = typeof preset === "number" ? `${preset.toLocaleString()} ${unit}` : preset.label;
            const isSelected = value === val;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => onChange(val)}
                className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all duration-150 border ${
                  isSelected
                    ? "bg-[#1A4D2E] text-white border-[#1A4D2E] shadow-xs"
                    : "bg-[#FAFAF7] text-[#4B5945] border-[#DDD8CD] hover:bg-[#EDE8DC] hover:text-[#1A4D2E]"
                }`}
              >
                {lbl}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
