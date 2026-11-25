import { useState } from 'react';
import type { Outfit, OutfitAcquireCategory, OutfitGame } from '../../types/outfit';

export const OUTFIT_GAME_LABEL: Record<OutfitGame, string> = {
  ES2: 'Ensemble Stars!!',
  ES: 'Ensemble Stars!',
};

export const OUTFIT_GAME_LIST: OutfitGame[] = ['ES2', 'ES'];

/** 상단 탭. 개별 탭은 탭 자체가 게임을 정하고, All 탭에서만 "출시 게임" 필터를 쓴다 */
export type OutfitTab = OutfitGame | 'All';
export const OUTFIT_TABS: OutfitTab[] = ['ES2', 'ES', 'All'];
export const OUTFIT_TAB_LABEL: Record<OutfitTab, string> = { ...OUTFIT_GAME_LABEL, All: 'All' };

/** 필터 칩과 섹션이 놓이는 순서 */
export const OUTFIT_CATEGORY_LIST: OutfitAcquireCategory[] = [
  '기본',
  '아이돌랭크',
  '아이돌로드',
  '캠페인',
  'ES 코인샵',
  '생일',
  '그 외',
];

export interface OutfitFilterState {
  games: Record<OutfitGame, boolean>;
  categories: Record<OutfitAcquireCategory, boolean>;
}

const allOn = <K extends string>(keys: readonly K[]): Record<K, boolean> =>
  Object.fromEntries(keys.map((k) => [k, true])) as Record<K, boolean>;

/** 둘 다 전체 선택으로 시작한다 */
export function createDefaultOutfitFilter(): OutfitFilterState {
  return { games: allOn(OUTFIT_GAME_LIST), categories: allOn(OUTFIT_CATEGORY_LIST) };
}

export function useOutfitFilter() {
  const [filter, setFilter] = useState<OutfitFilterState>(createDefaultOutfitFilter);
  return { filter, setFilter };
}

/**
 * 옷이 놓이는 섹션.
 * 얻는 방법이 여러 가지면 첫 번째를 대표로 삼되, ES 코인샵이 끼어 있으면 그쪽을 쓴다.
 * 당시 캠페인으로 풀렸다가 지금은 코인샵에만 남은 옷이 있어, 지금 얻을 수 있는 쪽이 맞다.
 */
export function primaryCategory(outfit: Outfit): OutfitAcquireCategory {
  if (outfit.categories.includes('ES 코인샵')) return 'ES 코인샵';
  return outfit.categories[0] ?? '그 외';
}

/**
 * 섹션과 필터를 1:1로 맞추려고 대표 분류 하나만 본다.
 * (얻는 방법이 여러 가지인 옷도 섹션은 하나여야 목록에서 같은 옷이 두 번 나오지 않는다)
 * 출시 게임은 All 탭에서만 적용한다(개별 탭은 탭이 곧 게임이라서).
 */
export function isOutfitMatched(outfit: Outfit, filter: OutfitFilterState, tab: OutfitTab): boolean {
  if (tab === 'All') {
    if (!filter.games[outfit.game]) return false;
  } else if (outfit.game !== tab) return false;
  return filter.categories[primaryCategory(outfit)];
}
