export type BloomMode = 'before' | 'after';

const OPTIONS: { value: BloomMode; label: string }[] = [
  { value: 'before', label: '개화 전' },
  { value: 'after', label: '개화 후' },
];

interface BloomToggleProps {
  mode: BloomMode;
  onChange: (mode: BloomMode) => void;
}

export function BloomToggle({ mode, onChange }: BloomToggleProps) {
  return (
    <div className="flex gap-1 rounded-full border border-[var(--color-border)] bg-[var(--color-card)] p-1">
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`cursor-pointer rounded-full px-3 py-1 text-sm font-medium transition-colors ${
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
