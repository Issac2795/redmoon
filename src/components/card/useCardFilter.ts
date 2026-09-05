import { useState } from 'react';
import {
  ATTRIBUTE_FILTER_LIST,
  CATEGORY_LIST,
  GEM_COLOR_LIST,
  GEM_SIZE_LIST,
  LABEL_ORDER,
  MAIN_STAT_FILTER_LIST,
  RARITY_LIST,
  SUPPORT_SKILL_FILTER_LIST,
  UNSET,
} from '../../constants/cardMeta';
import type { Unset } from '../../constants/cardMeta';
import { redMoonCharacters } from '../../data/characters';
import type {
  Card,
  CardAttribute,
  CardLabel,
  Category,
  CharacterId,
  GemColor,
  GemSize,
  MainStat,
  Rarity,
  SupportSkillType,
} from '../../types/card';

export interface FilterState {
  /** All 탭에서만 적용된다. 개별 탭은 탭 자체가 카테고리를 정하기 때문 */
  categories: Record<Category, boolean>;
  /** 캐릭터가 열로 나뉘는 "카드 구분" 화면에서는 쓰지 않고, 그리드 화면에서만 노출한다 */
  characterIds: Record<CharacterId, boolean>;
  /** 라벨이 행으로 나뉘는 "카드 구분" 화면에서는 쓰지 않고, 그리드 화면에서만 노출한다 */
  labels: Record<CardLabel, boolean>;
  skills: Record<SupportSkillType | Unset, boolean>;
  gemColors: Record<GemColor, boolean>;
  gemSizes: Record<GemSize, boolean>;
  attributes: Record<CardAttribute | Unset, boolean>;
  mainStats: Record<MainStat | Unset, boolean>;
  rarities: Record<Rarity, boolean>;
  /** true면 3D 의상 있는 카드만, false면 전체 표시 */
  has3DOnly: boolean;
}

function allChecked<T extends string>(list: T[]): Record<T, boolean> {
  return Object.fromEntries(list.map((item) => [item, true])) as Record<T, boolean>;
}

export function createDefaultFilterState(): FilterState {
  return {
    // Special(앙스타! 시절 카드 등)은 양이 많아 All 탭에서 기본으로 감춘다
    categories: { ...allChecked(CATEGORY_LIST), Special: false },
    characterIds: allChecked(redMoonCharacters.map((character) => character.id)),
    labels: allChecked(LABEL_ORDER),
    skills: allChecked(SUPPORT_SKILL_FILTER_LIST),
    gemColors: allChecked(GEM_COLOR_LIST),
    gemSizes: allChecked(GEM_SIZE_LIST),
    attributes: allChecked(ATTRIBUTE_FILTER_LIST),
    mainStats: allChecked(MAIN_STAT_FILTER_LIST),
    /** 기본값은 5성만 선택. 4성 이하는 필터에서 직접 선택해야 보임 */
    rarities: { ...allChecked(RARITY_LIST), '4': false, '3': false },
    has3DOnly: false,
  };
}

// 3성 카드처럼 값이 비어 있는 항목은 "미입력" 칩으로 켜고 끈다.
export function isCardMatched(card: Card, filter: FilterState): boolean {
  if (!filter.characterIds[card.characterId]) return false;
  if (!filter.labels[card.label]) return false;
  if (!filter.rarities[card.rarity]) return false;
  if (filter.has3DOnly && card.has3D !== 'O') return false;
  if (!filter.attributes[card.attribute ?? UNSET]) return false;
  if (!filter.mainStats[card.mainStat ?? UNSET]) return false;
  if (!filter.skills[card.supportSkill?.type ?? UNSET]) return false;

  if (card.supportSkill?.type === '쥬얼') {
    const { gemColor, gemSize } = card.supportSkill;
    if (gemColor && !filter.gemColors[gemColor]) return false;
    if (gemSize && !filter.gemSizes[gemSize]) return false;
  }

  return true;
}

export function useCardFilter() {
  const [filter, setFilter] = useState<FilterState>(createDefaultFilterState);
  return { filter, setFilter };
}
