import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { SegmentedToggle } from '../Components/ui/SegmentedToggle';
import { SliderInput } from '../Components/ui/SliderInput';
import { StepperInput } from '../Components/ui/StepperInput';
import { postEstimateCost } from '../Assets/api';
import { TAMIL_NADU_DISTRICTS } from '../Assets/constants';

// Standard bedroom size presets commonly used in Tamil Nadu
const BEDROOM_PRESETS = [
  { label: '10 × 10 ft', length: 10, width: 10, desc: 'Compact (100 sqft)' },
  { label: '10 × 12 ft', length: 10, width: 12, desc: 'Standard (120 sqft)' },
  { label: '10 × 14 ft', length: 10, width: 14, desc: 'Medium (140 sqft)' },
  { label: '10 × 16 ft', length: 10, width: 16, desc: 'Large (160 sqft)' },
  { label: '12 × 14 ft', length: 12, width: 14, desc: 'Spacious (168 sqft)' },
  { label: '12 × 16 ft', length: 12, width: 16, desc: 'Master Suite (192 sqft)' },
  { label: '14 × 16 ft', length: 14, width: 16, desc: 'Grand Suite (224 sqft)' },
];

// Standard kitchen size presets commonly used in Tamil Nadu
const KITCHEN_PRESETS = [
  { label: '8 × 8 ft', length: 8, width: 8, desc: 'Compact (64 sqft)' },
  { label: '8 × 10 ft', length: 8, width: 10, desc: 'Standard (80 sqft)' },
  { label: '10 × 10 ft', length: 10, width: 10, desc: 'Medium (100 sqft)' },
  { label: '10 × 12 ft', length: 10, width: 12, desc: 'Modular (120 sqft)' },
  { label: '10 × 14 ft', length: 10, width: 14, desc: 'Open / Island (140 sqft)' },
];

function generateDefaultBedrooms(count) {
  const rooms = [];
  for (let i = 0; i < count; i++) {
    const isMaster = i === 0;
    const length = isMaster ? 10 : 10;
    const width = isMaster ? 16 : 12;
    rooms.push({
      name: isMaster ? 'Master Bedroom' : `Bedroom ${i + 1}`,
      length_ft: length,
      width_ft: width,
      area_sqft: length * width,
      preset: isMaster ? '10 × 16 ft' : '10 × 12 ft',
    });
  }
  return rooms;
}

function generateDefaultKitchens(count) {
  const kitchens = [];
  for (let i = 0; i < count; i++) {
    const isMain = i === 0;
    const length = isMain ? 10 : 8;
    const width = isMain ? 10 : 8;
    kitchens.push({
      name: isMain ? 'Main Kitchen' : `Utility Kitchen ${i + 1}`,
      length_ft: length,
      width_ft: width,
      area_sqft: length * width,
      preset: isMain ? '10 × 10 ft' : '8 × 8 ft',
    });
  }
  return kitchens;
}

// ── Default form state ──────────────────────────────────────────────────────
const DEFAULTS = {
  district: 'Chennai',
  residential_type: 'Individual Villa',
  built_up_area_sqft: 1500,
  plot_area_sqft: 2400,
  floors: 2,
  bedrooms: 3,
  room_sizes: generateDefaultBedrooms(3),
  kitchens: 1,
  kitchen_sizes: generateDefaultKitchens(1),
  bathrooms: 2,
  parking: 1,
  soil_type: 'Loamy',
  land_type: 'Flat',
  foundation_type: 'Isolated Footing',
  foundation_depth_ft: 6,
  wall_material: 'Brick',
  roof_type: 'RCC Flat',
  flooring: 'Vitrified Tile',
  finish_quality: 'Standard',
  solar_panels: false,
  rainwater_harvesting: true,
  inflation_index: 1.0,
};

// Step indicator
function StepIndicator({ step, active, done, label }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all duration-200"
        style={{
          background: done
            ? 'var(--green-mid)'
            : active
            ? 'var(--green-deep)'
            : 'var(--bg-muted)',
          color: done || active ? 'white' : 'var(--green-muted)',
        }}
      >
        {done ? '✓' : step}
      </div>
      <span
        className="text-sm font-bold"
        style={{
          color: active
            ? 'var(--green-deep)'
            : done
            ? 'var(--green-mid)'
            : 'var(--text-muted)',
        }}
      >
        {label}
      </span>
    </div>
  );
}

