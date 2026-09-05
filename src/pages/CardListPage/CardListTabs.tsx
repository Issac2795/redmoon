export type TabValue = 'All' | 'Event' | 'Scout' | 'Special';

const TABS: TabValue[] = ['Event', 'Scout', 'Special', 'All'];

interface CardListTabsProps {
  active: TabValue;
  onChange: (tab: TabValue) => void;
}

export function CardListTabs({ active, onChange }: CardListTabsProps) {
  return (
    <div className="flex gap-1 border-b border-[var(--color-border)]">
      {TABS.map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => onChange(tab)}
          className={`px-4 py-2 text-sm font-medium ${
            active === tab
              ? 'border-b-2 border-[var(--color-brand)] text-[var(--color-brand)]'
              : 'text-[var(--color-text-sub)] hover:text-[var(--color-text)]'
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
