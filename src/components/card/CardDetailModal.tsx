import { useEffect, useState } from 'react';
import { ATTRIBUTE_META, MAIN_STAT_META } from '../../constants/cardMeta';
import { formatFullDate, formatSkillLabel } from '../../lib/formatCard';
import { useEscapeKey } from '../../hooks/useEscapeKey';
import type { Card, Character } from '../../types/card';
import type { BloomStage } from './bloom';

/** 개화 단계는 항상 두 칸을 그린다. 이미지가 없는 쪽은 숨기지 않고 비활성으로 둔다 */
const BLOOM_LABELS = ['개화 전', '개화 후'] as const;
type BloomLabel = (typeof BLOOM_LABELS)[number];

/**
 * 풀 일러스트만 쓴다. 썸네일은 이 자리에 넣기엔 너무 작아서,
 * 풀 일러스트가 없는 단계는 대신 채우지 않고 버튼을 비활성으로 둔다.
 */
function stageImage(card: Card, label: BloomLabel): string | null {
  return (label === '개화 전' ? card.fullImageBeforeUrl : card.fullImageAfterUrl) || null;
}

/** 원하는 단계에 일러스트가 없으면 반대쪽으로 넘어간다. 양쪽 다 없으면 원하는 단계 그대로 둔다 */
function resolveStage(card: Card, preferred: number): number {
  if (stageImage(card, BLOOM_LABELS[preferred])) return preferred;
  const other = preferred === 0 ? 1 : 0;
  if (stageImage(card, BLOOM_LABELS[other])) return other;
  return preferred;
}

function hasTranslatedQuote(card: Card): boolean {
  return Boolean(card.quoteBefore || card.quoteAfter);
}

function hasOriginalQuote(card: Card): boolean {
  return Boolean(card.quoteBeforeOriginal || card.quoteAfterOriginal);
}

/** 지금 보고 있는 일러스트(개화 전/후)에 맞는 대사 한 줄만 고른다 */
function pickQuote(card: Card, label: BloomLabel, original: boolean): string {
  if (label === '개화 전') return (original ? card.quoteBeforeOriginal : card.quoteBefore) ?? '';
  return (original ? card.quoteAfterOriginal : card.quoteAfter) ?? '';
}

const META_BOX =
  'rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-2.5 py-1 text-xs font-medium text-[var(--color-text)]';

// 글자만 감싸도록 내용 크기에 맞추고, 카드명이 길 때만 잘리도록 최대 폭만 제한한다
const NAV_BUTTON =
  'flex max-w-[42%] cursor-pointer items-center gap-1.5 rounded-full border border-[var(--color-border)] px-3 py-1.5 text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-bg)] disabled:cursor-default disabled:opacity-40 disabled:hover:bg-transparent';

/** 이전/다음 버튼에 붙일 "[카드명] 캐릭터명" 표기 */
function describeCard(card: Card, characters: Character[]): string {
  const name = characters.find((c) => c.id === card.characterId)?.name ?? card.characterId;
  return `[${card.name}] ${name}`;
}

interface CardDetailModalProps {
  card: Card;
  characters: Character[];
  /** 화면에 보이는 순서대로의 카드 목록. 이전/다음 이동에 쓴다 */
  cardOrder: Card[];
  /** 목록에서 누른 개화 단계. 모달을 열었을 때의 기본 단계가 된다 */
  initialStage: BloomStage;
  onSelectCard: (card: Card) => void;
  onClose: () => void;
}

