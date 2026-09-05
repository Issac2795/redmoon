import { useMemo, useState } from 'react';
import { BloomToggle } from '../../components/card/BloomToggle';
import type { BloomMode } from '../../components/card/BloomToggle';
import { CardCell } from '../../components/card/CardCell';
import { CardDetailModal } from '../../components/card/CardDetailModal';
import { DisplayToggle } from '../../components/card/DisplayToggle';
import type { DisplayState } from '../../components/card/DisplayToggle';
import { FilterControls } from '../../components/card/FilterControls';
import { isCardMatched, useCardFilter } from '../../components/card/useCardFilter';
import { cards } from '../../data/cards';
import { redMoonCharacters as characters } from '../../data/characters';
import type { Card } from '../../types/card';

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
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
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
      <div className="flex flex-wrap items-center justify-between gap-2">
        <DisplayToggle display={display} onChange={setDisplay} showSkillToggle={false} />
        <div className="flex items-center gap-2">
          <BloomToggle mode={bloomMode} onChange={setBloomMode} />
          <FilterControls filter={filter} onChange={setFilter} showCategories showCharacters showLabels />
        </div>
      </div>

      <p className="mt-3 text-sm text-[var(--color-text-sub)]">
        전체 <span className="font-semibold text-[var(--color-text)]">{visibleCards.length}</span>장 · 발매 최신순
      </p>

      <div className="mt-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
        {visibleCards.length === 0 ? (
          <p className="p-6 text-center text-sm text-[var(--color-text-sub)]">표시할 카드가 없습니다.</p>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(86px,1fr))] justify-items-center">
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
                onSelect={setSelectedCard}
              />
            ))}
          </div>
        )}
      </div>

      {selectedCard && (
        <CardDetailModal
          card={selectedCard}
          characters={characters}
          cardOrder={visibleCards}
          bloomMode={bloomMode}
          onSelectCard={setSelectedCard}
          onClose={() => setSelectedCard(null)}
        />
      )}
    </div>
  );
}
