import { useRef, useState } from 'react';
import { useClickOutside } from '../../hooks/useClickOutside';
import { useEscapeKey } from '../../hooks/useEscapeKey';
import { Chip } from '../ui/Chip';
import {
  OUTFIT_CATEGORY_LIST,
  OUTFIT_GAME_LABEL,
  OUTFIT_GAME_LIST,
  createDefaultOutfitFilter,
  type OutfitFilterState,
} from './useOutfitFilter';

interface OutfitFilterControlsProps {
  filter: OutfitFilterState;
  onChange: (filter: OutfitFilterState) => void;
  /** 출시 게임 칩은 All 탭에서만 의미가 있어 그때만 보여준다 */
  showGames: boolean;
}

type Group = keyof OutfitFilterState;

function toggle<K extends Group>(
  filter: OutfitFilterState,
  group: K,
  key: keyof OutfitFilterState[K],
): OutfitFilterState {
  return { ...filter, [group]: { ...filter[group], [key]: !filter[group][key] } };
}

export function OutfitFilterControls({ filter, onChange, showGames }: OutfitFilterControlsProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  useClickOutside(containerRef, () => setOpen(false), open);
  useEscapeKey(() => setOpen(false), open);

  return (
    <div ref={containerRef} className="relative flex items-center gap-2">
      <button
        type="button"
        aria-label="필터"
        onClick={() => setOpen((prev) => !prev)}
        className="cursor-pointer rounded-full border border-[var(--color-brand)] px-3 py-1.5 text-sm font-medium whitespace-nowrap text-[var(--color-brand)] hover:bg-[var(--color-brand)]/5"
      >
        필터
      </button>
      <button
        type="button"
        aria-label="필터 리셋"
        onClick={() => onChange(createDefaultOutfitFilter())}
        className="cursor-pointer rounded-full border border-[var(--color-border)] px-3 py-1.5 text-sm font-medium whitespace-nowrap text-[var(--color-text-sub)] hover:bg-[var(--color-bg)]"
      >
        리셋
      </button>

      {open && (
        <div className="absolute top-full right-0 z-10 mt-2 max-h-[70vh] w-80 space-y-4 overflow-y-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4 text-sm shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span aria-hidden="true">🌑</span>
              <p className="font-semibold text-[var(--color-text)]">필터</p>
            </div>
            <button
              type="button"
              aria-label="닫기"
              onClick={() => setOpen(false)}
              className="cursor-pointer text-[var(--color-text-sub)] hover:text-[var(--color-text)]"
            >
              ✕
            </button>
          </div>

          {showGames && (
            <div>
              <p className="mb-2 font-medium text-[var(--color-text)]">출시 게임</p>
              <div className="flex flex-wrap gap-2">
                {OUTFIT_GAME_LIST.map((game) => (
                  <Chip
                    key={game}
                    label={OUTFIT_GAME_LABEL[game]}
                    selected={filter.games[game]}
                    onClick={() => onChange(toggle(filter, 'games', game))}
                  />
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="mb-2 font-medium text-[var(--color-text)]">획득 방법</p>
            <div className="flex flex-wrap gap-2">
              {OUTFIT_CATEGORY_LIST.map((category) => (
                <Chip
                  key={category}
                  label={category}
                  selected={filter.categories[category]}
                  onClick={() => onChange(toggle(filter, 'categories', category))}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
