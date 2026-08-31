"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { getRates, postRates, getRateHistory, deleteRate } from "@/lib/api";
import type { RateEntry, RateEntryCreate, RateCategory } from "@/lib/types";

// ── Categories & Metadata ───────────────────────────────────────────────────
const CATEGORIES: { key: RateCategory; label: string; icon: string }[] = [
  { key: "Material", label: "Material", icon: "🧱" },
  { key: "Labour", label: "Labour", icon: "👷" },
  { key: "Electrical", label: "Electrical", icon: "⚡" },
  { key: "Plumbing", label: "Plumbing", icon: "🔧" },
  { key: "Painting", label: "Painting", icon: "🎨" },
  { key: "Finishing", label: "Finishing", icon: "✨" },
  { key: "Approval-Misc", label: "Approval & Misc", icon: "📋" },
];

const CATEGORY_COLORS: Record<RateCategory, { bg: string; text: string; border: string }> = {
  "Material":      { bg: "#D1FAE5", text: "#065F46", border: "#A7F3D0" },
  "Labour":        { bg: "#DBEAFE", text: "#1E40AF", border: "#BFDBFE" },
  "Electrical":    { bg: "#FEF3C7", text: "#92400E", border: "#FDE68A" },
  "Plumbing":      { bg: "#E0E7FF", text: "#3730A3", border: "#C7D2FE" },
  "Painting":      { bg: "#FCE7F3", text: "#9D174D", border: "#FBCFE8" },
  "Finishing":     { bg: "#F3E8FF", text: "#6B21A8", border: "#E9D5FF" },
  "Approval-Misc": { bg: "#FEE2E2", text: "#991B1B", border: "#FECACA" },
};

// Standard material items for the Material dropdown
const STANDARD_MATERIALS = [
  { name: "Cement (Portland OPC 53)", unit: "bag", defaultRate: 380, notes: "50kg bag; Ariyalur belt pricing" },
  { name: "Reinforcement Steel (TMT Fe500)", unit: "ton", defaultRate: 68000, notes: "Primary TMT rebar per metric ton" },
  { name: "M-Sand (Fine Aggregate)", unit: "ton", defaultRate: 1800, notes: "Manufactured sand for brickwork & concrete" },
  { name: "Coarse Aggregate (20mm)", unit: "ton", defaultRate: 1200, notes: "20mm crushed granite blue metal" },
  { name: "Burnt Clay Bricks", unit: "count", defaultRate: 9.0, notes: "Standard 9-inch table moulded red bricks" },
  { name: "Hollow Concrete Blocks", unit: "count", defaultRate: 45.0, notes: "Standard 8-inch concrete hollow blocks" },
  { name: "AAC Lightweight Blocks", unit: "count", defaultRate: 65.0, notes: "600x200x150mm autoclaved aerated blocks" },
  { name: "Stone Masonry Blocks", unit: "ton", defaultRate: 1400, notes: "Random rubble stone for foundation" },
  { name: "River Sand (Plastering)", unit: "ton", defaultRate: 2800, notes: "Natural washed river sand for fine plaster" },
  { name: "Ready Mix Concrete (M20/M25)", unit: "sqft", defaultRate: 320, notes: "Ready-mix slab pouring per sqft" },
];

const DEFAULT_CATEGORY_DEFAULTS: Record<RateCategory, { itemName: string; unit: string; rate: number }> = {
  Material: { itemName: "Cement (Portland OPC 53)", unit: "bag", rate: 380 },
  Labour: { itemName: "Skilled Labour (Mason/Carpenter)", unit: "day", rate: 900 },
  Electrical: { itemName: "Electrical Point Wiring", unit: "point", rate: 2500 },
  Plumbing: { itemName: "Plumbing Fixture Installation", unit: "fixture", rate: 4500 },
  Painting: { itemName: "Interior Painting (2 coats emulsion)", unit: "sqft", rate: 28 },
  Finishing: { itemName: "Floor Finishing (tiles + laying)", unit: "sqft", rate: 180 },
  "Approval-Misc": { itemName: "Approval & Misc (flat %)", unit: "%", rate: 4.0 },
};

const UNITS = ["sqft", "bag", "ton", "count", "day", "point", "fixture", "unit", "%", "ft"];

