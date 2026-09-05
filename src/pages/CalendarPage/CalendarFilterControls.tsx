import { useRef, useState } from 'react';
import { Chip } from '../../components/ui/Chip';
import { CATEGORY_LIST } from '../../constants/calendarMeta';
import { useClickOutside } from '../../hooks/useClickOutside';
import { useEscapeKey } from '../../hooks/useEscapeKey';
import { createDefaultCalendarFilter, type CalendarFilterState } from './useCalendarFilter';

interface CalendarFilterControlsProps {
  filter: CalendarFilterState;
  onChange: (filter: CalendarFilterState) => void;
}

export function CalendarFilterControls({ filter, onChange }: CalendarFilterControlsProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  useClickOutside(containerRef, () => setOpen(false), open);
  useEscapeKey(() => setOpen(false), open);

  return (
    <div ref={containerRef} className="relative flex items-center gap-2">
      <button
        type="button"
        aria-label="필터"
        onClick={() => setOpen((prev) => !prev)}
        className="cursor-pointer rounded-full border border-[var(--color-brand)] px-3 py-1.5 text-sm font-medium text-[var(--color-brand)] hover:bg-[var(--color-brand)]/5"
      >
        필터
      </button>

      {open && (
        <div className="absolute top-full right-0 z-10 mt-2 w-64 space-y-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4 text-sm shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span aria-hidden="true">🌑</span>
              <p className="font-semibold text-[var(--color-text)]">필터</p>
            </div>
            <button
              type="button"
              aria-label="닫기"
              onClick={() => setOpen(false)}
              className="cursor-pointer text-[var(--color-text-sub)] hover:text-[var(--color-text)]"
            >
              ✕
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {CATEGORY_LIST.map((category) => (
              <Chip
                key={category}
                label={category}
                selected={filter[category]}
                onClick={() => onChange({ ...filter, [category]: !filter[category] })}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => onChange(createDefaultCalendarFilter())}
            className="w-full cursor-pointer rounded-full border border-[var(--color-border)] py-2 font-medium text-[var(--color-text)] hover:bg-[var(--color-bg)]"
          >
            초기화
          </button>
        </div>
      )}
    </div>
  );
}
