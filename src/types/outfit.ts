import type { CharacterId } from './card';

/** 옷장이 나온 게임. 'ES'는 앙상블 스타즈!, 'ES2'는 앙상블 스타즈!! */
export type OutfitGame = 'ES' | 'ES2';

/** 얻는 방법을 필터용으로 묶은 분류 */
export type OutfitAcquireCategory = '기본' | '아이돌로드' | '아이돌랭크' | '캠페인' | 'ES 코인샵' | '생일' | '그 외';

export interface OutfitAcquire {
  /** 한국어로 옮긴 조건 한 줄. cardName이 있으면 그 뒤에 붙는다 */
  text: string;
  category: OutfitAcquireCategory;
  /** 아이돌 로드로 얻는 옷의 카드명. 화면에서 밑줄로 표시하고, 나중에 카드로 이동시킬 자리 */
  cardName?: string;
}

export interface Outfit {
  id: string;
  characterId: CharacterId;
  game: OutfitGame;
  /** 일본어 이름 우선. 일본어가 없는 옷만 영문 이름이 들어간다 */
  name: string;
  /** 위키에 그림이 아직 없는 옷은 비어 있을 수 있다 */
  imageUrl?: string;
  /** 일본어 설명 우선. 없을 수 있다 */
  description?: string;
  /**
   * 얻는 방법. 앙상블 스타즈!! 옷장만 채워져 있고, 조건이 여러 개면 그만큼 들어간다.
   * (Basic 전용 조건은 Music만 하는 사용자 기준이라 빼고 모은다)
   */
  acquires: OutfitAcquire[];
  /** 필터용. acquires가 비면 '그 외' 하나가 들어간다 */
  categories: OutfitAcquireCategory[];
}
