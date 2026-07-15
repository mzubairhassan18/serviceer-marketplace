"use client";

interface FilterBarProps {
  options: { value: string; label: string }[];
  active: string;
  onChange: (value: string) => void;
}

export function FilterBar({ options, active, onChange }: FilterBarProps) {
  return (
    <div className="filter-group">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className={`filter-btn${active === opt.value ? " active" : ""}`}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
