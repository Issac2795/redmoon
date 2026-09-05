export type EventCategory = '스카우트' | '이벤트' | '캠페인' | '생일' | '라이브/공개방송';

interface BaseEvent {
  id: string;
  category: EventCategory;
  /** 'YYYY-MM-DD' */
  startDate: string;
  /** 'HH:mm' — 있으면 제목 앞에 "N시" 표기 */
  time?: string;
}

export interface BirthdayEvent extends BaseEvent {
  category: '생일';
  /** src/data/characters.ts 참조 */
  characterId: string;
}

/** 스카우트 세부 분류. 같은 보라색 계열에서 채도/명도만 달리해 구분한다 */
export type ScoutKind = '통상' | '주년' | '복각';

/** 매월 반복되는 메인 스카우트(피처/배수). 제목은 라인/단계로 자동 생성된다 */
export interface MainScoutEvent extends BaseEvent {
  category: '스카우트';
  scoutLine: 'A' | 'B';
  phase: '예고' | '시작';
  /** 메인 스카우트는 언제나 통상 */
  scoutKind?: '통상';
  title?: undefined;
}

/** 복각·주년 스카우트처럼 이름을 직접 붙여 관리하는 스카우트 */
export interface NamedScoutEvent extends BaseEvent {
  category: '스카우트';
  scoutKind: ScoutKind;
  title: string;
  scoutLine?: undefined;
  phase?: undefined;
}

export type ScoutEvent = MainScoutEvent | NamedScoutEvent;

export interface GenericEvent extends BaseEvent {
  category: '이벤트' | '캠페인' | '라이브/공개방송';
  title: string;
}

export type CalendarEvent = BirthdayEvent | ScoutEvent | GenericEvent;
