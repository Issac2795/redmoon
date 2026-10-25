import { useMemo, useState } from 'react';
import { BloomToggle } from '../../components/card/BloomToggle';
import type { BloomMode, BloomStage } from '../../components/card/bloom';
import { CardCell } from '../../components/card/CardCell';
import type { CardCellVariant } from '../../components/card/CardCell';
import { CardDetailModal } from '../../components/card/CardDetailModal';
import { CardViewToggle } from '../../components/card/CardViewToggle';
import { StickyControlBar } from '../../components/card/StickyControlBar';
import { DisplayToggle } from '../../components/card/DisplayToggle';
import type { DisplayState } from '../../components/card/DisplayToggle';
import { FilterControls } from '../../components/card/FilterControls';
import { isCardMatched, useCardFilter } from '../../components/card/useCardFilter';
import { cards } from '../../data/cards';
import { redMoonCharacters as characters } from '../../data/characters';
import type { Card } from '../../types/card';

/**
 * 칸 배치.
 * 썸네일은 그림 크기만큼 들어가는 대로 촘촘히 깔리므로 개화 전·후를 같이 켜도 그대로 둔다.
 * 카드 이미지는 넓은 화면에서 한 줄에 6장, 화면이 좁아지면 4 → 3 → 2장으로 줄이고,
 * 개화 전·후를 같이 켜면 카드 한 장이 두 배 넓어지므로 단 수를 절반으로 낮춘다.
 */
const GRID_CLASS: Record<CardCellVariant, Record<'single' | 'both', string>> = {
  thumbnail: {
    single: 'grid-cols-[repeat(auto-fill,minmax(86px,1fr))] justify-items-center',
    both: 'grid-cols-[repeat(auto-fill,minmax(154px,1fr))] justify-items-center',
  },
  card: {
    single: 'grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6',
    both: 'grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3',
  },
};

/** 발매 내림차순(최신 먼저). 같은 날 발매는 레어도 높은 순 → 이름 순으로 안정적으로 정렬 */
function byReleaseDesc(a: Card, b: Card): number {
  const date = (b.releaseDate ?? '').localeCompare(a.releaseDate ?? '');
  if (date !== 0) return date;
  if (a.rarity !== b.rarity) return Number(b.rarity) - Number(a.rarity);
  return a.name.localeCompare(b.name);
}

export function CardGridPage() {
  const [bloomMode, setBloomMode] = useState<BloomMode>('after');
  // 그리드에는 서포트 스킬 표시가 없어 skill은 항상 false로 둔다
  const [display, setDisplay] = useState<DisplayState>({
    name: false,
    fullName: false,
    date: false,
    skill: false,
  });
  // 모달은 누른 쪽 그림으로 열어야 해서 카드와 개화 단계를 함께 들고 있는다
  const [selected, setSelected] = useState<{ card: Card; stage: BloomStage } | null>(null);
  const [variant, setVariant] = useState<CardCellVariant>('thumbnail');
  const { filter, setFilter } = useCardFilter();

  // 카테고리는 탭이 없는 화면이라 여기서 직접 걸러준다(isCardMatched는 카테고리를 보지 않음).
  // 모달의 이전/다음 이동도 이 순서를 그대로 따라간다
  const visibleCards = useMemo(
    () =>
      cards
        .filter((card) => filter.categories[card.category] && isCardMatched(card, filter))
        .sort(byReleaseDesc),
    [filter],
  );

  return (
    <div className="mx-auto max-w-4xl p-4">
      <StickyControlBar>
        <DisplayToggle display={display} onChange={setDisplay} showSkillToggle={false} />
        {/* 좁은 화면에서는 버튼이 줄 밖으로 밀려나므로 이 묶음도 줄바꿈되게 둔다 */}
        <div className="flex flex-wrap items-center justify-end gap-2">
          <CardViewToggle variant={variant} onChange={setVariant} />
          <BloomToggle mode={bloomMode} onChange={setBloomMode} />
          <FilterControls filter={filter} onChange={setFilter} showCategories showCharacters showLabels />
        </div>
      </StickyControlBar>

      <p className="mt-3 text-sm text-[var(--color-text-sub)]">
        전체 <span className="font-semibold text-[var(--color-text)]">{visibleCards.length}</span>장 · 발매 최신순
      </p>

      <div className="mt-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
        {visibleCards.length === 0 ? (
          <p className="p-6 text-center text-sm text-[var(--color-text-sub)]">표시할 카드가 없습니다.</p>
        ) : (
          <div className={`grid ${GRID_CLASS[variant][bloomMode === 'both' ? 'both' : 'single']}`}>
            {visibleCards.map((card) => (
              <CardCell
                key={card.id}
                card={card}
                character={characters.find((c) => c.id === card.characterId) ?? characters[0]}
                bloomMode={bloomMode}
                showName={display.name}
                showFullName={display.fullName}
                showDate={display.date}
                showSkill={false}
                onSelect={(clicked, stage) => setSelected({ card: clicked, stage })}
                variant={variant}
              />
            ))}
          </div>
        )}
      </div>

      {selected && (
        <CardDetailModal
          card={selected.card}
          characters={characters}
          cardOrder={visibleCards}
          initialStage={selected.stage}
          onSelectCard={(card) => setSelected({ card, stage: selected.stage })}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
