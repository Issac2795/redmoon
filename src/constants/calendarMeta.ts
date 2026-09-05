import type { CalendarEvent, EventCategory, ScoutKind } from '../types/calendar';

export const CATEGORY_LIST: EventCategory[] = ['스카우트', '이벤트', '캠페인', '생일', '라이브/공개방송'];

export const CATEGORY_COLOR: Record<EventCategory, string> = {
  스카우트: '#8F7AE6',
  이벤트: '#F28AA7',
  캠페인: '#4DB6A7',
  생일: '#D4AF37',
  '라이브/공개방송': '#5B8DEE',
};

/**
 * 스카우트 세부 분류별 색. 색상(252°)은 고정하고 채도/명도만 바꿔 같은 보라 계열로 묶는다.
 * 복각은 명도 대신 채도를 낮춰서 잡았는데, 밝기만 올리면 통상 "예고"의 옅은 색과 거의 겹치기 때문이다.
 */
export const SCOUT_KIND_COLOR: Record<ScoutKind, string> = {
  통상: CATEGORY_COLOR.스카우트, // hsl(252, 68%, 69%)
  주년: '#7857FF', // hsl(252, 100%, 67%) — 채도를 올려 선명하게
  복각: '#A99FD1', // hsl(252, 35%, 72%) — 채도를 낮춰 차분하게
};

/** 스카우트는 세부 분류별로, 나머지는 카테고리 색을 쓴다 */
export function getEventColor(event: CalendarEvent): string {
  if (event.category === '스카우트') return SCOUT_KIND_COLOR[event.scoutKind ?? '통상'];
  return CATEGORY_COLOR[event.category];
}

/** 하루에 여러 일정이 겹칠 때 위에서 아래로 쌓이는 순서. 숫자가 작을수록 위에 표시됨 */
export const CATEGORY_ORDER: Record<EventCategory, number> = {
  이벤트: 0,
  스카우트: 1,
  캠페인: 2,
  '라이브/공개방송': 3,
  생일: 4,
};

interface ScoutThemePeriod {
  /** 'YYYY-MM-DD' — 이 날짜부터 아래 테마가 적용됨 */
  from: string;
  a: string;
  b: string;
}

/** 몇 년 단위로 바뀌는 스카우트 라인별 테마명. 최신 항목이 배열 뒤로 오도록 추가하면 됨 */
const SCOUT_THEMES: ScoutThemePeriod[] = [{ from: '2000-01-01', a: '피처 스카우트 3', b: '테마 스카우트' }];

export function getScoutTheme(date: string, line: 'A' | 'B'): string {
  const applicable = [...SCOUT_THEMES].reverse().find((period) => period.from <= date) ?? SCOUT_THEMES[0];
  return line === 'A' ? applicable.a : applicable.b;
}
