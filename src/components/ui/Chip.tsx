interface ChipProps {
  label: string;
  selected: boolean;
  onClick: () => void;
  dotColor?: string;
}

export function Chip({ label, selected, onClick, dotColor }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
        selected
          ? 'border-[var(--color-brand)] bg-[var(--color-brand)] text-white'
          : 'border-[var(--color-border)] bg-white text-[var(--color-text)] hover:bg-[var(--color-bg)]'
      }`}
    >
      {dotColor && <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: dotColor }} />}
      {label}
    </button>
  );
}
