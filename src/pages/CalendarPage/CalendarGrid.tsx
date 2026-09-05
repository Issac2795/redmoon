import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import FullCalendar from '@fullcalendar/react';
import type { EventClickArg } from '@fullcalendar/core';
import { CATEGORY_ORDER, getEventColor } from '../../constants/calendarMeta';
import type { CalendarEvent } from '../../types/calendar';
import { EventPill } from './EventPill';
import type { CalendarFilterState } from './useCalendarFilter';

const WEEKDAY_KO = ['일', '월', '화', '수', '목', '금', '토'];

interface CalendarGridProps {
  year: number;
  month: number;
  events: CalendarEvent[];
  filter: CalendarFilterState;
  onDateClick: (dateStr: string) => void;
}

function toEventInput(event: CalendarEvent) {
  const color = getEventColor(event);
  return {
    id: event.id,
    start: event.startDate,
    allDay: true,
    backgroundColor: color,
    borderColor: color,
    extendedProps: { data: event },
  };
}

interface EventLike {
  extendedProps: { data: CalendarEvent };
}

/** 하루에 여러 일정이 겹칠 때 이벤트 → 스카우트 → 캠페인 → 라이브/공개방송 → 생일 순으로 쌓는다 */
function compareEventOrder(a: unknown, b: unknown): number {
  const categoryA = (a as EventLike).extendedProps.data.category;
  const categoryB = (b as EventLike).extendedProps.data.category;
  return CATEGORY_ORDER[categoryA] - CATEGORY_ORDER[categoryB];
}

function dayCellClass(date: Date): string {
  const base = 'cursor-pointer';
  if (date.getDay() === 0) return `${base} rm-sun`;
  if (date.getDay() === 6) return `${base} rm-sat`;
  return base;
}

/** 이벤트를 클릭했을 때, 실제로 클릭한 날짜 셀을 찾아서 그 날짜로 모달을 연다 */
function handleEventClick(arg: EventClickArg, onDateClick: (dateStr: string) => void) {
  const target = arg.jsEvent.target as HTMLElement | null;
  const dayEl = target?.closest('[data-date]');
  const fallback = (arg.event.extendedProps.data as CalendarEvent).startDate;
  const dateStr = dayEl?.getAttribute('data-date') ?? fallback;
  onDateClick(dateStr);
}

export function CalendarGrid({ year, month, events, filter, onDateClick }: CalendarGridProps) {
  const visibleEvents = events.filter((event) => filter[event.category]);

  return (
    <div className="rm-calendar overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-card)]">
      <FullCalendar
        // 연/월이 바뀌면 FullCalendar 인스턴스를 통째로 새로 만든다.
        // ref로 gotoDate()를 imperatively 호출하면 React 19에서 "flushSync from lifecycle" 에러가 남.
        key={`${year}-${month}`}
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        initialDate={new Date(year, month - 1, 1)}
        headerToolbar={false}
        firstDay={0}
        height="auto"
        // 기본값(true)이면 항상 6주를 채워서 다음 달 날짜가 불필요하게 더 노출됨
        fixedWeekCount={false}
        events={visibleEvents.map(toEventInput)}
        eventOrder={compareEventOrder}
        dateClick={(arg) => onDateClick(arg.dateStr)}
        eventClick={(arg) => handleEventClick(arg, onDateClick)}
        dayHeaderContent={(arg) => WEEKDAY_KO[arg.date.getDay()]}
        dayHeaderClassNames={(arg) => (arg.date.getDay() === 0 ? 'rm-sun' : arg.date.getDay() === 6 ? 'rm-sat' : '')}
        dayCellClassNames={(arg) => dayCellClass(arg.date)}
        dayCellContent={(arg) => arg.dayNumberText.replace(/\D/g, '')}
        eventContent={(arg) => <EventPill arg={arg} />}
      />
    </div>
  );
}
