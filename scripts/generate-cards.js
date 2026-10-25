// origin_data/data_file.xlsx 의 card_data 시트를 읽어 src/data/cards.ts 를 생성한다.
//   pnpm run cards        실제로 덮어쓴다 (git diff 로 확인할 것)
//   pnpm run cards:dry    쓰지 않고 요약만 출력
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import XLSX from 'xlsx';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = path.join(ROOT, 'origin_data', 'data_file.xlsx');
const OUTPUT = path.join(ROOT, 'src', 'data', 'cards.ts');
const DRY = process.argv.includes('--dry');

const CHAR_MAP = {
  '하스미 케이토': 'keito',
  '키류 쿠로': 'kuro',
  '칸자키 소마': 'soma',
  '타키 이부키': 'ibuki',
};

const wb = XLSX.readFile(SOURCE);
const rows = XLSX.utils.sheet_to_json(wb.Sheets['card_data'], { defval: '' }).filter((r) => r['캐릭터']);

function toIsoDate(mdY) {
  const parts = String(mdY).split('/').map(Number);
  return `${parts[2]}-${String(parts[0]).padStart(2, '0')}-${String(parts[1]).padStart(2, '0')}`;
}

function parseSkill(raw) {
  // 3성 카드는 서포트 스킬이 없어서 비어 있다(의도된 값)
  if (!raw) return null;
  if (raw.startsWith('쥬얼')) {
    const parts = raw.split('/');
    return { type: '쥬얼', gemColor: parts[1], gemSize: parts[2] };
  }
  return { type: raw };
}

/** 캐릭터-레어도-라벨-발매일이 겹치는 행을 미리 세어둔다(앙스타! 초기 "! 통상" 3장 등) */
function baseId(r) {
  const charId = CHAR_MAP[r['캐릭터']];
  if (!charId) throw new Error('모르는 캐릭터: ' + r['캐릭터']);
  return charId + '-' + String(r['레어도']) + '-' + r['라벨'] + '-' + toIsoDate(r['발매일']);
}
const baseCount = new Map();
for (const r of rows) baseCount.set(baseId(r), (baseCount.get(baseId(r)) || 0) + 1);
const dupSeq = new Map();

const seenIds = new Map();
const cards = rows.map((r) => {
  const charId = CHAR_MAP[r['캐릭터']];
  const rarity = String(r['레어도']);
  const label = r['라벨'];
  // 차수는 0(단일 카드) 또는 공백일 수 있다 → 둘 다 null
  const stageNum = Number(String(r['차수']).trim());
  const stage = Number.isFinite(stageNum) && stageNum > 0 ? stageNum : null;
  const releaseDate = toIsoDate(r['발매일']);
  // stage는 표시용 그룹핑 값이라 카드끼리 겹칠 수 있어 id에는 발매일을 쓴다
  const base = charId + '-' + rarity + '-' + label + '-' + releaseDate;
  // 같은 날 같은 라벨로 여러 장이 나온 경우만 시트 순서대로 -1, -2, ... 를 붙인다
  let id = base;
  if (baseCount.get(base) > 1) {
    const seq = (dupSeq.get(base) || 0) + 1;
    dupSeq.set(base, seq);
    id = base + '-' + seq;
  }
  if (seenIds.has(id)) throw new Error('id 중복 ' + id + ' :: ' + r['카드명'] + ' vs ' + seenIds.get(id));
  seenIds.set(id, r['카드명']);
  return {
    id,
    characterId: charId,
    name: r['카드명'],
    category: r['카테고리'],
    label,
    stage,
    releaseDate,
    thumbnailBeforeUrl: r['썸네일 이미지 - 개화 전'],
    thumbnailAfterUrl: r['썸네일 이미지 - 개화 후'],
    fullImageBeforeUrl: r['전체 이미지 - 개화 전'],
    fullImageAfterUrl: r['전체 이미지 - 개화 후'],
    quoteBefore: r['대사 - 개화 전'],
    quoteAfter: r['대사 - 개화 후'],
    quoteBeforeOriginal: r['대사(원문) - 개화 전'],
    quoteAfterOriginal: r['대사(원문) - 개화 후'],
    attribute: r['카드 속성'],
    mainStat: r['주력 능력치'],
    supportSkill: parseSkill(r['서포트 스킬']),
    has3D: r['3D의상 여부'],
    rarity,
  };
});

