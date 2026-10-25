// 엑셀의 카드 id가 유일한지, 어떤 카드에 일련번호가 붙는지 확인한다.
// 라벨/발매일이 비어 있어도 돌아가므로 generate-cards.js 전에 미리 점검할 때 쓴다.
//   pnpm run cards:check
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import XLSX from 'xlsx';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = path.join(ROOT, 'origin_data', 'data_file.xlsx');

const CHAR_MAP = {
  '하스미 케이토': 'keito',
  '키류 쿠로': 'kuro',
  '칸자키 소마': 'soma',
  '타키 이부키': 'ibuki',
};

const rows = XLSX.utils
  .sheet_to_json(XLSX.readFile(SOURCE).Sheets['card_data'], { defval: '' })
  .filter((r) => r['캐릭터']);

// 빈 값도 눈에 보이게 표시해 둔다(실제 생성 시에는 타입 에러가 난다)
const toIso = (v) => {
  const p = String(v).split('/').map(Number);
  return p.length === 3 && p.every(Number.isFinite)
    ? `${p[2]}-${String(p[0]).padStart(2, '0')}-${String(p[1]).padStart(2, '0')}`
    : '(발매일공란)';
};
const baseId = (r) =>
  `${CHAR_MAP[r['캐릭터']] ?? '?' + r['캐릭터']}-${r['레어도']}-${String(r['라벨']).trim() || '(라벨공란)'}-${toIso(r['발매일'])}`;

const baseCount = new Map();
for (const r of rows) baseCount.set(baseId(r), (baseCount.get(baseId(r)) || 0) + 1);

const seq = new Map();
const ids = new Map();
const dups = [];
for (const r of rows) {
  const base = baseId(r);
  let id = base;
  if (baseCount.get(base) > 1) {
    const n = (seq.get(base) || 0) + 1;
    seq.set(base, n);
    id = `${base}-${n}`;
  }
  if (ids.has(id)) dups.push(`${id} :: ${r['카드명']} vs ${ids.get(id)}`);
  ids.set(id, r['카드명']);
}

console.log(`카드 ${rows.length}장 | 고유 id ${ids.size}개 | 남은 중복 ${dups.length}건`);
if (dups.length) console.log(dups.map((d) => '  ' + d).join('\n'));

if (seq.size) {
  console.log('\n[일련번호가 붙는 그룹]');
  for (const base of seq.keys()) {
    const names = rows.filter((r) => baseId(r) === base).map((r) => r['카드명']);
    console.log(`  ${base} (${names.length}장)`);
    names.forEach((name, i) => console.log(`    ${base}-${i + 1} = ${name}`));
  }
}

const blanks = rows.filter((r) => !String(r['라벨']).trim());
if (blanks.length) {
  console.log(`\n[라벨 공란 ${blanks.length}장] 채우기 전에는 cards.ts 를 생성할 수 없다`);
  for (const r of blanks.slice(0, 10)) console.log(`  ${r['캐릭터']} / ${r['카드명']}`);
  if (blanks.length > 10) console.log(`  ... 외 ${blanks.length - 10}장`);
}

process.exitCode = dups.length ? 1 : 0;
