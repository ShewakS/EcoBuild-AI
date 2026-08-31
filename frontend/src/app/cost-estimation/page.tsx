"use client";

import { useState, useCallback } from "react";
import { SegmentedToggle } from "@/components/ui/SegmentedToggle";
import { SliderInput } from "@/components/ui/SliderInput";
import { StepperInput } from "@/components/ui/StepperInput";
import { postEstimateCost } from "@/lib/api";
import type {
  ProjectInputs,
  EstimateResponse,
  ResidentialType,
  RoomSize,
} from "@/lib/types";
import { TAMIL_NADU_DISTRICTS } from "@/lib/types";

// Standard bedroom size presets commonly used in Tamil Nadu
const BEDROOM_PRESETS: { label: string; length: number; width: number; desc: string }[] = [
  { label: "10 × 10 ft", length: 10, width: 10, desc: "Compact (100 sqft)" },
  { label: "10 × 12 ft", length: 10, width: 12, desc: "Standard (120 sqft)" },
  { label: "10 × 14 ft", length: 10, width: 14, desc: "Medium (140 sqft)" },
  { label: "10 × 16 ft", length: 10, width: 16, desc: "Large (160 sqft)" },
  { label: "12 × 14 ft", length: 12, width: 14, desc: "Spacious (168 sqft)" },
  { label: "12 × 16 ft", length: 12, width: 16, desc: "Master Suite (192 sqft)" },
  { label: "14 × 16 ft", length: 14, width: 16, desc: "Grand Suite (224 sqft)" },
];

// Standard kitchen size presets commonly used in Tamil Nadu
const KITCHEN_PRESETS: { label: string; length: number; width: number; desc: string }[] = [
  { label: "8 × 8 ft", length: 8, width: 8, desc: "Compact (64 sqft)" },
  { label: "8 × 10 ft", length: 8, width: 10, desc: "Standard (80 sqft)" },
  { label: "10 × 10 ft", length: 10, width: 10, desc: "Medium (100 sqft)" },
  { label: "10 × 12 ft", length: 10, width: 12, desc: "Modular (120 sqft)" },
  { label: "10 × 14 ft", length: 10, width: 14, desc: "Open / Island (140 sqft)" },
];

function generateDefaultBedrooms(count: number): RoomSize[] {
  const rooms: RoomSize[] = [];
  for (let i = 0; i < count; i++) {
    const isMaster = i === 0;
    const length = isMaster ? 10 : 10;
    const width = isMaster ? 16 : 12;
    rooms.push({
      name: isMaster ? "Master Bedroom" : `Bedroom ${i + 1}`,
      length_ft: length,
      width_ft: width,
      area_sqft: length * width,
      preset: isMaster ? "10 × 16 ft" : "10 × 12 ft",
    });
  }
  return rooms;
}

function generateDefaultKitchens(count: number): RoomSize[] {
  const kitchens: RoomSize[] = [];
  for (let i = 0; i < count; i++) {
    const isMain = i === 0;
    const length = isMain ? 10 : 8;
    const width = isMain ? 10 : 8;
    kitchens.push({
      name: isMain ? "Main Kitchen" : `Utility Kitchen ${i + 1}`,
      length_ft: length,
      width_ft: width,
      area_sqft: length * width,
      preset: isMain ? "10 × 10 ft" : "8 × 8 ft",
    });
  }
  return kitchens;
}

// ── Default form state ──────────────────────────────────────────────────────
const DEFAULTS: ProjectInputs = {
  district: "Chennai",
  residential_type: "Individual Villa",
  built_up_area_sqft: 1200,
  plot_area_sqft: 2400,
  floors: 2,
  bedrooms: 3,
  room_sizes: generateDefaultBedrooms(3),
  kitchens: 1,
  kitchen_sizes: generateDefaultKitchens(1),
  bathrooms: 2,
  parking: 1,
  soil_type: "Loamy",
  land_type: "Flat",
  foundation_type: "Strip",
  foundation_depth_ft: 6,
  wall_material: "Brick",
  roof_type: "RCC Flat",
  flooring: "Vitrified Tile",
  finish_quality: "Standard",
  solar_panels: false,
  rainwater_harvesting: false,
  inflation_index: 1.0,
};

// ── Helpers ─────────────────────────────────────────────────────────────────
function fmt(n: number) {
  if (n >= 1_00_00_000) return `₹${(n / 1_00_00_000).toFixed(2)} Cr`;
  if (n >= 1_00_00_000) return `₹${(n / 1_00_000).toFixed(2)} L`;
  return `₹${n.toLocaleString("en-IN")}`;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// Step indicator
function StepIndicator({
  step,
  active,
  done,
  label,
}: {
  step: number;
  active: boolean;
  done: boolean;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all duration-200"
        style={{
          background: done
            ? "var(--green-mid)"
            : active
            ? "var(--green-deep)"
            : "var(--bg-muted)",
          color: done || active ? "white" : "var(--green-muted)",
        }}
      >
        {done ? "✓" : step}
      </div>
      <span
        className="text-sm font-semibold"
        style={{
          color: active
            ? "var(--green-deep)"
            : done
            ? "var(--green-mid)"
            : "var(--text-muted)",
        }}
      >
        {label}
      </span>
    </div>
  );
}

// Field wrapper
function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label
        className="text-xs font-semibold uppercase tracking-wider"
        style={{ color: "var(--green-muted)" }}
      >
        {label}
      </label>
      {children}
      {hint && (
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          {hint}
        </p>
      )}
    </div>
  );
}

