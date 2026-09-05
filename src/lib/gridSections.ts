import { LABEL_ORDER } from '../constants/cardMeta';
import { formatRowLabel } from './formatCard';
import type { Card, CharacterId } from '../types/card';

export interface GridRow {
  rowLabel: string;
  /** characters 배열과 같은 순서. 같은 구간에 카드가 여러 장이면 배열에 여러 개 들어감 */
  cardsByCharacter: Card[][];
}

export interface GridSection {
  title: string;
  rows: GridRow[];
}

function groupByCharacter(bucketCards: Card[], characterOrder: CharacterId[]): Card[][] {
  const byChar = new Map<CharacterId, Card[]>(characterOrder.map((id) => [id, []]));
  for (const card of bucketCards) {
    byChar.get(card.characterId)?.push(card);
  }
  for (const list of byChar.values()) {
    list.sort((a, b) => {
      if (a.rarity !== b.rarity) return Number(b.rarity) - Number(a.rarity);
      return (a.releaseDate ?? '').localeCompare(b.releaseDate ?? '');
    });
  }
  return characterOrder.map((id) => byChar.get(id)!);
}

/** "종류별": 라벨(하코/투어/...)을 섹션으로, 라벨+차수를 행으로 묶는다. */
export function buildLabelSections(cards: Card[], characterOrder: CharacterId[]): GridSection[] {
  return LABEL_ORDER.map((label) => {
    const labelCards = cards.filter((card) => card.label === label);
    const stages = Array.from(new Set(labelCards.map((card) => card.stage))).sort((a, b) => (a ?? 0) - (b ?? 0));
    const rows = stages.map((stage) => ({
      rowLabel: formatRowLabel(label, stage),
      cardsByCharacter: groupByCharacter(
        labelCards.filter((card) => card.stage === stage),
        characterOrder,
      ),
    }));
    return { title: label, rows };
  }).filter((section) => section.rows.length > 0);
}

interface TimeBucket {
  /** 같은 연도의 다른 반기와 섞이지 않도록 하는 내부 키 (표시용 X) */
  key: string;
  sectionTitle: string;
  rowLabel: string;
  sortKey: number;
}

function bucketOf(releaseDate: string | undefined): TimeBucket {
  if (!releaseDate) return { key: '상시', sectionTitle: '상시', rowLabel: '상시', sortKey: -1 };
  const year = Number(releaseDate.slice(0, 4));
  const month = Number(releaseDate.slice(5, 7));
  const half = month <= 6 ? '상반기' : '하반기';
  const halfNum = month <= 6 ? 1 : 2;
  return { key: `${year}-${halfNum}`, sectionTitle: `${year}년`, rowLabel: half, sortKey: year * 10 + halfNum };
}

/** "시간순": 발매일 기준 연도를 섹션으로, 상/하반기를 행으로 묶는다. 발매일이 없는 카드(통상 등)는 "상시" 섹션으로 모은다. */
export function buildTimeSections(cards: Card[], characterOrder: CharacterId[]): GridSection[] {
  const buckets = new Map<string, { info: TimeBucket; cards: Card[] }>();
  for (const card of cards) {
    const info = bucketOf(card.releaseDate);
    const bucket = buckets.get(info.key) ?? { info, cards: [] };
    bucket.cards.push(card);
    buckets.set(info.key, bucket);
  }

  const sortedBuckets = Array.from(buckets.values()).sort((a, b) => a.info.sortKey - b.info.sortKey);

  const sections: GridSection[] = [];
  for (const bucket of sortedBuckets) {
    const row = { rowLabel: bucket.info.rowLabel, cardsByCharacter: groupByCharacter(bucket.cards, characterOrder) };
    const lastSection = sections[sections.length - 1];
    if (lastSection && lastSection.title === bucket.info.sectionTitle) {
      lastSection.rows.push(row);
    } else {
      sections.push({ title: bucket.info.sectionTitle, rows: [row] });
    }
  }
  return sections;
}
