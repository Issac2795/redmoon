import { addDays, dateString } from './calendarDate';
import type { CalendarEvent } from '../types/calendar';

export interface MonthKey {
  year: number;
  month: number;
}

/**
 * 캐릭터와 무관하게 매월 반복되는 스카우트/이벤트 "메인 일정" 고정 스케줄.
 * 한 달이 31일이면 두 번째 사이클의 "스카우트 B 시작"/"이벤트 시작"이 하루씩 밀림.
 */
function buildMonthSchedule({ year, month }: MonthKey): CalendarEvent[] {
  const daysInMonth = new Date(year, month, 0).getDate();
  const is31 = daysInMonth === 31;
  const scoutB2StartDay = is31 ? 30 : 29;
  const event2StartDay = is31 ? 31 : 30;
  const prefix = `${year}-${String(month).padStart(2, '0')}`;

  const event1Start = dateString(year, month, 15);
  const event1End = addDays(event1Start, 8);
  const event2Start = dateString(year, month, event2StartDay);
  const event2End = addDays(event2Start, 8);

  const events: CalendarEvent[] = [
    { id: `${prefix}-scoutA1-announce`, category: '스카우트', startDate: dateString(year, month, 9), scoutLine: 'A', phase: '예고' },
    { id: `${prefix}-scoutA1-start`, category: '스카우트', startDate: dateString(year, month, 10), scoutLine: 'A', phase: '시작' },
    { id: `${prefix}-event1-announce`, category: '이벤트', startDate: dateString(year, month, 12), title: '이벤트 예고' },
    { id: `${prefix}-scoutB1-announce`, category: '스카우트', startDate: dateString(year, month, 13), scoutLine: 'B', phase: '예고' },
    { id: `${prefix}-scoutB1-start`, category: '스카우트', startDate: dateString(year, month, 14), scoutLine: 'B', phase: '시작' },
    { id: `${prefix}-event1-start`, category: '이벤트', startDate: event1Start, title: '이벤트 시작' },
    { id: `${prefix}-event1-end`, category: '이벤트', startDate: event1End, title: '이벤트 종료' },
    { id: `${prefix}-scoutA2-announce`, category: '스카우트', startDate: dateString(year, month, 24), scoutLine: 'A', phase: '예고' },
    { id: `${prefix}-scoutA2-start`, category: '스카우트', startDate: dateString(year, month, 25), scoutLine: 'A', phase: '시작' },
    { id: `${prefix}-event2-announce`, category: '이벤트', startDate: dateString(year, month, 27), title: '이벤트 예고' },
    { id: `${prefix}-scoutB2-announce`, category: '스카우트', startDate: dateString(year, month, 28), scoutLine: 'B', phase: '예고' },
    { id: `${prefix}-scoutB2-start`, category: '스카우트', startDate: dateString(year, month, scoutB2StartDay), scoutLine: 'B', phase: '시작' },
    { id: `${prefix}-event2-start`, category: '이벤트', startDate: event2Start, title: '이벤트 시작' },
    { id: `${prefix}-event2-end`, category: '이벤트', startDate: event2End, title: '이벤트 종료' },
  ];

  return events;
}

export function getMainScheduleEvents(months: MonthKey[]): CalendarEvent[] {
  return months.flatMap(buildMonthSchedule);
}
