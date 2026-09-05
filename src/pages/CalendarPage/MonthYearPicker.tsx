import { useState } from 'react';
import { useEscapeKey } from '../../hooks/useEscapeKey';

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

interface MonthYearPickerProps {
  year: number;
  month: number;
  onSelect: (year: number, month: number) => void;
  onClose: () => void;
}

export function MonthYearPicker({ year, month, onSelect, onClose }: MonthYearPickerProps) {
  useEscapeKey(onClose, true);
  const [mode, setMode] = useState<'month' | 'year'>('month');
  const [cursorYear, setCursorYear] = useState(year);
  const [yearRangeStart, setYearRangeStart] = useState(year - 3);

  const years = Array.from({ length: 12 }, (_, i) => yearRangeStart + i);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 pt-28" onClick={onClose}>
      <div
        className="w-80 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4 shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        {mode === 'month' ? (
          <>
            <div className="flex items-center justify-between">
              <button
                type="button"
                aria-label="이전 연도"
                onClick={() => setCursorYear((y) => y - 1)}
                className="px-2 text-[var(--color-text-sub)] hover:text-[var(--color-text)]"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={() => setMode('year')}
                className="font-semibold text-[var(--color-text)]"
              >
                {cursorYear}년 {month}월 ︿
              </button>
              <button
                type="button"
                aria-label="다음 연도"
                onClick={() => setCursorYear((y) => y + 1)}
                className="px-2 text-[var(--color-text-sub)] hover:text-[var(--color-text)]"
              >
                ›
              </button>
            </div>
            <div className="mt-4 grid grid-cols-4 gap-2">
              {MONTHS.map((m) => {
                const selected = cursorYear === year && m === month;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      onSelect(cursorYear, m);
                      onClose();
                    }}
                    className={`rounded-full py-2 text-sm font-medium ${
                      selected
                        ? 'bg-[var(--color-brand)] text-white'
                        : 'text-[var(--color-text)] hover:bg-[var(--color-bg)]'
                    }`}
                  >
                    {m}월
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <button
                type="button"
                aria-label="이전 연도 범위"
                onClick={() => setYearRangeStart((s) => s - 12)}
                className="px-2 text-[var(--color-text-sub)] hover:text-[var(--color-text)]"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={() => setMode('month')}
                className="font-semibold text-[var(--color-text)]"
              >
                {cursorYear}년 ︿
              </button>
              <button
                type="button"
                aria-label="다음 연도 범위"
                onClick={() => setYearRangeStart((s) => s + 12)}
                className="px-2 text-[var(--color-text-sub)] hover:text-[var(--color-text)]"
              >
                ›
              </button>
            </div>
            <div className="mt-4 grid grid-cols-4 gap-2">
              {years.map((y) => {
                const selected = y === cursorYear;
                return (
                  <button
                    key={y}
                    type="button"
                    onClick={() => {
                      setCursorYear(y);
                      setMode('month');
                    }}
                    className={`rounded-full py-2 text-sm font-medium ${
                      selected
                        ? 'bg-[var(--color-brand)] text-white'
                        : 'text-[var(--color-text)] hover:bg-[var(--color-bg)]'
                    }`}
                  >
                    {y}
                  </button>
                );
              })}
            </div>
          </>
        )}

        <div className="mt-4 border-t border-[var(--color-border)] pt-3 text-center">
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-[var(--color-text-sub)] hover:text-[var(--color-text)]"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
}