// Toggle switch
function Toggle({
  id,
  checked,
  onChange,
  label,
}: {
  id: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex items-center gap-3 text-sm font-medium group cursor-pointer"
      style={{ color: "var(--text-body)" }}
    >
      <div
        className="relative w-11 h-6 rounded-full transition-all duration-200"
        style={{
          background: checked ? "var(--green-deep)" : "var(--bg-muted)",
        }}
      >
        <div
          className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-xs transition-all duration-200"
          style={{ left: checked ? "calc(100% - 22px)" : "2px" }}
        />
      </div>
      {label}
    </button>
  );
}

// Category breakdown card
function BreakdownCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: string;
}) {
  return (
    <div
      className="rounded-xl p-3 flex flex-col gap-1"
      style={{ background: "var(--panel-surface)" }}
    >
      <div className="flex items-center gap-1.5">
        <span className="text-sm">{icon}</span>
        <span
          className="text-xs font-medium"
          style={{ color: "rgba(255,255,255,0.7)" }}
        >
          {label}
        </span>
      </div>
      <div className="text-base font-bold" style={{ color: "white" }}>
        {fmt(value)}
      </div>
    </div>
  );
}

export default function CostEstimationPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<ProjectInputs>(DEFAULTS);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EstimateResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const set = useCallback(
    <K extends keyof ProjectInputs>(key: K, val: ProjectInputs[K]) => {
      setForm((prev) => ({ ...prev, [key]: val }));
    },
    []
  );

  // Sync bedrooms
  const handleBedroomsChange = (count: number) => {
    setForm((prev) => {
      const currentRooms = prev.room_sizes || [];
      let nextRooms: RoomSize[];
      if (count > currentRooms.length) {
        const newRooms: RoomSize[] = [];
        for (let i = currentRooms.length; i < count; i++) {
          const isMaster = i === 0;
          const length = isMaster ? 10 : 10;
          const width = isMaster ? 16 : 12;
          newRooms.push({
            name: isMaster ? "Master Bedroom" : `Bedroom ${i + 1}`,
            length_ft: length,
            width_ft: width,
            area_sqft: length * width,
            preset: isMaster ? "10 × 16 ft" : "10 × 12 ft",
          });
        }
        nextRooms = [...currentRooms, ...newRooms];
      } else {
        nextRooms = currentRooms.slice(0, count);
      }
      return { ...prev, bedrooms: count, room_sizes: nextRooms };
    });
  };

  const handleBedroomSizeChange = (
    index: number,
    presetOrCustom: string,
    customLength?: number,
    customWidth?: number
  ) => {
    setForm((prev) => {
      const rooms = [...(prev.room_sizes || [])];
      if (!rooms[index]) return prev;

      if (presetOrCustom === "Custom") {
        const len = customLength ?? rooms[index].length_ft;
        const wid = customWidth ?? rooms[index].width_ft;
        rooms[index] = {
          ...rooms[index],
          preset: "Custom",
          length_ft: len,
          width_ft: wid,
          area_sqft: Math.round(len * wid * 10) / 10,
        };
      } else {
        const found = BEDROOM_PRESETS.find((p) => p.label === presetOrCustom);
        if (found) {
          rooms[index] = {
            ...rooms[index],
            preset: found.label,
            length_ft: found.length,
            width_ft: found.width,
            area_sqft: found.length * found.width,
          };
        }
      }
      return { ...prev, room_sizes: rooms };
    });
  };

  // Sync kitchens
  const handleKitchensChange = (count: number) => {
    setForm((prev) => {
      const currentKitchens = prev.kitchen_sizes || [];
      let nextKitchens: RoomSize[];
      if (count > currentKitchens.length) {
        const newKits: RoomSize[] = [];
        for (let i = currentKitchens.length; i < count; i++) {
          const isMain = i === 0;
          const length = isMain ? 10 : 8;
          const width = isMain ? 10 : 8;
          newKits.push({
            name: isMain ? "Main Kitchen" : `Utility Kitchen ${i + 1}`,
            length_ft: length,
            width_ft: width,
            area_sqft: length * width,
            preset: isMain ? "10 × 10 ft" : "8 × 8 ft",
          });
        }
        nextKitchens = [...currentKitchens, ...newKits];
      } else {
        nextKitchens = currentKitchens.slice(0, count);
      }
      return { ...prev, kitchens: count, kitchen_sizes: nextKitchens };
    });
  };

  const handleKitchenSizeChange = (
    index: number,
    presetOrCustom: string,
    customLength?: number,
    customWidth?: number
  ) => {
    setForm((prev) => {
      const kits = [...(prev.kitchen_sizes || [])];
      if (!kits[index]) return prev;

      if (presetOrCustom === "Custom") {
        const len = customLength ?? kits[index].length_ft;
        const wid = customWidth ?? kits[index].width_ft;
        kits[index] = {
          ...kits[index],
          preset: "Custom",
          length_ft: len,
          width_ft: wid,
          area_sqft: Math.round(len * wid * 10) / 10,
        };
      } else {
        const found = KITCHEN_PRESETS.find((p) => p.label === presetOrCustom);
        if (found) {
          kits[index] = {
            ...kits[index],
            preset: found.label,
            length_ft: found.length,
            width_ft: found.width,
            area_sqft: found.length * found.width,
          };
        }
      }
      return { ...prev, kitchen_sizes: kits };
    });
  };

  const totalBedroomArea =
    form.room_sizes?.reduce((sum, r) => sum + r.area_sqft, 0) || 0;
  const totalKitchenArea =
    form.kitchen_sizes?.reduce((sum, r) => sum + r.area_sqft, 0) || 0;

  async function handleEstimate() {
    setLoading(true);
    setError(null);
    try {
      const res = await postEstimateCost(form);
      setResult(res);
    } catch (e: unknown) {
      setError(
        e instanceof Error
          ? e.message
          : "Estimation failed. Is the backend running?"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="flex-1 flex flex-col"
      style={{ background: "var(--bg-base)" }}
    >
      {/* Page header */}
      <div
        className="border-b"
        style={{
          borderColor: "var(--border)",
          background: "var(--bg-card)",
        }}
      >
        <div className="max-w-screen-xl mx-auto px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1
              className="text-2xl font-extrabold tracking-tight"
              style={{ color: "var(--green-deep)" }}
            >
              Residential Cost & ML Material Estimation
            </h1>
            <p
              className="text-sm mt-0.5"
              style={{ color: "var(--text-muted)" }}
            >
              Phase 1: Formula-Based Cost Calculation · Phase 2: ML Material Quantity Prediction (XGBoost)
            </p>
          </div>
          {result && (
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{
                background: "var(--bg-muted)",
                color: "var(--green-muted)",
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ background: "#22c55e" }}
              />
              Estimate #{result.estimate_id.slice(-6)}
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 max-w-screen-xl mx-auto w-full px-4 sm:px-6 py-6 grid grid-cols-1 xl:grid-cols-[1fr_450px] gap-6 items-start">
        {/* ── LEFT: Form ── */}
        <div className="flex flex-col gap-5">
          {/* Step indicators */}
          <div
            className="flex items-center gap-6 rounded-2xl p-4 border"
            style={{
              background: "var(--bg-card)",
              borderColor: "var(--border)",
              boxShadow: "var(--shadow-card)",
            }}
          >
            <StepIndicator
              step={1}
              active={step === 1}
              done={step > 1}
              label="1. Project, Room & Kitchen Specs"
            />
            <div
              className="flex-1 h-px"
              style={{ background: "var(--border)" }}
            />
            <StepIndicator
              step={2}
              active={step === 2}
              done={false}
              label="2. Site & Material Specifications"
            />
          </div>

          {/* ── STEP 1: Project Details ── */}
          {step === 1 && (
            <div
              className="rounded-2xl border p-6 flex flex-col gap-6"
              style={{
                background: "var(--bg-card)",
                borderColor: "var(--border)",
                boxShadow: "var(--shadow-card)",
              }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* District */}
                <Field label="Tamil Nadu District">
                  <select
                    id="field-district"
                    value={form.district}
                    onChange={(e) => set("district", e.target.value)}
                    className="w-full rounded-xl px-4 py-2.5 text-sm font-medium border appearance-none focus:outline-none cursor-pointer"
                    style={{
                      background: "var(--bg-muted)",
                      borderColor: "var(--border)",
                      color: "var(--green-deep)",
                    }}
                  >
                    {TAMIL_NADU_DISTRICTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </Field>

                {/* Residential Type Direct Selector */}
                <Field label="Residential Building Type">
                  <select
                    id="field-residential-type"
                    value={form.residential_type}
                    onChange={(e) => set("residential_type", e.target.value as ResidentialType)}
                    className="w-full rounded-xl px-4 py-2.5 text-sm font-bold border appearance-none focus:outline-none cursor-pointer"
                    style={{
                      background: "var(--bg-muted)",
                      borderColor: "var(--border)",
                      color: "var(--green-deep)",
                    }}
                  >
                    <option value="Individual Villa">🏡 Individual Villa / Bungalow</option>
                    <option value="Apartment">🏢 Apartment / Flat</option>
                    <option value="Independent House">🏠 Independent House (Single/Multi-story)</option>
                    <option value="Duplex House">🏘️ Duplex House</option>
                    <option value="Row House">🧱 Row House / Gated Community</option>
                  </select>
                </Field>
              </div>

              {/* Area Sliders */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Built-up area */}
                <Field
                  label="Built-up Area (Sq Ft)"
                  hint="Total constructed floor area across all floors"
                >
                  <SliderInput
                    id="field-built-up-area"
                    value={form.built_up_area_sqft}
                    onChange={(v) => set("built_up_area_sqft", v)}
                    min={200}
                    max={10000}
                    step={50}
                    unit="sqft"
                    presets={[800, 1200, 1800, 2400, 3600, 5000]}
                  />
                </Field>

                {/* Plot area */}
                <Field
                  label="Plot / Land Area (Sq Ft)"
                  hint="Total land area (1 Ground = 2,400 sqft in TN)"
                >
                  <SliderInput
                    id="field-plot-area"
                    value={form.plot_area_sqft}
                    onChange={(v) => set("plot_area_sqft", v)}
                    min={300}
                    max={20000}
                    step={100}
                    unit="sqft"
                    presets={[
                      { label: "½ Ground (1,200)", value: 1200 },
                      { label: "1 Ground (2,400)", value: 2400 },
                      { label: "1.5 Ground (3,600)", value: 3600 },
                      { label: "2 Grounds (4,800)", value: 4800 },
                      { label: "10,000 sqft", value: 10000 },
                    ]}
                  />
                </Field>
              </div>

              {/* Quantitative Counters: Floors, Bedrooms, Kitchens, Bathrooms, Parking */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                <Field label="Floors">
                  <StepperInput
                    id="field-floors"
                    value={form.floors}
                    onChange={(v) => set("floors", v)}
                    min={1}
                    max={20}
                    label="floors"
                  />
                </Field>
                <Field label="Bedrooms">
                  <StepperInput
                    id="field-bedrooms"
                    value={form.bedrooms}
                    onChange={handleBedroomsChange}
                    min={0}
                    max={15}
                    label="bedrooms"
                  />
                </Field>
                <Field label="Kitchens">
                  <StepperInput
                    id="field-kitchens"
                    value={form.kitchens}
                    onChange={handleKitchensChange}
                    min={0}
                    max={5}
                    label="kitchens"
                  />
                </Field>
                <Field label="Bathrooms">
                  <StepperInput
                    id="field-bathrooms"
                    value={form.bathrooms}
                    onChange={(v) => set("bathrooms", v)}
                    min={1}
                    max={15}
                    label="bathrooms"
                  />
                </Field>
                <Field label="Car Parking">
                  <StepperInput
                    id="field-parking"
                    value={form.parking}
                    onChange={(v) => set("parking", v)}
                    min={0}
                    max={10}
                    label="parking"
                  />
                </Field>
              </div>

              {/* ── Bedroom Sizes Configuration (When bedrooms > 0) ── */}
              {form.bedrooms > 0 && form.room_sizes && (
                <div
                  className="rounded-2xl p-5 border flex flex-col gap-4"
                  style={{
                    background: "var(--bg-muted)",
                    borderColor: "var(--border)",
                  }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🛏️</span>
                      <div>
                        <h3
                          className="text-sm font-bold"
                          style={{ color: "var(--green-deep)" }}
                        >
                          Bedroom Dimensions & Sizes
                        </h3>
                        <p
                          className="text-xs"
                          style={{ color: "var(--text-muted)" }}
                        >
                          Select standard bedroom dimensions (10x10, 10x16, etc.) or custom sizes.
                        </p>
                      </div>
                    </div>
                    <div
                      className="px-3 py-1 rounded-xl text-xs font-bold self-start sm:self-auto"
                      style={{
                        background: "var(--green-deep)",
                        color: "white",
                      }}
                    >
                      Total Bedroom Area: {totalBedroomArea.toLocaleString()} sqft
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 pt-1">
                    {form.room_sizes.map((room, idx) => {
                      const isCustom = room.preset === "Custom";
                      return (
                        <div
                          key={idx}
                          className="rounded-xl p-4 bg-white border border-[#DDD8CD] shadow-xs flex flex-col gap-3"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wide text-[#1A4D2E]">
                              {room.name}
                            </span>
                            <span className="text-xs font-bold text-[#2E7D52] bg-[#EDE8DC] px-2 py-0.5 rounded-lg">
                              {room.length_ft} × {room.width_ft} ft ={" "}
                              {room.area_sqft} sqft
                            </span>
                          </div>

                          <div className="flex items-center flex-wrap gap-1.5">
                            {BEDROOM_PRESETS.map((preset) => {
                              const active = room.preset === preset.label;
                              return (
                                <button
                                  key={preset.label}
                                  type="button"
                                  onClick={() =>
                                    handleBedroomSizeChange(idx, preset.label)
                                  }
                                  className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all duration-150 border cursor-pointer ${
                                    active
                                      ? "bg-[#1A4D2E] text-white border-[#1A4D2E] shadow-xs"
                                      : "bg-[#FAFAF7] text-[#4B5945] border-[#DDD8CD] hover:bg-[#EDE8DC]"
                                  }`}
                                  title={preset.desc}
                                >
                                  {preset.label}
                                </button>
                              );
                            })}
                            <button
                              type="button"
                              onClick={() =>
                                handleBedroomSizeChange(idx, "Custom")
                              }
                              className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all duration-150 border cursor-pointer ${
                                isCustom
                                  ? "bg-[#1A4D2E] text-white border-[#1A4D2E] shadow-xs"
                                  : "bg-[#FAFAF7] text-[#4B5945] border-[#DDD8CD] hover:bg-[#EDE8DC]"
                              }`}
                            >
                              Custom Dimension
                            </button>
                          </div>

                          {isCustom && (
                            <div className="flex items-center gap-3 pt-1">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-semibold text-[#7A8C6E]">
                                  Length (ft):
                                </span>
                                <input
                                  type="number"
                                  min={6}
                                  max={50}
                                  step={0.5}
                                  value={room.length_ft}
                                  onChange={(e) =>
                                    handleBedroomSizeChange(
                                      idx,
                                      "Custom",
                                      parseFloat(e.target.value) || 0,
                                      room.width_ft
                                    )
                                  }
                                  className="w-16 rounded-lg px-2 py-1 text-xs font-bold border border-[#DDD8CD] bg-[#EDE8DC] text-[#1A4D2E] text-center"
                                />
                              </div>
                              <span className="text-sm font-bold text-[#7A8C6E]">
                                ×
                              </span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-semibold text-[#7A8C6E]">
                                  Width (ft):
                                </span>
                                <input
                                  type="number"
                                  min={6}
                                  max={50}
                                  step={0.5}
                                  value={room.width_ft}
                                  onChange={(e) =>
                                    handleBedroomSizeChange(
                                      idx,
                                      "Custom",
                                      room.length_ft,
                                      parseFloat(e.target.value) || 0
                                    )
                                  }
                                  className="w-16 rounded-lg px-2 py-1 text-xs font-bold border border-[#DDD8CD] bg-[#EDE8DC] text-[#1A4D2E] text-center"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── Kitchen Sizes Configuration (When kitchens > 0) ── */}
              {form.kitchens > 0 && form.kitchen_sizes && (
                <div
                  className="rounded-2xl p-5 border flex flex-col gap-4"
                  style={{
                    background: "var(--bg-muted)",
                    borderColor: "var(--border)",
                  }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🍳</span>
                      <div>
                        <h3
                          className="text-sm font-bold"
                          style={{ color: "var(--green-deep)" }}
                        >
                          Kitchen Dimensions & Sizes
                        </h3>
                        <p
                          className="text-xs"
                          style={{ color: "var(--text-muted)" }}
                        >
                          Choose kitchen sizes for exact plumbing lines, granite countertops & appliance points.
                        </p>
                      </div>
                    </div>
                    <div
                      className="px-3 py-1 rounded-xl text-xs font-bold self-start sm:self-auto"
                      style={{
                        background: "var(--green-mid)",
                        color: "white",
                      }}
                    >
                      Total Kitchen Area: {totalKitchenArea.toLocaleString()} sqft
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 pt-1">
                    {form.kitchen_sizes.map((kit, idx) => {
                      const isCustom = kit.preset === "Custom";
                      return (
                        <div
                          key={idx}
                          className="rounded-xl p-4 bg-white border border-[#DDD8CD] shadow-xs flex flex-col gap-3"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wide text-[#1A4D2E]">
                              {kit.name}
                            </span>
                            <span className="text-xs font-bold text-[#2E7D52] bg-[#EDE8DC] px-2 py-0.5 rounded-lg">
                              {kit.length_ft} × {kit.width_ft} ft ={" "}
                              {kit.area_sqft} sqft
                            </span>
                          </div>

                          <div className="flex items-center flex-wrap gap-1.5">
                            {KITCHEN_PRESETS.map((preset) => {
                              const active = kit.preset === preset.label;
                              return (
                                <button
                                  key={preset.label}
                                  type="button"
                                  onClick={() =>
                                    handleKitchenSizeChange(idx, preset.label)
                                  }
                                  className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all duration-150 border cursor-pointer ${
                                    active
                                      ? "bg-[#1A4D2E] text-white border-[#1A4D2E] shadow-xs"
                                      : "bg-[#FAFAF7] text-[#4B5945] border-[#DDD8CD] hover:bg-[#EDE8DC]"
                                  }`}
                                  title={preset.desc}
                                >
                                  {preset.label}
                                </button>
                              );
                            })}
                            <button
                              type="button"
                              onClick={() =>
                                handleKitchenSizeChange(idx, "Custom")
                              }
                              className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all duration-150 border cursor-pointer ${
                                isCustom
                                  ? "bg-[#1A4D2E] text-white border-[#1A4D2E] shadow-xs"
                                  : "bg-[#FAFAF7] text-[#4B5945] border-[#DDD8CD] hover:bg-[#EDE8DC]"
                              }`}
                            >
                              Custom Dimension
                            </button>
                          </div>

                          {isCustom && (
                            <div className="flex items-center gap-3 pt-1">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-semibold text-[#7A8C6E]">
                                  Length (ft):
                                </span>
                                <input
                                  type="number"
                                  min={5}
                                  max={40}
                                  step={0.5}
                                  value={kit.length_ft}
                                  onChange={(e) =>
                                    handleKitchenSizeChange(
                                      idx,
                                      "Custom",
                                      parseFloat(e.target.value) || 0,
                                      kit.width_ft
                                    )
                                  }
                                  className="w-16 rounded-lg px-2 py-1 text-xs font-bold border border-[#DDD8CD] bg-[#EDE8DC] text-[#1A4D2E] text-center"
                                />
                              </div>
                              <span className="text-sm font-bold text-[#7A8C6E]">
                                ×
                              </span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-semibold text-[#7A8C6E]">
                                  Width (ft):
                                </span>
                                <input
                                  type="number"
                                  min={5}
                                  max={40}
                                  step={0.5}
                                  value={kit.width_ft}
                                  onChange={(e) =>
                                    handleKitchenSizeChange(
                                      idx,
                                      "Custom",
                                      kit.length_ft,
                                      parseFloat(e.target.value) || 0
                                    )
                                  }
                                  className="w-16 rounded-lg px-2 py-1 text-xs font-bold border border-[#DDD8CD] bg-[#EDE8DC] text-[#1A4D2E] text-center"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Finish Quality & Green Features */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Field label="Finish Quality Level">
                  <SegmentedToggle
                    id="field-finish-quality"
                    options={[
                      { value: "Standard", label: "Standard" },
                      { value: "Premium", label: "Premium (+15%)" },
                      { value: "Luxury", label: "Luxury (+35%)" },
                    ]}
                    value={form.finish_quality}
                    onChange={(v) => set("finish_quality", v)}
                  />
                </Field>

                <Field label="Sustainable Add-ons">
                  <div className="flex flex-col gap-3 pt-1">
                    <Toggle
                      id="toggle-solar"
                      checked={form.solar_panels}
                      onChange={(v) => set("solar_panels", v)}
                      label="Rooftop Solar Panels"
                    />
                    <Toggle
                      id="toggle-rwh"
                      checked={form.rainwater_harvesting}
                      onChange={(v) => set("rainwater_harvesting", v)}
                      label="Rainwater Harvesting (TN Compliant)"
                    />
                  </div>
                </Field>
              </div>

              {/* Inflation index */}
              <Field
                label="Market Inflation Index"
                hint="Adjust for local price trends (1.00 = current baseline rates)"
              >
                <SliderInput
                  id="field-inflation"
                  value={form.inflation_index}
                  onChange={(v) => set("inflation_index", v)}
                  min={0.8}
                  max={2.0}
                  step={0.05}
                  formatValue={(v) => `${v.toFixed(2)}x`}
                />
              </Field>

              <div className="flex justify-end pt-2">
                <button
                  id="btn-next-step"
                  type="button"
                  onClick={() => setStep(2)}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white shadow-sm hover:shadow-md active:scale-95 transition-all duration-200 cursor-pointer"
                  style={{ background: "var(--green-deep)" }}
                >
                  Next: Site & Structure
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 2: Site & Structure ── */}
          {step === 2 && (
            <div
              className="rounded-2xl border p-6 flex flex-col gap-6"
              style={{
                background: "var(--bg-card)",
                borderColor: "var(--border)",
                boxShadow: "var(--shadow-card)",
              }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Field label="Soil Type">
                  <SegmentedToggle
                    id="field-soil-type"
                    options={[
                      { value: "Clay", label: "Clay" },
                      { value: "Sandy", label: "Sandy" },
                      { value: "Loamy", label: "Loamy" },
                      { value: "Rocky", label: "Rocky" },
                      { value: "Black Cotton", label: "Black Cotton" },
                    ]}
                    value={form.soil_type}
                    onChange={(v) => set("soil_type", v)}
                  />
                </Field>

                <Field label="Land Topography">
                  <SegmentedToggle
                    id="field-land-type"
                    options={[
                      { value: "Flat", label: "Flat Land" },
                      { value: "Sloped", label: "Sloped Terrain" },
                      { value: "Hilly", label: "Hilly Area" },
                    ]}
                    value={form.land_type}
                    onChange={(v) => set("land_type", v)}
                  />
                </Field>

                <Field label="Foundation Type">
                  <SegmentedToggle
                    id="field-foundation-type"
                    options={[
                      { value: "Strip", label: "Strip" },
                      { value: "Raft", label: "Raft" },
                      { value: "Pile", label: "Pile" },
                      { value: "Isolated Footing", label: "Isolated" },
                    ]}
                    value={form.foundation_type}
                    onChange={(v) => set("foundation_type", v)}
                  />
                </Field>

                <Field label="Foundation Depth">
                  <SliderInput
                    id="field-foundation-depth"
                    value={form.foundation_depth_ft}
                    onChange={(v) => set("foundation_depth_ft", v)}
                    min={2}
                    max={30}
                    step={0.5}
                    unit="ft"
                  />
                </Field>

                <Field label="Wall Material">
                  <SegmentedToggle
                    id="field-wall-material"
                    options={[
                      { value: "Brick", label: "Burnt Clay Brick" },
                      { value: "AAC Block", label: "AAC Light Block" },
                      { value: "Hollow Block", label: "Hollow Block" },
                      { value: "Stone", label: "Stone Masonry" },
                    ]}
                    value={form.wall_material}
                    onChange={(v) => set("wall_material", v)}
                  />
                </Field>

                <Field label="Roof Type">
                  <SegmentedToggle
                    id="field-roof-type"
                    options={[
                      { value: "RCC Flat", label: "RCC Flat Slab" },
                      { value: "Sloped Tile", label: "Sloped Clay Tile" },
                      { value: "Metal Sheet", label: "Metal Sheet" },
                      { value: "Thatched", label: "Traditional" },
                    ]}
                    value={form.roof_type}
                    onChange={(v) => set("roof_type", v)}
                  />
                </Field>

                <Field label="Flooring Type">
                  <SegmentedToggle
                    id="field-flooring"
                    options={[
                      { value: "Ceramic Tile", label: "Ceramic" },
                      { value: "Vitrified Tile", label: "Vitrified Tile" },
                      { value: "Marble", label: "Marble" },
                      { value: "Granite", label: "Granite" },
                      { value: "Concrete", label: "Concrete" },
                    ]}
                    value={form.flooring}
                    onChange={(v) => set("flooring", v)}
                  />
                </Field>
              </div>

              {error && (
                <div
                  className="rounded-xl px-4 py-3 text-sm font-medium flex items-start gap-2"
                  style={{
                    background: "#FEF2F2",
                    color: "#991B1B",
                    border: "1px solid #FCA5A5",
                  }}
                >
                  <svg
                    className="w-4 h-4 flex-shrink-0 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                    />
                  </svg>
                  {error}
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <button
                  id="btn-prev-step"
                  type="button"
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-200 hover:shadow-sm cursor-pointer"
                  style={{
                    borderColor: "var(--border)",
                    color: "var(--green-deep)",
                    background: "var(--bg-muted)",
                  }}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  Back to Details
                </button>

                <button
                  id="btn-generate-estimate"
                  type="button"
                  onClick={handleEstimate}
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-7 py-2.5 rounded-xl text-sm font-bold text-white shadow-md hover:shadow-lg active:scale-95 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--green-mid), var(--green-deep))",
                  }}
                >
                  {loading ? (
                    <>
                      <svg
                        className="w-4 h-4 animate-spin"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      Running Cost Formula & ML Model…
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                        />
                      </svg>
                      Generate Cost & ML Prediction
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT: Result Panel ── */}
        <div
          className="rounded-2xl flex flex-col gap-4 p-6 sticky top-24"
          style={{
            background: "var(--panel-bg)",
            boxShadow: "var(--shadow-panel)",
            minHeight: 520,
          }}
        >
          {/* Panel header */}
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold" style={{ color: "white" }}>
              Prediction Results
            </h2>
            {result ? (
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                style={{
                  background: "rgba(255,255,255,0.12)",
                  color: "rgba(255,255,255,0.9)",
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{ background: "#4ade80" }}
                />
                Two-Phase Verified
              </span>
            ) : (
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  color: "rgba(255,255,255,0.5)",
                }}
              >
                Awaiting input
              </span>
            )}
          </div>

          {!result && !loading && (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 py-8">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl opacity-40"
                style={{ background: "rgba(255,255,255,0.08)" }}
              >
                🏗️
              </div>
              <div className="text-center">
                <p
                  className="text-sm font-semibold"
                  style={{ color: "rgba(255,255,255,0.6)" }}
                >
                  No prediction generated yet
                </p>
                <p
                  className="text-xs mt-1"
                  style={{ color: "rgba(255,255,255,0.35)" }}
                >
                  Phase 1: Formula Cost Calculation
                  <br />
                  Phase 2: XGBoost ML Material Estimation
                </p>
              </div>
            </div>
          )}

          {loading && (
            <div className="flex-1 flex flex-col items-center justify-center gap-3">
              <svg
                className="w-8 h-8 animate-spin"
                style={{ color: "rgba(255,255,255,0.6)" }}
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              <p
                className="text-sm text-center"
                style={{ color: "rgba(255,255,255,0.7)" }}
              >
                1. Calculating explicit cost breakdown…
                <br />
                2. Executing XGBoost material model…
              </p>
            </div>
          )}

          {result && !loading && (
            <>
              {/* ── PHASE 1: Calculation-Based Cost ── */}
              <div
                className="rounded-xl p-4 text-center relative overflow-hidden"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                }}
              >
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-1.5 bg-[#D4541A] text-white">
                  ⚡ Phase 1 · Formula Cost Calculation
                </div>
                <div
                  className="text-3xl font-extrabold tabular-nums"
                  style={{ color: "white" }}
                >
                  {fmt(result.breakdown.total_cost)}
                </div>
                <div
                  className="text-xs mt-1"
                  style={{ color: "rgba(255,255,255,0.6)" }}
                >
                  {result.inputs.district} · {result.inputs.residential_type} ·{" "}
                  {result.inputs.built_up_area_sqft.toLocaleString()} sqft ·{" "}
                  {result.inputs.floors} floor{result.inputs.floors > 1 ? "s" : ""}
                </div>
              </div>

              {/* Category breakdown */}
              <div className="grid grid-cols-2 gap-2">
                <BreakdownCard
                  label="Materials"
                  value={result.breakdown.material_cost}
                  icon="🧱"
                />
                <BreakdownCard
                  label="Labour"
                  value={result.breakdown.labour_cost}
                  icon="👷"
                />
                <BreakdownCard
                  label="Electrical"
                  value={result.breakdown.electrical_cost}
                  icon="⚡"
                />
                <BreakdownCard
                  label="Plumbing"
                  value={result.breakdown.plumbing_cost}
                  icon="🔧"
                />
                <BreakdownCard
                  label="Painting"
                  value={result.breakdown.painting_cost}
                  icon="🎨"
                />
                <BreakdownCard
                  label="Finishing"
                  value={result.breakdown.finishing_cost}
                  icon="✨"
                />
              </div>

              {/* Approval misc */}
              <div
                className="flex items-center justify-between rounded-xl px-4 py-2"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <span
                  className="text-xs"
                  style={{ color: "rgba(255,255,255,0.6)" }}
                >
                  📋 Approvals & Overheads (4-5%)
                </span>
                <span className="text-sm font-bold" style={{ color: "white" }}>
                  {fmt(result.breakdown.approval_misc_cost)}
                </span>
              </div>

              {/* ── PHASE 2: ML Model Material Quantities ── */}
              <div
                className="border-t pt-3 flex flex-col gap-2"
                style={{ borderColor: "rgba(255,255,255,0.15)" }}
              >
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-[#2E7D52] text-white">
                    🤖 Phase 2 · ML Material Model
                  </div>
                  <span className="text-[10px] text-emerald-300 font-semibold">
                    XGBoost (99.3% Acc)
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-1.5">
                  {[
                    {
                      label: "Cement",
                      val: `${result.quantities.ml.cement_bags.toLocaleString()} Bags`,
                      sub: `(${(result.quantities.ml.cement_bags * 0.05).toFixed(1)} Metric Tons)`,
                    },
                    {
                      label: "Reinforcement Steel",
                      val: `${result.quantities.ml.steel_tons} Tons`,
                      sub: `(${result.quantities.ml.steel_kg?.toLocaleString() || (result.quantities.ml.steel_tons * 1000).toLocaleString()} kg)`,
                    },
                    {
                      label: "Red Bricks / Blocks",
                      val: `${result.quantities.ml.brick_count.toLocaleString()} Units`,
                      sub: `(${result.inputs.wall_material})`,
                    },
                    {
                      label: "M-Sand (Fine)",
                      val: `${result.quantities.ml.sand_tons} Tons`,
                      sub: result.quantities.ml.sand_cum ? `(${result.quantities.ml.sand_cum} m³)` : undefined,
                    },
                    {
                      label: "Coarse Aggregate (20mm)",
                      val: `${result.quantities.ml.aggregate_tons} Tons`,
                      sub: result.quantities.ml.aggregate_cum ? `(${result.quantities.ml.aggregate_cum} m³)` : undefined,
                    },
                    {
                      label: "Labour Workload",
                      val: `${result.quantities.ml.labour_man_days} Man-days`,
                    },
                    {
                      label: "Electrical Wiring",
                      val: `${result.quantities.derived.electrical_points_count} Points`,
                    },
                    {
                      label: "Plumbing Fixtures",
                      val: `${result.quantities.derived.plumbing_fixture_count} Fixtures`,
                    },
                    {
                      label: "Paintable Wall Area",
                      val: `${result.quantities.derived.paintable_area_sqft.toLocaleString()} Sq Ft`,
                    },
                  ].map(({ label, val, sub }) => (
                    <div
                      key={label}
                      className="flex items-center justify-between text-xs py-0.5 border-b border-white/5"
                    >
                      <span style={{ color: "rgba(255,255,255,0.65)" }}>
                        {label}
                      </span>
                      <div className="text-right">
                        <span
                          className="font-bold tabular-nums"
                          style={{ color: "rgba(255,255,255,0.95)" }}
                        >
                          {val}
                        </span>
                        {sub && (
                          <span
                            className="text-[10px] ml-1 opacity-70"
                            style={{ color: "rgba(255,255,255,0.6)" }}
                          >
                            {sub}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rates last updated */}
              {result.rates_last_updated && (
                <div
                  className="flex items-center gap-1.5 text-xs rounded-lg px-3 py-1.5"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    color: "rgba(255,255,255,0.5)",
                  }}
                >
                  <svg
                    className="w-3 h-3 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Rates active as of: {fmtDate(result.rates_last_updated)}
                </div>
              )}

              {/* CTA */}
              <button
                id="btn-generate-report"
                type="button"
                className="w-full py-3 rounded-xl text-sm font-bold text-white shadow-md hover:shadow-lg active:scale-95 transition-all duration-200 cursor-pointer"
                style={{
                  background: "linear-gradient(135deg, #D4541A, var(--rust))",
                }}
              >
                📄 Generate Detailed Report
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