// Field wrapper
function Field({ label, children, hint }) {
  return (
    <div className="flex flex-col gap-2">
      <label
        className="text-xs font-bold uppercase tracking-wider"
        style={{ color: 'var(--green-deep)' }}
      >
        {label}
      </label>
      {children}
      {hint && (
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {hint}
        </p>
      )}
    </div>
  );
}

// Toggle switch
function Toggle({ id, checked, onChange, label }) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex items-center gap-3 text-sm font-medium group cursor-pointer"
      style={{ color: 'var(--text-body)' }}
    >
      <div
        className="relative w-11 h-6 rounded-full transition-all duration-200"
        style={{
          background: checked ? 'var(--green-deep)' : 'var(--bg-muted)',
        }}
      >
        <div
          className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-xs transition-all duration-200"
          style={{ left: checked ? 'calc(100% - 22px)' : '2px' }}
        />
      </div>
      {label}
    </button>
  );
}

export default function CostEstimation() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(DEFAULTS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const set = useCallback((key, val) => {
    setForm((prev) => ({ ...prev, [key]: val }));
  }, []);

  // Sync bedrooms
  const handleBedroomsChange = (count) => {
    setForm((prev) => {
      const currentRooms = prev.room_sizes || [];
      let nextRooms;
      if (count > currentRooms.length) {
        const newRooms = [];
        for (let i = currentRooms.length; i < count; i++) {
          const isMaster = i === 0;
          const length = isMaster ? 10 : 10;
          const width = isMaster ? 16 : 12;
          newRooms.push({
            name: isMaster ? 'Master Bedroom' : `Bedroom ${i + 1}`,
            length_ft: length,
            width_ft: width,
            area_sqft: length * width,
            preset: isMaster ? '10 × 16 ft' : '10 × 12 ft',
          });
        }
        nextRooms = [...currentRooms, ...newRooms];
      } else {
        nextRooms = currentRooms.slice(0, count);
      }
      return { ...prev, bedrooms: count, room_sizes: nextRooms };
    });
  };

  const handleBedroomSizeChange = (index, presetOrCustom, customLength, customWidth) => {
    setForm((prev) => {
      const rooms = [...(prev.room_sizes || [])];
      if (!rooms[index]) return prev;

      if (presetOrCustom === 'Custom') {
        const len = customLength ?? rooms[index].length_ft;
        const wid = customWidth ?? rooms[index].width_ft;
        rooms[index] = {
          ...rooms[index],
          preset: 'Custom',
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
  const handleKitchensChange = (count) => {
    setForm((prev) => {
      const currentKitchens = prev.kitchen_sizes || [];
      let nextKitchens;
      if (count > currentKitchens.length) {
        const newKits = [];
        for (let i = currentKitchens.length; i < count; i++) {
          const isMain = i === 0;
          const length = isMain ? 10 : 8;
          const width = isMain ? 10 : 8;
          newKits.push({
            name: isMain ? 'Main Kitchen' : `Utility Kitchen ${i + 1}`,
            length_ft: length,
            width_ft: width,
            area_sqft: length * width,
            preset: isMain ? '10 × 10 ft' : '8 × 8 ft',
          });
        }
        nextKitchens = [...currentKitchens, ...newKits];
      } else {
        nextKitchens = currentKitchens.slice(0, count);
      }
      return { ...prev, kitchens: count, kitchen_sizes: nextKitchens };
    });
  };

  const handleKitchenSizeChange = (index, presetOrCustom, customLength, customWidth) => {
    setForm((prev) => {
      const kits = [...(prev.kitchen_sizes || [])];
      if (!kits[index]) return prev;

      if (presetOrCustom === 'Custom') {
        const len = customLength ?? kits[index].length_ft;
        const wid = customWidth ?? kits[index].width_ft;
        kits[index] = {
          ...kits[index],
          preset: 'Custom',
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

  const totalBedroomArea = form.room_sizes?.reduce((sum, r) => sum + r.area_sqft, 0) || 0;
  const totalKitchenArea = form.kitchen_sizes?.reduce((sum, r) => sum + r.area_sqft, 0) || 0;

  async function handleEstimate() {
    setLoading(true);
    setError(null);
    try {
      const res = await postEstimateCost(form);
      sessionStorage.setItem('ecobuild_latest_estimate', JSON.stringify(res));
      navigate(`/cost-estimation/results?id=${res.estimate_id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Estimation failed. Is the backend running?');
      setLoading(false);
    }
  }

  return (
    <div className="flex-1 flex flex-col" style={{ background: 'var(--bg-base)' }}>
      {/* ── Page Header ── */}
      <div
        className="border-b"
        style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}
      >
        <div className="max-w-screen-xl mx-auto px-6 py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 bg-[#EDE8DC] text-[#1A4D2E]">
              🏗️ Tamil Nadu Construction Intelligence
            </div>
            <h1
              className="text-2xl sm:text-3xl font-extrabold tracking-tight"
              style={{ color: 'var(--green-deep)' }}
            >
              Residential Cost, ML Material &amp; Carbon Estimation
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              Configure your residential specifications below to generate ML-predicted cost, Stage 1 quantities, and IFC Indian carbon footprint.
            </p>
          </div>
        </div>
      </div>

      {/* ── Main Form Container ── */}
      <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 flex flex-col gap-6">
        {/* Step indicators */}
        <div
          className="flex items-center gap-6 rounded-2xl p-4 sm:p-5 border"
          style={{
            background: 'var(--bg-card)',
            borderColor: 'var(--border)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <StepIndicator step={1} active={step === 1} done={step > 1} label="1. Project, Room &amp; Kitchen Dimensions" />
          <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
          <StepIndicator step={2} active={step === 2} done={false} label="2. Site, Structural &amp; Material Specs" />
        </div>

        {/* ── STEP 1: Project Details ── */}
        {step === 1 && (
          <div
            className="rounded-3xl border p-6 sm:p-8 flex flex-col gap-6 shadow-sm"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* District */}
              <Field label="Tamil Nadu District">
                <select
                  id="field-district"
                  value={form.district}
                  onChange={(e) => set('district', e.target.value)}
                  className="w-full rounded-xl px-4 py-3 text-sm font-semibold border appearance-none focus:outline-none cursor-pointer"
                  style={{
                    background: 'var(--bg-muted)',
                    borderColor: 'var(--border)',
                    color: 'var(--green-deep)',
                  }}
                >
                  {TAMIL_NADU_DISTRICTS.map((d) => (
                    <option key={d} value={d}>📍 {d}</option>
                  ))}
                </select>
              </Field>

              {/* Residential Type */}
              <Field label="Residential Building Type">
                <select
                  id="field-residential-type"
                  value={form.residential_type}
                  onChange={(e) => set('residential_type', e.target.value)}
                  className="w-full rounded-xl px-4 py-3 text-sm font-bold border appearance-none focus:outline-none cursor-pointer"
                  style={{
                    background: 'var(--bg-muted)',
                    borderColor: 'var(--border)',
                    color: 'var(--green-deep)',
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              <Field label="Built-up Area (Sq Ft)" hint="Total constructed floor area across all floors">
                <SliderInput
                  id="field-built-up-area"
                  value={form.built_up_area_sqft}
                  onChange={(v) => set('built_up_area_sqft', v)}
                  min={200}
                  max={10000}
                  step={50}
                  unit="sqft"
                  presets={[800, 1200, 1500, 2000, 2500, 3600, 5000]}
                />
              </Field>

              <Field label="Plot / Land Area (Sq Ft)" hint="Total land area (1 Ground = 2,400 sqft in TN)">
                <SliderInput
                  id="field-plot-area"
                  value={form.plot_area_sqft}
                  onChange={(v) => set('plot_area_sqft', v)}
                  min={300}
                  max={20000}
                  step={100}
                  unit="sqft"
                  presets={[
                    { label: '½ Ground (1,200)', value: 1200 },
                    { label: '1 Ground (2,400)', value: 2400 },
                    { label: '1.5 Ground (3,600)', value: 3600 },
                    { label: '2 Grounds (4,800)', value: 4800 },
                    { label: '10,000 sqft', value: 10000 },
                  ]}
                />
              </Field>
            </div>

            {/* Quantitative Counters */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 pt-2">
              <Field label="Floors">
                <StepperInput id="field-floors" value={form.floors} onChange={(v) => set('floors', v)} min={1} max={20} label="floors" />
              </Field>
              <Field label="Bedrooms">
                <StepperInput id="field-bedrooms" value={form.bedrooms} onChange={handleBedroomsChange} min={0} max={15} label="bedrooms" />
              </Field>
              <Field label="Kitchens">
                <StepperInput id="field-kitchens" value={form.kitchens} onChange={handleKitchensChange} min={0} max={5} label="kitchens" />
              </Field>
              <Field label="Bathrooms">
                <StepperInput id="field-bathrooms" value={form.bathrooms} onChange={(v) => set('bathrooms', v)} min={1} max={15} label="bathrooms" />
              </Field>
              <Field label="Car Parking">
                <StepperInput id="field-parking" value={form.parking} onChange={(v) => set('parking', v)} min={0} max={10} label="parking" />
              </Field>
            </div>

            {/* ── Bedroom Sizes Configuration ── */}
            {form.bedrooms > 0 && form.room_sizes && (
              <div
                className="rounded-2xl p-5 border flex flex-col gap-4"
                style={{ background: 'var(--bg-muted)', borderColor: 'var(--border)' }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🛏️</span>
                    <div>
                      <h3 className="text-sm font-bold text-[#1A4D2E]">Bedroom Dimensions &amp; Sizing</h3>
                      <p className="text-xs text-[#7A8C6E]">Select standard room dimensions (10x10, 10x16, etc.) or custom sizes.</p>
                    </div>
                  </div>
                  <div className="px-3 py-1 rounded-xl text-xs font-bold bg-[#1A4D2E] text-white">
                    Total Bedroom Area: {totalBedroomArea.toLocaleString()} sqft
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 pt-1">
                  {form.room_sizes.map((room, idx) => {
                    const isCustom = room.preset === 'Custom';
                    return (
                      <div key={idx} className="rounded-xl p-4 bg-white border border-[#DDD8CD] shadow-xs flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wide text-[#1A4D2E]">{room.name}</span>
                          <span className="text-xs font-bold text-[#2E7D52] bg-[#EDE8DC] px-2 py-0.5 rounded-lg">
                            {room.length_ft} × {room.width_ft} ft = {room.area_sqft} sqft
                          </span>
                        </div>
                        <div className="flex items-center flex-wrap gap-1.5">
                          {BEDROOM_PRESETS.map((preset) => {
                            const active = room.preset === preset.label;
                            return (
                              <button
                                key={preset.label}
                                type="button"
                                onClick={() => handleBedroomSizeChange(idx, preset.label)}
                                className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all border cursor-pointer ${
                                  active
                                    ? 'bg-[#1A4D2E] text-white border-[#1A4D2E] shadow-xs'
                                    : 'bg-[#FAFAF7] text-[#4B5945] border-[#DDD8CD] hover:bg-[#EDE8DC]'
                                }`}
                                title={preset.desc}
                              >
                                {preset.label}
                              </button>
                            );
                          })}
                          <button
                            type="button"
                            onClick={() => handleBedroomSizeChange(idx, 'Custom')}
                            className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all border cursor-pointer ${
                              isCustom
                                ? 'bg-[#1A4D2E] text-white border-[#1A4D2E] shadow-xs'
                                : 'bg-[#FAFAF7] text-[#4B5945] border-[#DDD8CD] hover:bg-[#EDE8DC]'
                            }`}
                          >
                            Custom Dimension
                          </button>
                        </div>
                        {isCustom && (
                          <div className="flex items-center gap-3 pt-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-semibold text-[#7A8C6E]">Length (ft):</span>
                              <input
                                type="number" min={6} max={50} step={0.5}
                                value={room.length_ft}
                                onChange={(e) => handleBedroomSizeChange(idx, 'Custom', parseFloat(e.target.value) || 0, room.width_ft)}
                                className="w-16 rounded-lg px-2 py-1 text-xs font-bold border border-[#DDD8CD] bg-[#EDE8DC] text-[#1A4D2E] text-center"
                              />
                            </div>
                            <span className="text-sm font-bold text-[#7A8C6E]">×</span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-semibold text-[#7A8C6E]">Width (ft):</span>
                              <input
                                type="number" min={6} max={50} step={0.5}
                                value={room.width_ft}
                                onChange={(e) => handleBedroomSizeChange(idx, 'Custom', room.length_ft, parseFloat(e.target.value) || 0)}
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

            {/* ── Kitchen Sizes Configuration ── */}
            {form.kitchens > 0 && form.kitchen_sizes && (
              <div
                className="rounded-2xl p-5 border flex flex-col gap-4"
                style={{ background: 'var(--bg-muted)', borderColor: 'var(--border)' }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🍳</span>
                    <div>
                      <h3 className="text-sm font-bold text-[#1A4D2E]">Kitchen Dimensions &amp; Sizing</h3>
                      <p className="text-xs text-[#7A8C6E]">Choose kitchen sizes for exact plumbing lines, countertops &amp; appliance points.</p>
                    </div>
                  </div>
                  <div className="px-3 py-1 rounded-xl text-xs font-bold bg-[#2E7D52] text-white">
                    Total Kitchen Area: {totalKitchenArea.toLocaleString()} sqft
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 pt-1">
                  {form.kitchen_sizes.map((kit, idx) => {
                    const isCustom = kit.preset === 'Custom';
                    return (
                      <div key={idx} className="rounded-xl p-4 bg-white border border-[#DDD8CD] shadow-xs flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wide text-[#1A4D2E]">{kit.name}</span>
                          <span className="text-xs font-bold text-[#2E7D52] bg-[#EDE8DC] px-2 py-0.5 rounded-lg">
                            {kit.length_ft} × {kit.width_ft} ft = {kit.area_sqft} sqft
                          </span>
                        </div>
                        <div className="flex items-center flex-wrap gap-1.5">
                          {KITCHEN_PRESETS.map((preset) => {
                            const active = kit.preset === preset.label;
                            return (
                              <button
                                key={preset.label}
                                type="button"
                                onClick={() => handleKitchenSizeChange(idx, preset.label)}
                                className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all border cursor-pointer ${
                                  active
                                    ? 'bg-[#1A4D2E] text-white border-[#1A4D2E] shadow-xs'
                                    : 'bg-[#FAFAF7] text-[#4B5945] border-[#DDD8CD] hover:bg-[#EDE8DC]'
                                }`}
                                title={preset.desc}
                              >
                                {preset.label}
                              </button>
                            );
                          })}
                          <button
                            type="button"
                            onClick={() => handleKitchenSizeChange(idx, 'Custom')}
                            className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all border cursor-pointer ${
                              isCustom
                                ? 'bg-[#1A4D2E] text-white border-[#1A4D2E] shadow-xs'
                                : 'bg-[#FAFAF7] text-[#4B5945] border-[#DDD8CD] hover:bg-[#EDE8DC]'
                            }`}
                          >
                            Custom Dimension
                          </button>
                        </div>
                        {isCustom && (
                          <div className="flex items-center gap-3 pt-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-semibold text-[#7A8C6E]">Length (ft):</span>
                              <input
                                type="number" min={5} max={40} step={0.5}
                                value={kit.length_ft}
                                onChange={(e) => handleKitchenSizeChange(idx, 'Custom', parseFloat(e.target.value) || 0, kit.width_ft)}
                                className="w-16 rounded-lg px-2 py-1 text-xs font-bold border border-[#DDD8CD] bg-[#EDE8DC] text-[#1A4D2E] text-center"
                              />
                            </div>
                            <span className="text-sm font-bold text-[#7A8C6E]">×</span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-semibold text-[#7A8C6E]">Width (ft):</span>
                              <input
                                type="number" min={5} max={40} step={0.5}
                                value={kit.width_ft}
                                onChange={(e) => handleKitchenSizeChange(idx, 'Custom', kit.length_ft, parseFloat(e.target.value) || 0)}
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

            {/* Finish Quality & Add-ons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              <Field label="Finish Quality Level">
                <SegmentedToggle
                  id="field-finish-quality"
                  options={[
                    { value: 'Standard', label: 'Standard' },
                    { value: 'Premium', label: 'Premium (+15%)' },
                    { value: 'Luxury', label: 'Luxury (+35%)' },
                  ]}
                  value={form.finish_quality}
                  onChange={(v) => set('finish_quality', v)}
                />
              </Field>

              <Field label="Sustainable Add-ons">
                <div className="flex flex-col gap-3 pt-1">
                  <Toggle
                    id="toggle-solar"
                    checked={form.solar_panels}
                    onChange={(v) => set('solar_panels', v)}
                    label="Rooftop Solar Panels"
                  />
                  <Toggle
                    id="toggle-rwh"
                    checked={form.rainwater_harvesting}
                    onChange={(v) => set('rainwater_harvesting', v)}
                    label="Rainwater Harvesting (TN Compliant)"
                  />
                </div>
              </Field>
            </div>

            {/* Inflation index */}
            <Field label="Market Inflation Index" hint="Adjust for local price trends (1.00 = current baseline rates)">
              <SliderInput
                id="field-inflation"
                value={form.inflation_index}
                onChange={(v) => set('inflation_index', v)}
                min={0.8}
                max={2.0}
                step={0.05}
                formatValue={(v) => `${v.toFixed(2)}x`}
              />
            </Field>

            <div className="flex justify-end pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
              <button
                id="btn-next-step"
                type="button"
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold text-white shadow-md hover:shadow-lg active:scale-95 transition-all cursor-pointer"
                style={{ background: 'var(--green-deep)' }}
              >
                Next: Site &amp; Structure Specifications →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: Site & Structure ── */}
        {step === 2 && (
          <div
            className="rounded-3xl border p-6 sm:p-8 flex flex-col gap-6 shadow-sm"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Field label="Soil Type">
                <SegmentedToggle
                  id="field-soil-type"
                  options={[
                    { value: 'Clay', label: 'Clay' },
                    { value: 'Sandy', label: 'Sandy' },
                    { value: 'Loamy', label: 'Loamy' },
                    { value: 'Rocky', label: 'Rocky' },
                    { value: 'Black Cotton', label: 'Black Cotton' },
                  ]}
                  value={form.soil_type}
                  onChange={(v) => set('soil_type', v)}
                />
              </Field>

              <Field label="Land Topography">
                <SegmentedToggle
                  id="field-land-type"
                  options={[
                    { value: 'Flat', label: 'Flat Land' },
                    { value: 'Sloped', label: 'Sloped Terrain' },
                    { value: 'Hilly', label: 'Hilly Area' },
                  ]}
                  value={form.land_type}
                  onChange={(v) => set('land_type', v)}
                />
              </Field>

              <Field label="Foundation Type">
                <SegmentedToggle
                  id="field-foundation-type"
                  options={[
                    { value: 'Strip', label: 'Strip' },
                    { value: 'Raft', label: 'Raft' },
                    { value: 'Pile', label: 'Pile' },
                    { value: 'Isolated Footing', label: 'Isolated' },
                  ]}
                  value={form.foundation_type}
                  onChange={(v) => set('foundation_type', v)}
                />
              </Field>

              <Field label="Foundation Depth">
                <SliderInput
                  id="field-foundation-depth"
                  value={form.foundation_depth_ft}
                  onChange={(v) => set('foundation_depth_ft', v)}
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
                    { value: 'Brick', label: 'Burnt Clay Brick' },
                    { value: 'AAC Block', label: 'AAC Light Block' },
                    { value: 'Hollow Block', label: 'Hollow Block' },
                    { value: 'Stone', label: 'Stone Masonry' },
                  ]}
                  value={form.wall_material}
                  onChange={(v) => set('wall_material', v)}
                />
              </Field>

              <Field label="Roof Type">
                <SegmentedToggle
                  id="field-roof-type"
                  options={[
                    { value: 'RCC Flat', label: 'RCC Flat Slab' },
                    { value: 'Sloped Tile', label: 'Sloped Clay Tile' },
                    { value: 'Metal Sheet', label: 'Metal Sheet' },
                    { value: 'Thatched', label: 'Traditional' },
                  ]}
                  value={form.roof_type}
                  onChange={(v) => set('roof_type', v)}
                />
              </Field>

              <Field label="Flooring Type" hint="Selected flooring material">
                <SegmentedToggle
                  id="field-flooring"
                  options={[
                    { value: 'Ceramic Tile', label: 'Ceramic' },
                    { value: 'Vitrified Tile', label: 'Vitrified Tile' },
                    { value: 'Marble', label: 'Marble' },
                    { value: 'Granite', label: 'Granite' },
                    { value: 'Concrete', label: 'Concrete' },
                  ]}
                  value={form.flooring}
                  onChange={(v) => set('flooring', v)}
                />
              </Field>
            </div>

            {error && (
              <div
                className="rounded-xl px-4 py-3 text-sm font-medium flex items-start gap-2"
                style={{ background: '#FEF2F2', color: '#991B1B', border: '1px solid #FCA5A5' }}
              >
                <span>⚠️</span>
                {error}
              </div>
            )}

            <div className="flex items-center justify-between pt-6 border-t" style={{ borderColor: 'var(--border)' }}>
              <button
                id="btn-prev-step"
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold border transition-all hover:bg-[#EDE8DC] cursor-pointer"
                style={{ borderColor: 'var(--border)', color: 'var(--green-deep)', background: 'var(--bg-muted)' }}
              >
                ← Back to Step 1
              </button>

              <button
                id="btn-generate-estimate"
                type="button"
                onClick={handleEstimate}
                disabled={loading}
                className="inline-flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold text-white shadow-md hover:shadow-lg active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                style={{ background: 'linear-gradient(135deg, #D4541A, var(--rust))' }}
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Generating Prediction Report…
                  </>
                ) : (
                  <span>⚡ Generate Cost, Material &amp; Carbon Report →</span>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
