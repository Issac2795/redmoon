import { useRef, useState } from 'react';
import { Chip } from '../ui/Chip';
import { Switch } from '../ui/Switch';
import {
  ATTRIBUTE_FILTER_LIST,
  CATEGORY_LIST,
  GEM_COLOR_LIST,
  GEM_SIZE_LIST,
  LABEL_ORDER,
  MAIN_STAT_FILTER_LIST,
  RARITY_LIST,
  SUPPORT_SKILL_FILTER_LIST,
} from '../../constants/cardMeta';
import { redMoonCharacters } from '../../data/characters';
import { useClickOutside } from '../../hooks/useClickOutside';
import { useEscapeKey } from '../../hooks/useEscapeKey';
import { createDefaultFilterState, type FilterState } from './useCardFilter';

const GEM_COLOR_DOT: Record<string, string> = { 빨강: '#e0405a', 파랑: '#3d9be9', 노랑: '#f0c020' };

interface FilterControlsProps {
  filter: FilterState;
  onChange: (filter: FilterState) => void;
  /** 카테고리 칩은 All 탭에서만 의미가 있어 그때만 보여준다 */
  showCategories: boolean;
  /** 캐릭터가 열로, 라벨이 행으로 나뉘는 화면에서는 필요 없어 그리드 화면에서만 보여준다 */
  showCharacters?: boolean;
  showLabels?: boolean;
}

type CheckboxGroup = Exclude<keyof FilterState, 'has3DOnly'>;

function toggleGroup<K extends CheckboxGroup>(filter: FilterState, group: K, key: keyof FilterState[K]): FilterState {
  return { ...filter, [group]: { ...filter[group], [key]: !filter[group][key] } };
}

/** 라벨은 종류가 많아 "하나만 보기"를 하려면 하나씩 끄기가 번거로워, 일괄 토글을 둔다 */
function setAllLabels(filter: FilterState, value: boolean): FilterState {
  return { ...filter, labels: Object.fromEntries(LABEL_ORDER.map((label) => [label, value])) as FilterState['labels'] };
}

export function FilterControls({
  filter,
  onChange,
  showCategories,
  showCharacters = false,
  showLabels = false,
}: FilterControlsProps) {
  const [open, setOpen] = useState(false);
  const everyLabelOn = LABEL_ORDER.every((label) => filter.labels[label]);
  const containerRef = useRef<HTMLDivElement>(null);
  useClickOutside(containerRef, () => setOpen(false), open);
  useEscapeKey(() => setOpen(false), open);

  return (
    <div ref={containerRef} className="relative flex items-center gap-2">
      <button
        type="button"
        aria-label="필터"
        onClick={() => setOpen((prev) => !prev)}
        className="cursor-pointer rounded-full border border-[var(--color-brand)] px-3 py-1.5 text-sm font-medium text-[var(--color-brand)] hover:bg-[var(--color-brand)]/5"
      >
        필터
      </button>
      <button
        type="button"
        aria-label="필터 리셋"
        onClick={() => onChange(createDefaultFilterState())}
        className="cursor-pointer rounded-full border border-[var(--color-border)] px-3 py-1.5 text-sm font-medium text-[var(--color-text-sub)] hover:bg-[var(--color-bg)]"
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

          {showCharacters && (
            <div>
              <p className="mb-2 font-medium text-[var(--color-text)]">캐릭터</p>
              <div className="flex flex-wrap gap-2">
                {redMoonCharacters.map((character) => (
                  <Chip
                    key={character.id}
                    label={character.name}
                    selected={filter.characterIds[character.id]}
                    onClick={() => onChange(toggleGroup(filter, 'characterIds', character.id))}
                  />
                ))}
              </div>
            </div>
          )}

          {showCategories && (
            <div>
              <p className="mb-2 font-medium text-[var(--color-text)]">카테고리</p>
              <div className="flex flex-wrap gap-2">
                {CATEGORY_LIST.map((category) => (
                  <Chip
                    key={category}
                    label={category}
                    selected={filter.categories[category]}
                    onClick={() => onChange(toggleGroup(filter, 'categories', category))}
                  />
                ))}
              </div>
            </div>
          )}

          {showLabels && (
            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="font-medium text-[var(--color-text)]">라벨</p>
                <button
                  type="button"
                  onClick={() => onChange(setAllLabels(filter, !everyLabelOn))}
                  className="cursor-pointer text-xs text-[var(--color-text-sub)] underline hover:text-[var(--color-text)]"
                >
                  {everyLabelOn ? '모두 해제' : '모두 선택'}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {LABEL_ORDER.map((label) => (
                  <Chip
                    key={label}
                    label={label}
                    selected={filter.labels[label]}
                    onClick={() => onChange(toggleGroup(filter, 'labels', label))}
                  />
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="mb-2 font-medium text-[var(--color-text)]">레어도</p>
            <div className="flex flex-wrap gap-2">
              {RARITY_LIST.map((rarity) => (
                <Chip
                  key={rarity}
                  label={`${rarity}성`}
                  selected={filter.rarities[rarity]}
                  onClick={() => onChange(toggleGroup(filter, 'rarities', rarity))}
                />
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 font-medium text-[var(--color-text)]">서포트 스킬</p>
            <div className="flex flex-wrap gap-2">
              {SUPPORT_SKILL_FILTER_LIST.map((skill) => (
                <Chip
                  key={skill}
                  label={skill}
                  selected={filter.skills[skill]}
                  onClick={() => onChange(toggleGroup(filter, 'skills', skill))}
                />
              ))}
            </div>
          </div>

          {filter.skills['쥬얼'] && (
            <div>
              <p className="mb-2 font-medium text-[var(--color-text)]">쥬얼 색상 / 크기</p>
              <div className="flex flex-wrap gap-2">
                {GEM_COLOR_LIST.map((color) => (
                  <Chip
                    key={color}
                    label={color}
                    dotColor={GEM_COLOR_DOT[color]}
                    selected={filter.gemColors[color]}
                    onClick={() => onChange(toggleGroup(filter, 'gemColors', color))}
                  />
                ))}
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {GEM_SIZE_LIST.map((size) => (
                  <Chip
                    key={size}
                    label={size}
                    selected={filter.gemSizes[size]}
                    onClick={() => onChange(toggleGroup(filter, 'gemSizes', size))}
                  />
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="mb-2 font-medium text-[var(--color-text)]">카드 속성</p>
            <div className="flex flex-wrap gap-2">
              {ATTRIBUTE_FILTER_LIST.map((attribute) => (
                <Chip
                  key={attribute}
                  label={attribute}
                  selected={filter.attributes[attribute]}
                  onClick={() => onChange(toggleGroup(filter, 'attributes', attribute))}
                />
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 font-medium text-[var(--color-text)]">능력치</p>
            <div className="flex flex-wrap gap-2">
              {MAIN_STAT_FILTER_LIST.map((stat) => (
                <Chip
                  key={stat}
                  label={stat}
                  selected={filter.mainStats[stat]}
                  onClick={() => onChange(toggleGroup(filter, 'mainStats', stat))}
                />
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 font-medium text-[var(--color-text)]">3D 의상</p>
            <Switch
              label="3D 의상 보유"
              checked={filter.has3DOnly}
              onChange={(checked) => onChange({ ...filter, has3DOnly: checked })}
            />
          </div>

          <button
            type="button"
            onClick={() => onChange(createDefaultFilterState())}
            className="w-full cursor-pointer rounded-full border border-[var(--color-border)] py-2 font-medium text-[var(--color-text)] hover:bg-[var(--color-bg)]"
          >
            초기화
          </button>
        </div>
      )}
    </div>
  );
}
