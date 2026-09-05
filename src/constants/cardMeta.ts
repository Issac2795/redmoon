import type {
  CardAttribute,
  CardLabel,
  Category,
  GemColor,
  GemSize,
  MainStat,
  Rarity,
  SupportSkillType,
} from '../types/card';

export const CATEGORY_LIST: Category[] = ['Event', 'Scout', 'Special'];

/** 그리드 행 정렬 순서. "!" 라벨(앙스타! 시절 카드)은 뒤에 몰아둔다 */
export const LABEL_ORDER: CardLabel[] = [
  '통상',
  '하코',
  '투어',
  '셔플',
  '배수',
  '피처',
  '크로스',
  '주년',
  'TRIP',
  'MainStory',
  '해외한정',
  '! 통상',
  '! 스카우트',
  '! 이벤트',
];

/** 값이 비어 있는 카드(3성 등)를 필터에서 따로 켜고 끄기 위한 키 */
export const UNSET = '미입력';
export type Unset = typeof UNSET;

export const SUPPORT_SKILL_LIST: SupportSkillType[] = ['앙상블', '볼티지', '콤보', '퍼펙트', '쥬얼', '육성티켓'];

/** 필터 칩 표시용 — 실제 값 목록 뒤에 "미입력"을 붙인다 */
export const SUPPORT_SKILL_FILTER_LIST: (SupportSkillType | Unset)[] = [...SUPPORT_SKILL_LIST, UNSET];

export const GEM_COLOR_LIST: GemColor[] = ['빨강', '파랑', '노랑'];

export const GEM_SIZE_LIST: GemSize[] = ['대', '중', '소', '전체'];

export const ATTRIBUTE_LIST: CardAttribute[] = ['Sparkle', 'Brilliant', 'Glitter', 'Flash'];

export const ATTRIBUTE_FILTER_LIST: (CardAttribute | Unset)[] = [...ATTRIBUTE_LIST, UNSET];

export const ATTRIBUTE_META: Record<CardAttribute, { color: string; iconUrl: string }> = {
  Sparkle: {
    color: '#e0405a',
    iconUrl:
      'https://static.wikia.nocookie.net/ensemble-stars/images/7/7a/SpIcon.png/revision/latest/scale-to-width-down/20?cb=20250429191228',
  },
  Brilliant: {
    color: '#3d9be9',
    iconUrl:
      'https://static.wikia.nocookie.net/ensemble-stars/images/5/51/BrIcon.png/revision/latest/scale-to-width-down/20?cb=20250429191342',
  },
  Glitter: {
    color: '#4caf50',
    iconUrl:
      'https://static.wikia.nocookie.net/ensemble-stars/images/9/9c/GlIcon.png/revision/latest/scale-to-width-down/20?cb=20250429191318',
  },
  Flash: {
    color: '#f0c020',
    iconUrl:
      'https://static.wikia.nocookie.net/ensemble-stars/images/0/05/FlIcon.png/revision/latest/scale-to-width-down/20?cb=20250429191253',
  },
};

export const RARITY_LIST: Rarity[] = ['5', '4', '3'];

export const MAIN_STAT_LIST: MainStat[] = ['Da', 'Vo', 'Pf'];

export const MAIN_STAT_FILTER_LIST: (MainStat | Unset)[] = [...MAIN_STAT_LIST, UNSET];

export const MAIN_STAT_META: Record<MainStat, { color: string }> = {
  Da: { color: '#EA4362' },
  Vo: { color: '#59C7F8' },
  Pf: { color: '#F9D548' },
};
