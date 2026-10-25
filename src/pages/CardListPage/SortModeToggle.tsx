export type SortMode = 'label' | 'time';

const OPTIONS: { value: SortMode; label: string }[] = [
  { value: 'label', label: '종류별' },
  { value: 'time', label: '시간순' },
];

interface SortModeToggleProps {
  mode: SortMode;
  onChange: (mode: SortMode) => void;
}

export function SortModeToggle({ mode, onChange }: SortModeToggleProps) {
  return (
    <div className="flex gap-1 rounded-full border border-[var(--color-border)] bg-[var(--color-card)] p-1">
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`cursor-pointer rounded-full px-3 py-1 text-sm font-medium whitespace-nowrap transition-colors ${
            mode === option.value
              ? 'bg-[var(--color-gold)] text-white'
              : 'text-[var(--color-text-sub)] hover:text-[var(--color-text)]'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