// 라벨이 비어 있으면 CardLabel 타입에 없는 값이 되어 tsc 에서 터진다. 미리 알려준다
const noLabel = cards.filter((c) => !String(c.label).trim());
if (noLabel.length) {
  const sample = noLabel.slice(0, 5).map((c) => `${c.characterId}/${c.name}`).join(', ');
  throw new Error(`라벨이 빈 카드 ${noLabel.length}장 — 엑셀에서 먼저 채워야 한다: ${sample}${noLabel.length > 5 ? ' ...' : ''}`);
}

console.log('카드:', cards.length, '장');
for (const [base, n] of dupSeq) console.log('  일련번호 부여:', base, '->', n, '장');

function esc(s) {
  let result = '';
  for (const ch of String(s)) {
    if (ch === '\\') result += '\\\\';
    else if (ch === "'") result += "\\'";
    else result += ch;
  }
  return result;
}

function skillLiteral(s) {
  if (s.type === '쥬얼') {
    return "{ type: '쥬얼', gemColor: '" + s.gemColor + "', gemSize: '" + s.gemSize + "' }";
  }
  return "{ type: '" + s.type + "' }";
}

let out = '// 이 파일은 scripts/generate-cards.js 가 엑셀에서 생성한다. 직접 수정하지 말 것\n';
out += "import type { Card } from '../types/card';\n\nexport const cards: Card[] = [\n";
for (const c of cards) {
  out += '  {\n';
  out += "    id: '" + c.id + "',\n";
  out += "    characterId: '" + c.characterId + "',\n";
  out += "    name: '" + esc(c.name) + "',\n";
  out += "    category: '" + c.category + "',\n";
  out += "    label: '" + c.label + "',\n";
  out += '    stage: ' + (c.stage === null ? 'null' : c.stage) + ',\n';
  out += "    releaseDate: '" + c.releaseDate + "',\n";
  out += "    thumbnailBeforeUrl: '" + esc(c.thumbnailBeforeUrl) + "',\n";
  out += "    thumbnailAfterUrl: '" + esc(c.thumbnailAfterUrl) + "',\n";
  // 아래 값들은 아직 비어 있는 카드가 많아, 있는 것만 내보낸다
  for (const [key, value] of [
    ['fullImageBeforeUrl', c.fullImageBeforeUrl],
    ['fullImageAfterUrl', c.fullImageAfterUrl],
    ['quoteBefore', c.quoteBefore],
    ['quoteAfter', c.quoteAfter],
    ['quoteBeforeOriginal', c.quoteBeforeOriginal],
    ['quoteAfterOriginal', c.quoteAfterOriginal],
  ]) {
    const text = String(value || '').trim();
    if (text) out += '    ' + key + ": '" + esc(text) + "',\n";
  }
  if (c.attribute) out += "    attribute: '" + c.attribute + "',\n";
  if (c.mainStat) out += "    mainStat: '" + c.mainStat + "',\n";
  if (c.supportSkill) out += '    supportSkill: ' + skillLiteral(c.supportSkill) + ',\n';
  out += "    has3D: '" + c.has3D + "',\n";
  out += "    rarity: '" + c.rarity + "',\n";
  out += '  },\n';
}
out += '];\n';

if (DRY) {
  console.log('--dry 이므로 쓰지 않음. 생성될 크기:', out.length, 'bytes');
} else {
  fs.writeFileSync(OUTPUT, out);
  console.log('생성:', path.relative(ROOT, OUTPUT));
}
