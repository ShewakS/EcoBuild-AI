export function SegmentedToggle({
  id,
  options = [],
  value,
  onChange,
  className = '',
}) {
  return (
    <div
      id={id}
      className={`inline-flex rounded-xl bg-[#EDE8DC] p-1 gap-1 flex-wrap ${className}`}
      role="group"
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#1A4D2E]/40 ${
              active
                ? 'bg-[#1A4D2E] text-white shadow-sm'
                : 'text-[#4B5945] hover:bg-[#D8D2C4] hover:text-[#1A4D2E]'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
