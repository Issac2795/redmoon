import { useMemo, useState } from 'react';
import { StickyControlBar } from '../../components/card/StickyControlBar';
import { OutfitCell } from '../../components/outfit/OutfitCell';
import { OutfitCharacterToggle } from '../../components/outfit/OutfitCharacterToggle';
import { OutfitFilterControls } from '../../components/outfit/OutfitFilterControls';
import { OutfitGameTabs } from '../../components/outfit/OutfitGameTabs';
import {
  OUTFIT_CATEGORY_LIST,
  isOutfitMatched,
  primaryCategory,
  useOutfitFilter,
  type OutfitTab,
} from '../../components/outfit/useOutfitFilter';
import { redMoonCharacters as characters } from '../../data/characters';
import { outfits } from '../../data/outfits';
import type { CharacterId } from '../../types/card';

export function OutfitPage() {
  const [tab, setTab] = useState<OutfitTab>('ES2');
  const [characterId, setCharacterId] = useState<CharacterId>(characters[0].id);
  const { filter, setFilter } = useOutfitFilter();
  // 이름을 누르면 그 옷만 펼친다
  const [openId, setOpenId] = useState<string | null>(null);

  // 얻는 방법별로 묶는다. 필터에서 분류를 끄면 그 묶음이 통째로 사라진다
  const sections = useMemo(() => {
    const visible = outfits
      .filter((o) => o.characterId === characterId && isOutfitMatched(o, filter, tab))
      // 위키 문서에 적힌 순서를 그대로 쓰되, All 탭에서는 신작을 먼저 둔다
      .sort((a, b) => (a.game === b.game ? 0 : a.game === 'ES2' ? -1 : 1));

    return OUTFIT_CATEGORY_LIST.map((category) => ({
      category,
      items: visible.filter((o) => primaryCategory(o) === category),
    })).filter((s) => s.items.length > 0);
  }, [filter, tab, characterId]);

  const total = sections.reduce((sum, s) => sum + s.items.length, 0);

  return (
    <div className="mx-auto max-w-4xl p-4">
      <OutfitGameTabs active={tab} onChange={setTab} />

      <StickyControlBar>
        {/* 캐릭터 선택은 필터 바로 왼쪽에 붙여 한 덩어리로 둔다 */}
        <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
          <OutfitCharacterToggle characterId={characterId} onChange={setCharacterId} />
          <OutfitFilterControls filter={filter} onChange={setFilter} showGames={tab === 'All'} />
        </div>
      </StickyControlBar>

      <p className="mt-3 text-sm text-[var(--color-text-sub)]">
        전체 <span className="font-semibold text-[var(--color-text)]">{total}</span>개 · 기본순
      </p>

      {total === 0 ? (
        <div className="mt-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
          <p className="p-6 text-center text-sm text-[var(--color-text-sub)]">표시할 옷이 없습니다.</p>
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          {sections.map((section) => (
            <div
              key={section.category}
              className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-card)]"
            >
              <div className="flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-1.5 text-xs font-semibold text-[var(--color-brand)]">
                <span>{section.category}</span>
                <span className="text-[var(--color-text-sub)]">{section.items.length}개</span>
              </div>
              <div className="grid grid-cols-2 items-start gap-3 p-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {section.items.map((outfit) => (
                  <OutfitCell
                    key={outfit.id}
                    outfit={outfit}
                    open={openId === outfit.id}
                    onToggle={(id) => setOpenId((prev) => (prev === id ? null : id))}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
