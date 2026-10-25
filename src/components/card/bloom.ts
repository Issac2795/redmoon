/** 카드 한 장이 가진 두 가지 그림 */
export type BloomStage = 'before' | 'after';

/** 화면에 무엇을 띄울지. 둘 다 끄는 상태는 없다 */
export type BloomMode = BloomStage | 'both';

export const STAGE_LABEL: Record<BloomStage, string> = {
  before: '개화 전',
  after: '개화 후',
};

/** 보이는 단계 목록. 'both'면 개화 전 → 개화 후 순서 */
export function shownStages(mode: BloomMode): BloomStage[] {
  return mode === 'both' ? ['before', 'after'] : [mode];
}

/** 켜져 있으면 끄고 꺼져 있으면 켠다. 마지막 하나는 끌 수 없어 그대로 둔다 */
export function toggleStage(mode: BloomMode, stage: BloomStage): BloomMode {
  if (mode === 'both') return stage === 'before' ? 'after' : 'before';
  if (mode === stage) return mode;
  return 'both';
}
