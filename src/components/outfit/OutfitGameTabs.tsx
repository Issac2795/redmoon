import { OUTFIT_TAB_LABEL, OUTFIT_TABS, type OutfitTab } from './useOutfitFilter';

interface OutfitGameTabsProps {
  active: OutfitTab;
  onChange: (tab: OutfitTab) => void;
}

/** 출시 게임 탭. "카드 구분"의 Event/Scout/Special/All 과 같은 모양 */
export function OutfitGameTabs({ active, onChange }: OutfitGameTabsProps) {
  return (
    <div className="flex gap-1 border-b border-[var(--color-border)]">
      {OUTFIT_TABS.map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => onChange(tab)}
          className={`cursor-pointer px-4 py-2 text-sm font-medium whitespace-nowrap ${
            active === tab
              ? 'border-b-2 border-[var(--color-brand)] text-[var(--color-brand)]'
              : 'text-[var(--color-text-sub)] hover:text-[var(--color-text)]'
          }`}
        >
          {OUTFIT_TAB_LABEL[tab]}
        </button>
      ))}
    </div>
  );
}
