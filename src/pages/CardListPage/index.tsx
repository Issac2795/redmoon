import { useMemo, useState } from 'react';
import { redMoonCharacters as characters } from '../../data/characters';
import { cards } from '../../data/cards';
import { buildLabelSections, buildTimeSections } from '../../lib/gridSections';
import { BloomToggle } from '../../components/card/BloomToggle';
import type { BloomMode, BloomStage } from '../../components/card/bloom';
import { CardDetailModal } from '../../components/card/CardDetailModal';
import { CardViewToggle } from '../../components/card/CardViewToggle';
import { StickyControlBar } from '../../components/card/StickyControlBar';
import type { CardCellVariant } from '../../components/card/CardCell';
import { CardGrid } from './CardGrid';
import { CardListTabs } from './CardListTabs';
import type { TabValue } from './CardListTabs';
import { DisplayToggle } from '../../components/card/DisplayToggle';
import type { DisplayState } from '../../components/card/DisplayToggle';
import { FilterControls } from '../../components/card/FilterControls';
import { SortModeToggle } from './SortModeToggle';
import type { SortMode } from './SortModeToggle';
import { isCardMatched, useCardFilter } from '../../components/card/useCardFilter';
import type { Card } from '../../types/card';

const characterOrder = characters.map((character) => character.id);

export function CardListPage() {
  const [activeTab, setActiveTab] = useState<TabValue>('All');
  const [bloomMode, setBloomMode] = useState<BloomMode>('after');
  const [sortMode, setSortMode] = useState<SortMode>('label');
  const [display, setDisplay] = useState<DisplayState>({
    name: true,
    fullName: false,
    date: false,
    skill: false,
  });
  // 모달은 누른 쪽 그림으로 열어야 해서 카드와 개화 단계를 함께 들고 있는다
  const [selected, setSelected] = useState<{ card: Card; stage: BloomStage } | null>(null);
  const [variant, setVariant] = useState<CardCellVariant>('thumbnail');
  const { filter, setFilter } = useCardFilter();

  const sections = useMemo(() => {
    // 개별 탭은 탭이 곧 카테고리라서, 카테고리 필터는 All 탭에서만 적용한다
    const categoryCards =
      activeTab === 'All'
        ? cards.filter((card) => filter.categories[card.category])
        : cards.filter((card) => card.category === activeTab);
    // 필터에 걸리지 않는 카드는 자리도 차지하지 않도록 아예 제외한다
    const visibleCards = categoryCards.filter((card) => isCardMatched(card, filter));
    return sortMode === 'label'
      ? buildLabelSections(visibleCards, characterOrder)
      : buildTimeSections(visibleCards, characterOrder);
  }, [activeTab, sortMode, filter]);

  // 모달에서 이전/다음 카드로 넘길 때 쓰는 순서. 화면에 보이는 순서(섹션 → 행 → 캐릭터)와 같게 펼친다
  const orderedCards = useMemo(
    () => sections.flatMap((section) => section.rows.flatMap((row) => row.cardsByCharacter.flat())),
    [sections],
  );

  return (
    <div className="mx-auto max-w-4xl p-4">
      <CardListTabs active={activeTab} onChange={setActiveTab} />

      <StickyControlBar>
        <DisplayToggle display={display} onChange={setDisplay} />
        {/* 좁은 화면에서는 버튼이 줄 밖으로 밀려나므로 이 묶음도 줄바꿈되게 둔다 */}
        <div className="flex flex-wrap items-center justify-end gap-2">
          <CardViewToggle variant={variant} onChange={setVariant} />
          <BloomToggle mode={bloomMode} onChange={setBloomMode} />
          <SortModeToggle mode={sortMode} onChange={setSortMode} />
          <FilterControls filter={filter} onChange={setFilter} showCategories={activeTab === 'All'} />
        </div>
      </StickyControlBar>

      <div className="relative mt-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
        <img
          src="https://static.wikia.nocookie.net/ensemble-stars/images/5/56/AKATSUKI_ES_Logo.png/revision/latest?cb=20240912062148"
          alt=""
          className="absolute -top-5 -left-5 h-14 w-14 rounded-full bg-[var(--color-card)] object-contain p-2 shadow-md"
        />
        <CardGrid
          sections={sections}
          characters={characters}
          bloomMode={bloomMode}
          showName={display.name}
          showFullName={display.fullName}
          showDate={display.date}
          showSkill={display.skill}
          onSelectCard={(card, stage) => setSelected({ card, stage })}
          variant={variant}
        />
      </div>

      {selected && (
        <CardDetailModal
          card={selected.card}
          characters={characters}
          cardOrder={orderedCards}
          initialStage={selected.stage}
          onSelectCard={(card) => setSelected({ card, stage: selected.stage })}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
