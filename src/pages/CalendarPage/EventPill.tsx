import type { EventContentArg } from '@fullcalendar/core';
import { getScoutTheme } from '../../constants/calendarMeta';
import { characters } from '../../data/characters';
import type { CalendarEvent, GenericEvent, ScoutEvent } from '../../types/calendar';

function formatHour(time: string): string {
  return String(Number(time.split(':')[0]));
}

function formatTitle(event: ScoutEvent | GenericEvent): string {
  // 제목이 없는 건 매월 자동 생성되는 메인 스카우트뿐이라, 라인/단계로 제목을 만들어 쓴다
  if (event.title === undefined) {
    const theme = getScoutTheme(event.startDate, event.scoutLine);
    return `${theme} ${event.phase}`;
  }
  return event.time ? `${formatHour(event.time)}시 ${event.title}` : event.title;
}

/** 예고는 시작·종료보다 한 단계 옅은 색으로 표시 */
function isLightVariant(event: ScoutEvent | GenericEvent): boolean {
  if (event.category === '스카우트') return event.phase === '예고';
  return event.category === '이벤트' && event.title.includes('예고');
}

/** 예고/진행중 일정은 본 색상보다 한 단계 옅게 표시 */
function lighten(hex: string, amount = 0.55): string {
  const value = hex.replace('#', '');
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  const mix = (channel: number) => Math.round(channel + (255 - channel) * amount);
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
}

interface EventPillProps {
  arg: EventContentArg;
}

export function EventPill({ arg }: EventPillProps) {
  const event = arg.event.extendedProps.data as CalendarEvent;
  const color = arg.event.backgroundColor || '#999';

  if (event.category === '생일') {
    const character = characters.find((c) => c.id === event.characterId);
    const text = `${character?.name ?? event.characterId} 생일`;
    return (
      <div
        title={text}
        className="flex h-[20px] items-center gap-1 rounded-full px-1.5 text-[11px] font-semibold text-black"
        style={{ backgroundColor: color }}
      >
        {character && (
          <img src={character.defaultIconUrl} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover" />
        )}
        <span className="truncate">{text}</span>
      </div>
    );
  }

  const text = formatTitle(event);
  const backgroundColor = isLightVariant(event) ? lighten(color) : color;

  return (
    <div
      title={text}
      className="flex h-[20px] items-center truncate rounded-full px-1.5 text-[11px] font-semibold text-black"
      style={{ backgroundColor }}
    >
      {text}
    </div>
  );
}
