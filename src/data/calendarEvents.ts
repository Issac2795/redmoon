import type { CalendarEvent } from '../types/calendar';

/**
 * 캠페인/오프라인 이벤트, 그리고 복각·기념처럼 개별로 챙겨야 하는 스카우트를 여기서 직접 관리한다.
 * 생일은 characters.ts의 birthday로, 매월 반복되는 스카우트/이벤트 메인 일정은
 * 각각 src/lib/birthdayEvents.ts, src/lib/mainScheduleEvents.ts에서 자동 생성된다.
 * (자동 생성 쪽은 이 파일을 참조하지 않으므로 여기에 스카우트를 추가해도 고정 스케줄은 그대로다.)
 */
export const calendarEvents: CalendarEvent[] = [
  // 캠페인: 기간이 너무 길어 달력을 다 차지하지 않도록 시작일/종료일만 단일제로 표기
  { id: 'campaign-summer-fes-start', category: '캠페인', startDate: '2026-07-13', title: '메가 서머 페스티벌! 시작' },
  { id: 'campaign-summer-fes-end', category: '캠페인', startDate: '2026-08-31', title: '메가 서머 페스티벌! 종료' },
  {
    id: 'campaign-solo-mv-start',
    category: '캠페인',
    startDate: '2026-07-24',
    title: '솔로 라이브 MV 추가 기념 캠페인 제 2탄 시작',
  },
  {
    id: 'campaign-solo-mv-end',
    category: '캠페인',
    startDate: '2026-07-30',
    title: '솔로 라이브 MV 추가 기념 캠페인 제 2탄 종료',
  },

  // 복각/기념 스카우트: 캠페인과 같이 기간을 시작일/종료일 단일제로 나눠 표기
  { id: 'scout-rerun-coversong-start', category: '스카우트', scoutKind: '복각', startDate: '2026-08-09', title: '[복각] 시작-COVER SONG 스카우트' },
  // { id: 'scout-rerun-coversong-end', category: '스카우트', scoutKind: '복각', startDate: '2026-08-17', title: '[복각] 종료-COVER SONG 스카우트' },
  { id: 'scout-rerun-trip-start', category: '스카우트', scoutKind: '복각', startDate: '2026-08-17', title: '[복각] 시작-TRIP 스카우트' },
  // { id: 'scout-rerun-trip-end', category: '스카우트', scoutKind: '복각', startDate: '2026-08-25', title: '[복각] 종료-TRIP 스카우트' },
  { id: 'scout-rerun-rhythmlink-start', category: '스카우트', scoutKind: '복각', startDate: '2026-08-29', title: '[복각] 시작-리즈링 주년 스카우트' },
  // { id: 'scout-rerun-rhythmlink-end', category: '스카우트', scoutKind: '복각', startDate: '2026-09-02', title: '[복각] 종료-리즈링 주년 스카우트' },
  { id: 'scout-rerun-coversong-gacha-start', category: '스카우트', scoutKind: '복각', startDate: '2026-09-02', title: '[복각] 시작-COVER SONG 뽑기' },
  { id: 'scout-rerun-coversong-gacha-end', category: '스카우트', scoutKind: '복각', startDate: '2026-09-10', title: '[복각] 종료-COVER SONG 뽑기' },
  { id: 'scout-rerun-trip-anniv-gacha-start', category: '스카우트', scoutKind: '복각', startDate: '2026-09-02', title: '[복각] 시작-TRIP·주년 뽑기' },
  { id: 'scout-rerun-trip-anniv-gacha-end', category: '스카우트', scoutKind: '복각', startDate: '2026-09-10', title: '[복각] 종료-TRIP·주년 뽑기' },
  {
    id: 'scout-11th-group-c-start',
    category: '스카우트',
    scoutKind: '주년',
    startDate: '2026-08-15',
    time: '15:00',
    title: '[11주년] 그룹 C 케이토·미도리·아도니스·나츠메 시작',
  },
  // {
  //   id: 'scout-11th-group-c-end',
  //   category: '스카우트',
  //   scoutKind: '주년',
  //   startDate: '2026-08-22',
  //   time: '15:00',
  //   title: '[11주년] 그룹 C 케이토·미도리·아도니스·나츠메 종료',
  // },
  {
    id: 'scout-11th-group-d-start',
    category: '스카우트',
    scoutKind: '주년',
    startDate: '2026-08-22',
    time: '15:00',
    title: '[11주년] 그룹 D 쿠로·에이치·코가·토모야 시작',
  },
  // {
  //   id: 'scout-11th-group-d-end',
  //   category: '스카우트',
  //   scoutKind: '주년',
  //   startDate: '2026-08-29',
  //   time: '15:00',
  //   title: '[11주년] 그룹 D 쿠로·에이치·코가·토모야 종료',
  // },

  // 오프라인 이벤트
  {
    id: 'offline-tsukistar-07',
    category: '라이브/공개방송',
    startDate: '2026-07-27',
    time: '21:00',
    title: '츠키스타!! 7월호(코가, 나즈나, 미카, 마슈)',
  },
  {
    id: 'offline-11-half-anniversary',
    category: '라이브/공개방송',
    startDate: '2026-09-09',
    time: '21:00',
    title: '11.5주년 생방송(츠카사, 시노부, 카오루, 코하쿠, 노조미)',
  },
];
