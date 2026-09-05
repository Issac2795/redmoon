import { useMemo, useState } from 'react';
import { CATEGORY_LIST, CATEGORY_COLOR } from '../../constants/calendarMeta';
import { calendarEvents } from '../../data/calendarEvents';
import { getBirthdayEvents } from '../../lib/birthdayEvents';
import { getMainScheduleEvents } from '../../lib/mainScheduleEvents';
import { CalendarFilterControls } from './CalendarFilterControls';
import { CalendarGrid } from './CalendarGrid';
import { DayDetailModal } from './DayDetailModal';
import { MonthYearPicker } from './MonthYearPicker';
import { useCalendarFilter } from './useCalendarFilter';

const today = new Date();

export function CalendarPage() {
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const { filter, setFilter } = useCalendarFilter();

  // 앞뒤 달/연도까지 만들어두면 월 경계에 걸친 일정(생일, 이벤트 종료일 등)도 잘림 없이 보임
  const events = useMemo(() => {
    const adjacentMonths = [-1, 0, 1].map((offset) => {
      const date = new Date(year, month - 1 + offset, 1);
      return { year: date.getFullYear(), month: date.getMonth() + 1 };
    });
    return [
      ...calendarEvents,
      ...getBirthdayEvents([year - 1, year, year + 1]),
      ...getMainScheduleEvents(adjacentMonths),
    ];
  }, [year, month]);

  const selectedDayEvents = useMemo(() => {
    if (!selectedDate) return [];
    return events.filter((event) => event.startDate === selectedDate && filter[event.category]);
  }, [events, filter, selectedDate]);

  function goToMonth(diff: number) {
    const base = new Date(year, month - 1 + diff, 1);
    setYear(base.getFullYear());
    setMonth(base.getMonth() + 1);
  }

  function goToday() {
    setYear(today.getFullYear());
    setMonth(today.getMonth() + 1);
  }

  return (
    <div className="mx-auto max-w-4xl p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="이전 달"
            onClick={() => goToMonth(-1)}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-xl text-[var(--color-text-sub)] hover:bg-[var(--color-bg)] hover:text-[var(--color-text)]"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="font-accent flex cursor-pointer items-center gap-1 text-xl font-semibold text-[var(--color-text)]"
          >
            {year}년 {month}월 <span className="text-xl">▾</span>
          </button>
          <button
            type="button"
            aria-label="다음 달"
            onClick={() => goToMonth(1)}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-xl text-[var(--color-text-sub)] hover:bg-[var(--color-bg)] hover:text-[var(--color-text)]"
          >
            ›
          </button>
          <button
            type="button"
            onClick={goToday}
            className="cursor-pointer rounded-full border border-[var(--color-border)] px-3 py-1.5 text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-bg)]"
          >
            오늘
          </button>
        </div>

        <CalendarFilterControls filter={filter} onChange={setFilter} />
      </div>

      <div className="mt-4">
        <CalendarGrid year={year} month={month} events={events} filter={filter} onDateClick={setSelectedDate} />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4">
        {CATEGORY_LIST.map((category) => (
          <div key={category} className="flex items-center gap-1.5 text-sm text-[var(--color-text)]">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: CATEGORY_COLOR[category] }} />
            {category}
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4 text-sm text-[var(--color-text-sub)]">
        <p className="font-medium text-[var(--color-text)]">캘린더 사용 안내</p>
        <ul className="mt-1 list-disc space-y-0.5 pl-5">
          <li>스카우트, 이벤트, 캠페인 등의 일정을 한눈에 확인할 수 있습니다.</li>
          <li>날짜를 클릭하면 해당일의 일정을 모아볼 수 있습니다.</li>
        </ul>
      </div>

      {pickerOpen && (
        <MonthYearPicker
          year={year}
          month={month}
          onSelect={(y, m) => {
            setYear(y);
            setMonth(m);
          }}
          onClose={() => setPickerOpen(false)}
        />
      )}

      {selectedDate && (
        <DayDetailModal date={selectedDate} events={selectedDayEvents} onClose={() => setSelectedDate(null)} />
      )}
    </div>
  );
}
