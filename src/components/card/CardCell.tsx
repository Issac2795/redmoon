import { formatReleaseDate, formatSkillLabel } from '../../lib/formatCard';
import type { Card, Character } from '../../types/card';
import { shownStages } from './bloom';
import type { BloomMode, BloomStage } from './bloom';

/** 작은 정사각 썸네일 이미지 또는 세로로 긴 카드 이미지 중 무엇을 보여줄지 */
export type CardCellVariant = 'thumbnail' | 'card';

interface CardCellProps {
  card: Card | null;
  character: Character;
  bloomMode: BloomMode;
  showName: boolean;
  showFullName: boolean;
  showDate: boolean;
  showSkill: boolean;
  /** 모달을 누른 쪽 그림으로 열 수 있도록, 클릭한 개화 단계를 함께 넘긴다 */
  onSelect: (card: Card, stage: BloomStage) => void;
  variant?: CardCellVariant;
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

/**
 * 칸 너비.
 * 썸네일은 카드명 길이에 따라 칸이 늘어나면 행마다 카드 위치가 어긋나므로 너비를 고정한다.
 * 개화 전·후를 같이 켜면 그림이 두 장이라 그림이 차지하는 너비(68px)만큼만 더 넓힌다.
 * 카드 이미지는 그리드가 정한 칸을 그대로 채운다.
 */
const CELL_CLASS = {
  thumbnail: { single: 'w-[86px] py-2', both: 'w-[154px] py-2' },
  card: { single: 'w-full py-1', both: 'w-full py-1' },
} as const;

/**
 * 이미지 크기.
 * 카드 이미지는 대부분 4:5지만 간혹 비율이 다른 카드가 있어, 4:5 칸에 object-cover 로 채운다.
 * 세로가 꽉 차고 좌우만 균등하게 잘려서 원본 비율이 달라도 모두 같은 모양으로 보인다.
 */
const IMAGE_CLASS = {
  thumbnail: 'h-17 w-17 rounded-md',
  card: 'aspect-[4/5] w-full rounded-lg object-center',
} as const;

/**
 * 두 장을 붙여 놓으면 맞닿는 자리에 테두리가 겹쳐 가운데에 굵은 선이 생긴다.
 * 안쪽 테두리와 둥근 모서리를 없애 바깥만 감싸는 하나의 테두리처럼 보이게 한다.
 */
const JOINED_EDGE_CLASS: Record<'first' | 'last', string> = {
  first: 'rounded-r-none border-r-0',
  last: 'rounded-l-none border-l-0',
};

export function CardCell({
  card,
  character,
  bloomMode,
  showName,
  showFullName,
  showDate,
  showSkill,
  onSelect,
  variant = 'thumbnail',
}: CardCellProps) {
  const stages = shownStages(bloomMode);
  const sizeKey = stages.length > 1 ? 'both' : 'single';

  // 미발매 카드는 이미지가 비어 있어, 깨진 이미지 대신 캐릭터 기본 아이콘을 보여준다.
  // 카드 이미지가 없으면 같은 개화 단계의 썸네일로 대신한다(다른 단계 그림을 보여주지 않도록).
  function imageUrlOf(stage: BloomStage): string {
    const thumbnailUrl = card && (stage === 'before' ? card.thumbnailBeforeUrl : card.thumbnailAfterUrl);
    const cardUrl = card && (stage === 'before' ? card.cardImageBeforeUrl : card.cardImageAfterUrl);
    return (variant === 'card' ? cardUrl || thumbnailUrl : thumbnailUrl) || character.defaultIconUrl;
  }

  // 3성 카드는 서포트 스킬이 없어서 표시할 문구도 없다
  const skillLabel = card?.supportSkill ? formatSkillLabel(card.supportSkill) : '';

  function image(stage: BloomStage, position: 'first' | 'last' | 'only') {
    return (
      <img
        src={imageUrlOf(stage)}
        alt={card ? card.name : `${character.name} 기본 아이콘`}
        loading="lazy"
        className={`${IMAGE_CLASS[variant]} ${
          position === 'only' ? '' : JOINED_EDGE_CLASS[position]
        } border object-cover transition-[border-color,box-shadow] duration-150 ${
          card
            ? // 확대는 묶음 전체가 함께 하고(아래 wrapper), 여기서는 테두리와 그림자만 같이 반응한다
              'cursor-pointer border-[var(--color-border)] group-hover:border-[var(--color-gold)] group-hover:shadow-md'
            : 'border-transparent opacity-25 grayscale'
        }`}
      />
    );
  }

  return (
    <div className={`flex flex-col items-center gap-1 ${CELL_CLASS[variant][sizeKey]}`}>
      {/*
        개화 전·후를 같이 켜면 두 그림을 여백 없이 붙여 한 묶음으로 보여준다.
        확대는 그림마다 걸면 각자 제 중심으로 커져 서로 겹치므로, 묶음 전체를 한 번에 키운다.
      */}
      <div
        className={`group flex origin-center transition-transform duration-150 ${
          variant === 'card' ? 'w-full' : ''
        } ${card ? 'hover:scale-[1.06]' : ''}`}
      >
        {stages.map((stage, stageIndex) => {
          const position = stages.length === 1 ? 'only' : stageIndex === 0 ? 'first' : 'last';
          return card ? (
            // 썸네일은 칸보다 작아서, 버튼까지 칸 너비로 늘리면 가운데 정렬이 깨진다
            <button
              key={stage}
              type="button"
              aria-label={`${card.name} ${stage === 'before' ? '개화 전' : '개화 후'} 상세 보기`}
              onClick={() => onSelect(card, stage)}
              className={`block cursor-pointer ${variant === 'card' ? 'min-w-0 flex-1' : ''}`}
            >
              {image(stage, position)}
            </button>
          ) : (
            <div key={stage} className={variant === 'card' ? 'min-w-0 flex-1' : ''}>
              {image(stage, position)}
            </div>
          );
        })}
      </div>
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