export function CardDetailModal({
  card,
  characters,
  cardOrder,
  initialStage,
  onSelectCard,
  onClose,
}: CardDetailModalProps) {
  const [index, setIndex] = useState(() => resolveStage(card, initialStage === 'before' ? 0 : 1));
  const [showOriginal, setShowOriginal] = useState(false);

  // 카드를 넘겨도 보고 있던 개화 단계를 유지한다. 그 단계에 일러스트가 없을 때만 반대쪽으로 넘어간다
  const [shownCardId, setShownCardId] = useState(card.id);
  if (shownCardId !== card.id) {
    setShownCardId(card.id);
    setIndex(resolveStage(card, index));
  }

  const images = BLOOM_LABELS.map((label) => stageImage(card, label));
  const availableCount = images.filter(Boolean).length;
  const current = images[index];
  const currentLabel = BLOOM_LABELS[index];

  const translated = hasTranslatedQuote(card);
  const original = hasOriginalQuote(card);
  // 번역/원문이 둘 다 있어야 전환이 의미가 있다. 하나뿐이면 있는 쪽을 보여주고 체크박스는 비활성
  const canToggleOriginal = translated && original;
  const useOriginal = canToggleOriginal ? showOriginal : original;
  const quote = pickQuote(card, currentLabel, useOriginal);

  const cardIndex = cardOrder.findIndex((c) => c.id === card.id);
  const hasPrev = cardIndex > 0;
  const hasNext = cardIndex >= 0 && cardIndex < cardOrder.length - 1;
  const prevCard = hasPrev ? cardOrder[cardIndex - 1] : null;
  const nextCard = hasNext ? cardOrder[cardIndex + 1] : null;

  useEscapeKey(onClose, true);

  // 방향키는 카드 이동에 쓴다(개화 전/후 전환은 마우스 전용)
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'ArrowLeft' && hasPrev) onSelectCard(cardOrder[cardIndex - 1]);
      if (event.key === 'ArrowRight' && hasNext) onSelectCard(cardOrder[cardIndex + 1]);
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [cardIndex, cardOrder, hasPrev, hasNext, onSelectCard]);

  // 모달이 열려 있는 동안 뒤쪽 목록이 스크롤되지 않도록 막는다
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  function goToOtherStage() {
    const other = index === 0 ? 1 : 0;
    if (images[other]) setIndex(other);
  }

  const attributeMeta = card.attribute ? ATTRIBUTE_META[card.attribute] : null;
  const specs: { label: string; value: string; color?: string; iconUrl?: string }[] = [
    { label: '레어도', value: `${card.rarity}성` },
    ...(card.attribute
      ? [{ label: '속성', value: card.attribute, color: attributeMeta?.color, iconUrl: attributeMeta?.iconUrl }]
      : []),
    ...(card.mainStat ? [{ label: '능력치', value: card.mainStat, color: MAIN_STAT_META[card.mainStat].color }] : []),
    ...(card.supportSkill ? [{ label: '서포트 스킬', value: formatSkillLabel(card.supportSkill) }] : []),
    { label: '3D 의상', value: card.has3D === 'O' ? '있음' : '없음' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-black/80 p-4 sm:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${card.name} 상세 정보`}
    >
      <div
        className="mx-auto flex h-full w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-[var(--color-card)] shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-2">
          <span className="truncate text-sm font-medium text-[var(--color-text-sub)]">
            {describeCard(card, characters)}
          </span>
          <button
            type="button"
            aria-label="닫기"
            onClick={onClose}
            className="cursor-pointer text-xl leading-none text-[var(--color-text-sub)] hover:text-[var(--color-text)]"
          >
            ✕
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {/* 일러스트 — 클릭하면 원본 크기로 새 탭에서 열린다.
              높이를 고정해야 이미지를 받아오는 동안 아래 내용이 위로 올라왔다 내려가지 않는다 */}
          <div className="relative flex h-[56vh] items-center justify-center bg-[var(--color-bg)]">
            {current ? (
              <a
                href={current}
                target="_blank"
                rel="noreferrer"
                title="원본 크기로 보기"
                className="group block h-full w-full"
              >
                <img
                  key={current}
                  src={current}
                  alt={`${card.name} ${currentLabel}`}
                  className="h-full w-full cursor-zoom-in object-contain"
                />
                <span className="absolute top-2 right-2 rounded-full bg-black/50 px-2.5 py-1 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
                  원본 크기로 보기 ↗
                </span>
              </a>
            ) : (
              <p className="text-sm text-[var(--color-text-sub)]">풀 일러스트가 없습니다.</p>
            )}

            {availableCount > 1 && (
              <>
                <button
                  type="button"
                  aria-label="이전 이미지"
                  onClick={goToOtherStage}
                  className="absolute left-2 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-black/40 text-xl text-white hover:bg-black/60"
                >
                  ‹
                </button>
                <button
                  type="button"
                  aria-label="다음 이미지"
                  onClick={goToOtherStage}
                  className="absolute right-2 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-black/40 text-xl text-white hover:bg-black/60"
                >
                  ›
                </button>
              </>
            )}

            {current && (
              <span className="absolute bottom-2 left-2 rounded-full bg-black/50 px-2.5 py-1 text-xs font-medium text-white">
                {currentLabel}
              </span>
            )}
          </div>

          {/* 일러스트 → 대사 → 개화 전/후 순서 */}
          <div className="space-y-2 px-5 pt-4">
            {quote && (
              <p className="text-center text-lg font-bold whitespace-pre-line text-[var(--color-text)]">
                <span className="italic">&quot; </span>
                {quote}
                <span className="italic"> &quot;</span>
              </p>
            )}

            <div className="relative flex items-center justify-center gap-2">
              {BLOOM_LABELS.map((label, stageIndex) => {
                const disabled = !images[stageIndex];
                const selected = stageIndex === index && !disabled;
                return (
                  <button
                    key={label}
                    type="button"
                    disabled={disabled}
                    onClick={() => setIndex(stageIndex)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                      selected
                        ? 'cursor-pointer bg-[var(--color-brand)] text-white'
                        : disabled
                          ? 'cursor-default border border-[var(--color-border)] text-[var(--color-border)]'
                          : 'cursor-pointer border border-[var(--color-border)] text-[var(--color-text-sub)] hover:bg-[var(--color-bg)]'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}

              <label
                className={`absolute right-0 flex items-center gap-2 text-sm ${
                  canToggleOriginal ? 'cursor-pointer text-[var(--color-text)]' : 'cursor-default text-[var(--color-border)]'
                }`}
                title={canToggleOriginal ? undefined : '번역과 원문이 모두 있어야 전환할 수 있습니다'}
              >
                <input
                  type="checkbox"
                  disabled={!canToggleOriginal}
                  checked={useOriginal}
                  onChange={() => setShowOriginal((prev) => !prev)}
                  className={canToggleOriginal ? 'cursor-pointer accent-[var(--color-brand)]' : 'cursor-default'}
                />
                원문
              </label>
            </div>
          </div>

          {/* 카드 정보 */}
          <div className="space-y-3 px-5 pt-4 pb-6">
            <h2 className="text-2xl font-bold text-[var(--color-text)]">{card.name}</h2>

            <div className="flex flex-wrap items-center gap-2">
              <span className={META_BOX}>{card.category}</span>
              <span className={META_BOX}>{card.label}</span>
              {/* 라벨 박스가 바로 앞에 있으니 차수만 따로 보여준다 */}
              {card.stage !== null && <span className={META_BOX}>{card.stage}차</span>}
            </div>

            {card.releaseDate && (
              <p className="text-sm text-[var(--color-text-sub)]">출시일 : {formatFullDate(card.releaseDate)}</p>
            )}

            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 border-t border-[var(--color-border)] pt-3 text-sm sm:grid-cols-3">
              {specs.map((spec) => (
                <div key={spec.label}>
                  <dt className="text-xs text-[var(--color-text-sub)]">{spec.label}</dt>
                  <dd className="flex items-center gap-1.5 font-medium text-[var(--color-text)]">
                    {spec.iconUrl ? (
                      <img src={spec.iconUrl} alt="" className="h-4 w-4 shrink-0 object-contain" />
                    ) : (
                      spec.color && (
                        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: spec.color }} />
                      )
                    )}
                    {spec.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* 이전/다음 카드 이동 (방향키 ←/→ 로도 가능) */}
        {cardOrder.length > 1 && (
          <div className="flex items-center justify-between gap-2 border-t border-[var(--color-border)] px-4 py-2">
            <button
              type="button"
              disabled={!hasPrev}
              onClick={() => hasPrev && onSelectCard(cardOrder[cardIndex - 1])}
              title={prevCard ? describeCard(prevCard, characters) : undefined}
              className={NAV_BUTTON}
            >
              <span className="shrink-0">‹ 이전 카드</span>
              {prevCard && (
                <span className="min-w-0 truncate font-normal text-[var(--color-text-sub)]">
                  / {describeCard(prevCard, characters)}
                </span>
              )}
            </button>
            <span className="shrink-0 text-xs text-[var(--color-text-sub)]">
              {cardIndex + 1} / {cardOrder.length}
            </span>
            <button
              type="button"
              disabled={!hasNext}
              onClick={() => hasNext && onSelectCard(cardOrder[cardIndex + 1])}
              title={nextCard ? describeCard(nextCard, characters) : undefined}
              className={NAV_BUTTON}
            >
              {nextCard && (
                <span className="min-w-0 truncate font-normal text-[var(--color-text-sub)]">
                  {describeCard(nextCard, characters)} /
                </span>
              )}
              <span className="shrink-0">다음 카드 ›</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
