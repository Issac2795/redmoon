import { getEventColor, getScoutTheme } from '../../constants/calendarMeta';
import { characters } from '../../data/characters';
import { useEscapeKey } from '../../hooks/useEscapeKey';
import type { CalendarEvent } from '../../types/calendar';

function formatEventText(event: CalendarEvent): string {
  if (event.category === '생일') {
    const character = characters.find((c) => c.id === event.characterId);
    return `${character?.name ?? event.characterId} 생일`;
  }
  // 제목이 없는 건 매월 자동 생성되는 메인 스카우트뿐이라, 라인/단계로 제목을 만들어 쓴다
  if (event.title === undefined) {
    return `${getScoutTheme(event.startDate, event.scoutLine)} ${event.phase}`;
  }
  return event.time ? `${Number(event.time.split(':')[0])}시 ${event.title}` : event.title;
}

interface DayDetailModalProps {
  /** 'YYYY-MM-DD' */
  date: string;
  events: CalendarEvent[];
  onClose: () => void;
}

export function DayDetailModal({ date, events, onClose }: DayDetailModalProps) {
  useEscapeKey(onClose, true);
  const [, month, day] = date.split('-').map(Number);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div
        className="flex max-h-[70vh] min-h-72 w-72 flex-col rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4 shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <p className="font-accent text-lg font-semibold text-[var(--color-text)]">
            {month}월 {day}일
          </p>
          <button
            type="button"
            aria-label="닫기"
            onClick={onClose}
            className="cursor-pointer text-[var(--color-text-sub)] hover:text-[var(--color-text)]"
          >
            ✕
          </button>
        </div>

        <div className="mt-3 flex-1 space-y-2 overflow-y-auto">
          {events.length === 0 ? (
            <p className="text-sm text-[var(--color-text-sub)]">일정이 없습니다.</p>
          ) : (
            events.map((event) => {
              const character = event.category === '생일' ? characters.find((c) => c.id === event.characterId) : null;
              return (
                <div
                  key={event.id}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-black"
                  style={{ backgroundColor: getEventColor(event) }}
                >
                  {character && (
                    <img
                      src={character.defaultIconUrl}
                      alt=""
                      className="h-12 w-12 shrink-0 rounded-full object-cover"
                    />
                  )}
                  <span>{formatEventText(event)}</span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