const TN_DISTRICTS = [
  "default", "Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem",
  "Tirunelveli", "Tiruppur", "Erode", "Vellore", "Dindigul", "Thanjavur",
  "Cuddalore", "Kanchipuram", "Villupuram", "Pudukottai", "Tiruvannamalai",
  "Namakkal", "Ramanathapuram", "Krishnagiri", "Dharmapuri", "Nagapattinam",
  "Sivaganga", "Virudhunagar", "Thoothukudi", "Perambalur", "Ariyalur",
  "Karur", "Nilgiris", "Theni", "Kallakurichi", "Ranipet", "Chengalpattu",
  "Tenkasi", "Mayiladuthurai", "Tirupattur",
];

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
}

// ── Category badge ───────────────────────────────────────────────────────────
function CategoryBadge({ cat }: { cat: RateCategory }) {
  const col = CATEGORY_COLORS[cat] ?? { bg: "#F3F4F6", text: "#374151", border: "#E5E7EB" };
  const icon = CATEGORIES.find(c => c.key === cat)?.icon || "📦";
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border"
      style={{ background: col.bg, color: col.text, borderColor: col.border }}
    >
      <span>{icon}</span>
      {cat}
    </span>
  );
}

// ── History drawer ───────────────────────────────────────────────────────────
function HistoryDrawer({ item, district, onClose }: { item: string; district: string; onClose: () => void }) {
  const [history, setHistory] = useState<RateEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRateHistory(item, district)
      .then(setHistory)
      .finally(() => setLoading(false));
  }, [item, district]);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.45)" }}>
      <div
        className="w-full max-w-lg rounded-2xl flex flex-col gap-4 p-6 shadow-2xl"
        style={{ background: "var(--bg-card)", maxHeight: "80vh" }}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-bold" style={{ color: "var(--green-deep)" }}>Rate Changelog & Audit Trail</h3>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
              {item} · {district === "default" ? "All Tamil Nadu Districts" : district}
            </p>
          </div>
          <button
            id="btn-close-history"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-lg hover:opacity-70 transition-opacity cursor-pointer"
            style={{ background: "var(--bg-muted)", color: "var(--text-body)" }}
          >
            ×
          </button>
        </div>

        <div className="overflow-y-auto flex flex-col gap-2.5 pr-1" style={{ maxHeight: "calc(80vh - 120px)" }}>
          {loading && (
            <div className="flex items-center justify-center py-10">
              <svg className="w-6 h-6 animate-spin" style={{ color: "var(--green-muted)" }} fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          )}
          {!loading && history.length === 0 && (
            <p className="text-sm text-center py-8" style={{ color: "var(--text-muted)" }}>No previous rate history found.</p>
          )}
          {!loading && history.map((entry, i) => (
            <div
              key={entry._id ?? i}
              className="flex items-center justify-between rounded-xl px-4 py-3 border"
              style={{
                background: i === 0 ? "var(--bg-muted)" : "var(--bg-card)",
                borderColor: "var(--border)",
              }}
            >
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold tabular-nums" style={{ color: "var(--green-deep)" }}>
                    ₹{entry.rate_value.toLocaleString("en-IN")} / {entry.unit}
                  </span>
                  {i === 0 && (
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: "var(--green-deep)", color: "white" }}
                    >
                      Active
                    </span>
                  )}
                </div>
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                  Effective: {fmtDate(entry.effective_date)} · Updated by <strong className="text-[#1A4D2E]">{entry.updated_by}</strong>
                  {entry.is_default && (
                    <span className="ml-1 text-xs" style={{ color: "var(--green-muted)" }}>(system baseline)</span>
                  )}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Rate Form Panel ─────────────────────────────────────────────────────────
function AddRatePanel({
  prefill,
  onSubmit,
  onCancel,
  submitting,
  error,
}: {
  prefill?: RateEntry | null;
  onSubmit: (r: RateEntryCreate) => void;
  onCancel: () => void;
  submitting: boolean;
  error: string | null;
}) {
  const [category, setCategory] = useState<RateCategory>(prefill?.category ?? "Material");
  const [selectedMaterial, setSelectedMaterial] = useState<string>(prefill?.item_name ?? STANDARD_MATERIALS[0].name);
  const [isCustomMaterial, setIsCustomMaterial] = useState<boolean>(false);
  const [customMaterialName, setCustomMaterialName] = useState<string>("");
  const [directItemName, setDirectItemName] = useState<string>(prefill?.item_name ?? "");
  const [unit, setUnit] = useState<string>(prefill?.unit ?? "bag");
  const [rateValue, setRateValue] = useState<number>(prefill?.rate_value ?? 380);
  const [district, setDistrict] = useState<string>(prefill?.district ?? "default");
  const [updatedBy, setUpdatedBy] = useState<string>(prefill?.updated_by ?? "Ar. S. Vignesh (Chief Architect)");

  // Sync prefill on Edit
  useEffect(() => {
    if (prefill) {
      setCategory(prefill.category);
      setUnit(prefill.unit);
      setRateValue(prefill.rate_value);
      setDistrict(prefill.district);
      setUpdatedBy(prefill.updated_by || "Ar. S. Vignesh (Chief Architect)");

      if (prefill.category === "Material") {
        const found = STANDARD_MATERIALS.find(m => m.name === prefill.item_name);
        if (found) {
          setSelectedMaterial(prefill.item_name);
          setIsCustomMaterial(false);
        } else {
          setSelectedMaterial("__CUSTOM__");
          setIsCustomMaterial(true);
          setCustomMaterialName(prefill.item_name);
        }
      } else {
        setDirectItemName(prefill.item_name);
      }
    } else {
      // Default to Material
      setCategory("Material");
      setSelectedMaterial(STANDARD_MATERIALS[0].name);
      setIsCustomMaterial(false);
      setUnit(STANDARD_MATERIALS[0].unit);
      setRateValue(STANDARD_MATERIALS[0].defaultRate);
    }
  }, [prefill]);

  // When Category changes:
  const handleCategoryChange = (newCat: RateCategory) => {
    setCategory(newCat);
    const def = DEFAULT_CATEGORY_DEFAULTS[newCat];
    if (newCat === "Material") {
      setSelectedMaterial(STANDARD_MATERIALS[0].name);
      setIsCustomMaterial(false);
      setUnit(STANDARD_MATERIALS[0].unit);
      setRateValue(STANDARD_MATERIALS[0].defaultRate);
    } else {
      setDirectItemName(def.itemName);
      setUnit(def.unit);
      setRateValue(def.rate);
    }
  };

  // When Material dropdown changes:
  const handleMaterialDropdownChange = (val: string) => {
    if (val === "__CUSTOM__") {
      setIsCustomMaterial(true);
      setSelectedMaterial("__CUSTOM__");
    } else {
      setIsCustomMaterial(false);
      setSelectedMaterial(val);
      const found = STANDARD_MATERIALS.find(m => m.name === val);
      if (found) {
        setUnit(found.unit);
        setRateValue(found.defaultRate);
      }
    }
  };

  const effectiveItemName =
    category === "Material"
      ? isCustomMaterial
        ? customMaterialName.trim()
        : selectedMaterial
      : directItemName.trim();

  const handleSubmit = () => {
    if (!effectiveItemName || rateValue <= 0) return;
    onSubmit({
      item_name: effectiveItemName,
      category,
      unit,
      rate_value: rateValue,
      district,
      updated_by: updatedBy.trim() || "Architect",
      is_default: false,
    });
  };

  const labelCls = "text-xs font-bold uppercase tracking-wider text-[#1A4D2E]";
  const inputCls = "w-full rounded-xl px-4 py-2.5 text-sm font-medium border focus:outline-none";
  const inputStyle = {
    background: "var(--bg-muted)",
    borderColor: "var(--border)",
    color: "var(--green-deep)",
  };

  return (
    <div
      className="rounded-2xl border p-6 flex flex-col gap-5 shadow-lg"
      style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
    >
      <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: "var(--border)" }}>
        <div>
          <h3 className="text-base font-extrabold" style={{ color: "var(--green-deep)" }}>
            {prefill ? "✏️ Edit Rate (Versioned Entry)" : "➕ Add / Override Market Rate"}
          </h3>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
            Set category, define rate per unit / sqft, select district and record architect audit info.
          </p>
        </div>
        <button
          id="btn-cancel-add-rate"
          type="button"
          onClick={onCancel}
          className="text-xs px-3 py-1.5 rounded-lg border transition-all hover:opacity-80 cursor-pointer"
          style={{ borderColor: "var(--border)", color: "var(--text-muted)", background: "var(--bg-muted)" }}
        >
          Cancel
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* ── 1. Category Field (First) ── */}
        <div className="flex flex-col gap-2 md:col-span-2">
          <label className={labelCls}>
            1. Select Category
          </label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => {
              const active = category === cat.key;
              const col = CATEGORY_COLORS[cat.key];
              return (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => handleCategoryChange(cat.key)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-150 border cursor-pointer ${
                    active ? "shadow-sm scale-102" : "hover:bg-[#EDE8DC] opacity-85"
                  }`}
                  style={{
                    background: active ? col.bg : "var(--bg-muted)",
                    color: col.text,
                    borderColor: active ? col.text : "var(--border)",
                  }}
                >
                  <span className="text-base">{cat.icon}</span>
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── 2. Item Name Field ── */}
        <div className="flex flex-col gap-1.5 md:col-span-2">
          <label className={labelCls}>
            2. {category === "Material" ? "Material Name (Steel, Bricks, Cement, Blocks, etc.)" : `${category} Item / Work Description`}
          </label>

          {category === "Material" ? (
            /* Dropdown ONLY for Material */
            <>
              <select
                id="add-rate-material-dropdown"
                value={isCustomMaterial ? "__CUSTOM__" : selectedMaterial}
                onChange={e => handleMaterialDropdownChange(e.target.value)}
                className={inputCls}
                style={inputStyle}
              >
                <optgroup label="Standard Construction Materials">
                  {STANDARD_MATERIALS.map(m => (
                    <option key={m.name} value={m.name}>
                      {m.name} ({m.unit})
                    </option>
                  ))}
                </optgroup>
                <option value="__CUSTOM__">➕ Enter Custom Material...</option>
              </select>

              {isCustomMaterial && (
                <input
                  id="add-rate-custom-material-name"
                  type="text"
                  value={customMaterialName}
                  onChange={e => setCustomMaterialName(e.target.value)}
                  placeholder="Enter custom material name (e.g. Granite Slab 20mm, Teak Wood Planks)"
                  className={inputCls + " mt-1.5"}
                  style={inputStyle}
                />
              )}
            </>
          ) : (
            /* Direct text input for Labour, Painting, Plumbing, Electricity, Finishing, Approval */
            <input
              id="add-rate-direct-item-name"
              type="text"
              value={directItemName}
              onChange={e => setDirectItemName(e.target.value)}
              placeholder={`e.g. ${DEFAULT_CATEGORY_DEFAULTS[category].itemName}`}
              className={inputCls}
              style={inputStyle}
            />
          )}
        </div>

        {/* ── 3. Unit Field ── */}
        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>
            3. Measurement Unit
          </label>
          <select
            id="add-rate-unit"
            value={unit}
            onChange={e => setUnit(e.target.value)}
            className={inputCls}
            style={inputStyle}
          >
            {UNITS.map(u => (
              <option key={u} value={u}>
                {u === "sqft" ? "sqft (Square Feet - Area)" :
                 u === "bag" ? "bag (Cement 50kg Bag)" :
                 u === "ton" ? "ton (Metric Ton - Steel / Sand)" :
                 u === "day" ? "day (Labour Man-Day)" :
                 u === "point" ? "point (Electrical Switch / Plug)" :
                 u === "fixture" ? "fixture (Plumbing WC / Basin)" :
                 u === "count" ? "count (Brick / Block Count)" :
                 u === "%" ? "% (Flat Percentage)" :
                 u === "unit" ? "unit (Door / Tank Unit)" : u}
              </option>
            ))}
          </select>
        </div>

        {/* ── 4. Rate per unit / sqft ── */}
        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>
            4. Rate (₹ per {unit})
          </label>
          <div className="relative">
            <span
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-extrabold"
              style={{ color: "var(--green-deep)" }}
            >
              ₹
            </span>
            <input
              id="add-rate-value"
              type="number"
              min={0.01}
              step={0.01}
              value={rateValue || ""}
              onChange={e => setRateValue(parseFloat(e.target.value) || 0)}
              className={inputCls + " pl-8 font-bold"}
              style={inputStyle}
              placeholder="0.00"
            />
            <span
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold px-2 py-0.5 rounded-md"
              style={{ background: "#DDD8CD", color: "#1A4D2E" }}
            >
              per {unit}
            </span>
          </div>
        </div>

        {/* ── 5. Tamil Nadu District ── */}
        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>
            5. Applicable District
          </label>
          <select
            id="add-rate-district"
            value={district}
            onChange={e => setDistrict(e.target.value)}
            className={inputCls}
            style={inputStyle}
          >
            {TN_DISTRICTS.map(d => (
              <option key={d} value={d}>
                {d === "default" ? "🌐 Default (All Tamil Nadu Districts)" : `📍 ${d}`}
              </option>
            ))}
          </select>
        </div>

        {/* ── 6. Updated By Architect ── */}
        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>
            6. Updated By (Architect / Estimator)
          </label>
          <input
            id="add-rate-updated-by"
            type="text"
            value={updatedBy}
            onChange={e => setUpdatedBy(e.target.value)}
            placeholder="e.g. Ar. Ramesh Kumar (Senior Architect)"
            className={inputCls}
            style={inputStyle}
          />
        </div>
      </div>

      {error && (
        <div
          className="rounded-xl px-4 py-3 text-sm font-medium flex items-center gap-2"
          style={{ background: "#FEF2F2", color: "#991B1B", border: "1px solid #FCA5A5" }}
        >
          <span>⚠️</span> {error}
        </div>
      )}

      <div className="flex items-center gap-3 pt-2">
        <button
          id="btn-submit-rate"
          type="button"
          onClick={handleSubmit}
          disabled={submitting || !effectiveItemName || rateValue <= 0}
          className="flex-1 py-3 rounded-xl text-sm font-bold text-white shadow-md hover:shadow-lg active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          style={{ background: "linear-gradient(135deg, var(--green-mid), var(--green-deep))" }}
        >
          {submitting ? "Saving Rate…" : prefill ? "✓ Submit New Rate Version" : `✓ Save Rate (₹${rateValue.toLocaleString("en-IN")} / ${unit})`}
        </button>

        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-3 rounded-xl text-sm font-semibold border transition-all hover:bg-[#EDE8DC] cursor-pointer"
          style={{ borderColor: "var(--border)", color: "var(--text-body)" }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ── Main Rate Master Page ───────────────────────────────────────────────────
export default function RateMasterPage() {
  const [rates, setRates] = useState<RateEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCat, setFilterCat] = useState<RateCategory | "All">("All");
  const [filterDistrict, setFilterDistrict] = useState("default");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState<RateEntry | null>(null);
  const [historyTarget, setHistoryTarget] = useState<{ item: string; district: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadRates = useCallback(async (district = filterDistrict) => {
    setLoading(true);
    try {
      const data = await getRates(district);
      setRates(data);
    } catch {
      setRates([]);
    } finally {
      setLoading(false);
    }
  }, [filterDistrict]);

  useEffect(() => {
    loadRates(filterDistrict);
  }, [filterDistrict, loadRates]);

  async function handleSubmitRate(entry: RateEntryCreate) {
    setSubmitting(true);
    setSubmitError(null);
    try {
      await postRates({ rates: [entry] });
      setShowAdd(false);
      setEditTarget(null);
      setSuccessMsg(`✓ Successfully recorded rate for "${entry.item_name}" (₹${entry.rate_value.toLocaleString("en-IN")}/${entry.unit}).`);
      setTimeout(() => setSuccessMsg(null), 4000);
      await loadRates(filterDistrict);
    } catch (e: unknown) {
      setSubmitError(e instanceof Error ? e.message : "Failed to submit rate.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteRate(rate: RateEntry) {
    const idToDelete = rate._id || rate.item_name;
    const confirmDelete = window.confirm(`Are you sure you want to delete the rate for "${rate.item_name}" (${rate.district === "default" ? "All Districts" : rate.district})?`);
    if (!confirmDelete) return;

    setDeletingId(idToDelete);
    try {
      await deleteRate(idToDelete);
      setSuccessMsg(`🗑️ Successfully deleted rate for "${rate.item_name}".`);
      setTimeout(() => setSuccessMsg(null), 4000);
      await loadRates(filterDistrict);
    } catch (e: unknown) {
      alert(`Error deleting rate: ${e instanceof Error ? e.message : "Unknown error"}`);
    } finally {
      setDeletingId(null);
    }
  }

  const filtered = useMemo(() => {
    return rates.filter(r => {
      const matchesCat = filterCat === "All" || r.category === filterCat;
      const matchesQuery = !searchQuery || r.item_name.toLowerCase().includes(searchQuery.toLowerCase()) || r.updated_by.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesQuery;
    });
  }, [rates, filterCat, searchQuery]);

  return (
    <div className="flex-1 flex flex-col" style={{ background: "var(--bg-base)" }}>
      {/* Page header */}
      <div className="border-b" style={{ borderColor: "var(--border)", background: "var(--bg-card)" }}>
        <div className="max-w-screen-xl mx-auto px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: "var(--green-deep)" }}>
              Rate Master Admin
            </h1>
            <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
              Manage material & labor rates · per sqft & unit pricing · district overrides · delete & audit capabilities
            </p>
          </div>
          <button
            id="btn-open-add-rate"
            type="button"
            onClick={() => { setShowAdd(true); setEditTarget(null); }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-md hover:shadow-lg active:scale-95 transition-all duration-200 flex-shrink-0 cursor-pointer"
            style={{ background: "linear-gradient(135deg, #D4541A, var(--rust))" }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add / Update Rate
          </button>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto w-full px-4 sm:px-6 py-6 flex flex-col gap-6">

        {/* Success toast */}
        {successMsg && (
          <div
            className="rounded-xl px-4 py-3 text-sm font-semibold flex items-center gap-2"
            style={{ background: "#D1FAE5", color: "#065F46", border: "1px solid #A7F3D0" }}
          >
            {successMsg}
          </div>
        )}

        {/* Add/Edit form panel */}
        {(showAdd || editTarget) && (
          <AddRatePanel
            prefill={editTarget}
            onSubmit={handleSubmitRate}
            onCancel={() => { setShowAdd(false); setEditTarget(null); setSubmitError(null); }}
            submitting={submitting}
            error={submitError}
          />
        )}

        {/* Filters bar */}
        <div
          className="rounded-2xl border p-4 flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between"
          style={{ background: "var(--bg-card)", borderColor: "var(--border)", boxShadow: "var(--shadow-card)" }}
        >
          {/* Category filter chips */}
          <div className="flex flex-col gap-1.5 flex-1">
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--green-muted)" }}>
              Filter by Category
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setFilterCat("All")}
                className="px-3 py-1.5 rounded-xl text-xs font-bold border transition-all duration-150 cursor-pointer"
                style={
                  filterCat === "All"
                    ? { background: "var(--green-deep)", color: "white", borderColor: "var(--green-deep)" }
                    : { background: "var(--bg-muted)", color: "var(--text-muted)", borderColor: "transparent" }
                }
              >
                All ({rates.length})
              </button>
              {CATEGORIES.map(cat => {
                const count = rates.filter(r => r.category === cat.key).length;
                const isSelected = filterCat === cat.key;
                return (
                  <button
                    key={cat.key}
                    id={`filter-cat-${cat.key.toLowerCase()}`}
                    type="button"
                    onClick={() => setFilterCat(cat.key)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-150 cursor-pointer"
                    style={
                      isSelected
                        ? { background: "var(--green-deep)", color: "white", borderColor: "var(--green-deep)" }
                        : { background: "var(--bg-muted)", color: "var(--text-muted)", borderColor: "transparent" }
                    }
                  >
                    <span>{cat.icon}</span>
                    {cat.label} {count > 0 && <span className="opacity-70 text-[10px]">({count})</span>}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            {/* Search input */}
            <div className="flex flex-col gap-1.5 w-full sm:w-56">
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--green-muted)" }}>
                Search
              </span>
              <input
                type="text"
                placeholder="Search material/architect..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full rounded-xl px-3.5 py-1.5 text-xs font-medium border focus:outline-none"
                style={{ background: "var(--bg-muted)", borderColor: "var(--border)", color: "var(--green-deep)" }}
              />
            </div>

            {/* District dropdown */}
            <div className="flex flex-col gap-1.5 w-full sm:w-56">
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--green-muted)" }}>
                District Rates
              </span>
              <select
                id="filter-district"
                value={filterDistrict}
                onChange={e => setFilterDistrict(e.target.value)}
                className="w-full rounded-xl px-3.5 py-1.5 text-xs font-semibold border appearance-none focus:outline-none cursor-pointer"
                style={{ background: "var(--bg-muted)", borderColor: "var(--border)", color: "var(--green-deep)" }}
              >
                {TN_DISTRICTS.map(d => (
                  <option key={d} value={d}>
                    {d === "default" ? "🌐 Default (All TN Baseline)" : `📍 ${d}`}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Rates Table */}
        <div
          className="rounded-2xl border overflow-hidden"
          style={{ background: "var(--bg-card)", borderColor: "var(--border)", boxShadow: "var(--shadow-card)" }}
        >
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <svg className="w-7 h-7 animate-spin" style={{ color: "var(--green-muted)" }} fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="text-4xl opacity-30">📋</div>
              <p className="text-sm font-semibold" style={{ color: "var(--text-muted)" }}>
                No rates match the selected filter.
              </p>
              <button
                type="button"
                onClick={() => { setFilterCat("All"); setSearchQuery(""); }}
                className="text-xs text-[#1A4D2E] font-bold underline cursor-pointer"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: `1px solid var(--border)`, background: "var(--bg-muted)" }}>
                    {["Category", "Material / Item Description", "Unit", "Rate (₹)", "District", "Last Updated", "Architect", "Actions"].map((h, i) => (
                      <th
                        key={i}
                        className="px-4 py-3 text-xs font-bold uppercase tracking-wider whitespace-nowrap"
                        style={{ color: "var(--green-muted)" }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((rate, idx) => (
                    <tr
                      key={rate._id ?? idx}
                      className="border-b transition-colors duration-100"
                      style={{
                        borderColor: "var(--border)",
                        background: idx % 2 === 0 ? "var(--bg-card)" : "var(--bg-base)",
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = "rgba(26,77,46,0.04)")}
                      onMouseLeave={e => (e.currentTarget.style.background = idx % 2 === 0 ? "var(--bg-card)" : "var(--bg-base)")}
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        <CategoryBadge cat={rate.category} />
                      </td>

                      <td className="px-4 py-3 text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                        <div className="flex items-center gap-2">
                          <span>{rate.item_name}</span>
                          {rate.is_default && (
                            <span
                              className="text-[10px] px-1.5 py-0.5 rounded font-bold flex-shrink-0"
                              style={{ background: "var(--bg-muted)", color: "var(--green-muted)" }}
                            >
                              baseline
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3 text-xs font-semibold tabular-nums" style={{ color: "var(--text-muted)" }}>
                        {rate.unit}
                      </td>

                      <td className="px-4 py-3 text-sm font-extrabold tabular-nums" style={{ color: "var(--green-deep)" }}>
                        ₹{rate.rate_value.toLocaleString("en-IN")} <span className="text-xs font-normal text-[#7A8C6E]">/{rate.unit}</span>
                      </td>

                      <td className="px-4 py-3 text-xs font-semibold" style={{ color: "var(--text-body)" }}>
                        {rate.district === "default" ? (
                          <span className="text-[#7A8C6E]">🌐 All Districts</span>
                        ) : (
                          <span className="font-bold text-[#1A4D2E]">📍 {rate.district}</span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: "var(--text-muted)" }}>
                        {fmtDate(rate.effective_date)}
                      </td>

                      <td className="px-4 py-3 text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
                        {rate.updated_by}
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            id={`btn-edit-rate-${idx}`}
                            type="button"
                            onClick={() => {
                              setEditTarget(rate);
                              setShowAdd(false);
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                            title="Edit this rate"
                            className="text-xs px-2.5 py-1.5 rounded-lg font-bold border transition-all hover:shadow-xs cursor-pointer"
                            style={{ borderColor: "var(--border)", color: "var(--green-deep)", background: "var(--bg-muted)" }}
                          >
                            ✏️ Edit
                          </button>

                          <button
                            id={`btn-history-rate-${idx}`}
                            type="button"
                            onClick={() => setHistoryTarget({ item: rate.item_name, district: rate.district })}
                            title="View changelog & rate history"
                            className="w-7 h-7 rounded-lg flex items-center justify-center border transition-all hover:shadow-xs cursor-pointer"
                            style={{ borderColor: "var(--border)", background: "var(--bg-muted)", color: "var(--green-muted)" }}
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </button>

                          {/* Delete button */}
                          <button
                            id={`btn-delete-rate-${idx}`}
                            type="button"
                            onClick={() => handleDeleteRate(rate)}
                            disabled={deletingId === (rate._id || rate.item_name)}
                            title="Delete this rate entry"
                            className="w-7 h-7 rounded-lg flex items-center justify-center border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 hover:border-red-300 transition-all cursor-pointer disabled:opacity-50"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* History modal drawer */}
      {historyTarget && (
        <HistoryDrawer
          item={historyTarget.item}
          district={historyTarget.district}
          onClose={() => setHistoryTarget(null)}
        />
      )}
    </div>
  );
}
