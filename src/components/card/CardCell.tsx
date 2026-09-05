import { formatReleaseDate, formatSkillLabel } from '../../lib/formatCard';
import type { Card, Character } from '../../types/card';
import type { BloomMode } from './BloomToggle';

interface CardCellProps {
  card: Card | null;
  character: Character;
  bloomMode: BloomMode;
  showName: boolean;
  showFullName: boolean;
  showDate: boolean;
  showSkill: boolean;
  onSelect: (card: Card) => void;
}

/**
 * 카드명 표시 방식.
 * 기본은 한 줄로 잘라내고, "전체"를 켜면 여러 줄로 접어서 전문을 보여준다.
 * 이때 글자가 칸 끝까지 차서 옆 카드 이름과 붙어 보이므로 좌우 여백을 준다
 * (썸네일이 자연히 갖는 좌우 9px 여백과 비슷하게 맞춤).
 */
const NAME_CLASS = {
  truncated: 'truncate',
  full: 'px-1.5 leading-tight break-keep break-words whitespace-normal',
} as const;

export function CardCell({
  card,
  character,
  bloomMode,
  showName,
  showFullName,
  showDate,
  showSkill,
  onSelect,
}: CardCellProps) {
  // 미발매 카드는 썸네일이 비어 있어, 깨진 이미지 대신 캐릭터 기본 아이콘을 보여준다
  const thumbnailUrl = card && (bloomMode === 'before' ? card.thumbnailBeforeUrl : card.thumbnailAfterUrl);
  const imageUrl = thumbnailUrl || character.defaultIconUrl;

  // 3성 카드는 서포트 스킬이 없어서 표시할 문구도 없다
  const skillLabel = card?.supportSkill ? formatSkillLabel(card.supportSkill) : '';

  const thumbnail = (
    <img
      src={imageUrl}
      alt={card ? card.name : `${character.name} 기본 아이콘`}
      className={`h-17 w-17 rounded-md border object-cover transition-[transform,box-shadow] duration-150 ${
        card
          ? 'cursor-pointer border-[var(--color-border)] hover:scale-[1.06] hover:border-[var(--color-gold)] hover:shadow-md'
          : 'border-transparent opacity-25 grayscale'
      }`}
    />
  );

  return (
    // 카드명 길이에 따라 칸 너비가 달라지면 가운데 정렬 기준이 흔들려 행마다 카드 위치가 어긋난다.
    // 그래서 너비를 고정하고, 넘치는 글자는 잘라낸다.
    <div className="flex w-[86px] flex-col items-center gap-1 py-2">
      {card ? (
        <button
          type="button"
          aria-label={`${card.name} 상세 보기`}
          onClick={() => onSelect(card)}
          className="block cursor-pointer"
        >
          {thumbnail}
        </button>
      ) : (
        thumbnail
      )}
      {card && showName && (
        <span
          title={card.name}
          className={`w-full text-center text-xs text-[var(--color-text-sub)] ${
            showFullName ? NAME_CLASS.full : NAME_CLASS.truncated
          }`}
        >
          {card.name}
        </span>
      )}
      {card && showDate && card.releaseDate && (
        <span className="text-xs text-[var(--color-text-sub)]">{formatReleaseDate(card.releaseDate)}</span>
      )}
      {card && showSkill && skillLabel && (
        <span title={skillLabel} className="w-full truncate text-center text-xs text-[var(--color-text-sub)]">
          {skillLabel}
        </span>
      )}
    </div>
  );
}
