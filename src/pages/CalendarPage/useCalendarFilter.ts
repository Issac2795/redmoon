import { useState } from 'react';
import { CATEGORY_LIST } from '../../constants/calendarMeta';
import type { EventCategory } from '../../types/calendar';

export type CalendarFilterState = Record<EventCategory, boolean>;

export function createDefaultCalendarFilter(): CalendarFilterState {
  return Object.fromEntries(CATEGORY_LIST.map((category) => [category, true])) as CalendarFilterState;
}

export function useCalendarFilter() {
  const [filter, setFilter] = useState<CalendarFilterState>(createDefaultCalendarFilter);
  return { filter, setFilter };
}
