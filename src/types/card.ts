/** 캐릭터가 계속 늘어나는 데이터라 고정 유니온 대신 string으로 둠 */
export type CharacterId = string;

export type CardLabel =
  | '하코'
  | '투어'
  | '셔플'
  | '피처'
  | '배수'
  | '크로스'
  | '통상'
  | '해외한정'
  | '주년'
  | 'TRIP'
  | 'MainStory'
  | '스페셜'
  // "!"로 시작하는 라벨은 앙상블 스타즈! 시절 카드로, 한꺼번에 묶어 관리한다
  | '! 통상'
  | '! 하코'
  | '! 스카우트'
  | '! 이벤트';

export type Category = 'Event' | 'Scout' | 'Special';

export type CardAttribute = 'Sparkle' | 'Brilliant' | 'Glitter' | 'Flash';

export type MainStat = 'Da' | 'Vo' | 'Pf';

export type SupportSkillType = '앙상블' | '볼티지' | '콤보' | '퍼펙트' | '쥬얼' | '육성티켓';

export type GemColor = '빨강' | '파랑' | '노랑';

export type GemSize = '대' | '중' | '소' | '전체';

export type Has3D = 'O' | 'X';

export type Rarity = '5' | '4' | '3';

export interface SupportSkill {
  type: SupportSkillType;
  /** type === '쥬얼'일 때만 사용 */
  gemColor?: GemColor;
  /** type === '쥬얼'일 때만 사용 */
  gemSize?: GemSize;
}

export interface Card {
  /**
   * `${characterId}-${rarity}-${label}-${releaseDate}` 형식.
   * stage는 표시용 그룹핑 값이라 카드끼리 겹칠 수 있어 id에는 쓰지 않는다.
   * 같은 날 같은 라벨로 여러 장이 나온 경우(예: 앙스타! 초기 "! 통상" 3장)에만
   * 뒤에 `-1`, `-2` 같은 일련번호가 붙는다.
   */
  id: string;
  characterId: CharacterId;
  name: string;
  /** 같은 라벨이라도 카드마다 카테고리가 다를 수 있어(예: 셔플, MainStory) 별도로 저장함 */
  category: Category;
  label: CardLabel;
  /** 크로스/통상처럼 단일 카드인 라벨은 stage가 없음 */
  stage: number | null;
  /** 'YYYY-MM-DD'. 통상처럼 특정 발매일이 없는 카드는 비어있을 수 있음 */
  releaseDate?: string;
  /** 개화 전 썸네일 */
  thumbnailBeforeUrl: string;
  /** 개화 후 썸네일 */
  thumbnailAfterUrl: string;
  /** 상세 모달에서 쓰는 풀 일러스트. 아직 없는 카드가 많아 선택 항목 */
  fullImageBeforeUrl?: string;
  fullImageAfterUrl?: string;
  /** 카드 대사(번역). 원문은 "원문" 체크 시 대신 보여준다 */
  quoteBefore?: string;
  quoteAfter?: string;
  quoteBeforeOriginal?: string;
  quoteAfterOriginal?: string;
  /** 비어 있을 수 있음. 필터에서는 "미입력"으로 묶인다 */
  attribute?: CardAttribute;
  /** 3성 카드는 값이 없다 */
  mainStat?: MainStat;
  /** 3성 카드는 서포트 스킬이 없다 */
  supportSkill?: SupportSkill;
  has3D: Has3D;
  rarity: Rarity;
}

export interface Character {
  id: CharacterId;
  name: string;
  /** 소속 유닛. 예: '紅月', 'Switch' */
  unit: string;
  defaultIconUrl: string;
  /** 'MM-DD' — 매년 반복되는 생일. 모르면 생략 */
  birthday?: string;
}
