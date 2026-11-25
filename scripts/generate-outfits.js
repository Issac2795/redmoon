// scripts/outfits-raw.json 을 읽어 src/data/outfits.ts 를 생성한다.
//   pnpm run outfits        실제로 덮어쓴다
//   pnpm run outfits:dry    쓰지 않고 요약과 미번역 목록만 출력
//
// 문구는 일본어 우선, 일본어가 없을 때만 영어를 쓴다.
// 얻는 방법은 앙상블 스타즈!! 옷장만 있고, 한국어로 옮기면서 필터용 분류를 함께 붙인다.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = path.join(ROOT, 'scripts', 'outfits-raw.json');
const OUTPUT = path.join(ROOT, 'src', 'data', 'outfits.ts');
const DRY = process.argv.includes('--dry');

const SHORT_NAME = { keito: '케이토', kuro: '쿠로', soma: '소마', ibuki: '이부키' };

/** 영어 고유명사를 한국어로. 길고 고유한 것부터 바꿔야 짧은 것이 먼저 걸리지 않는다 */
const WORDS = [
  ['ES New Year Sugoroku', 'ES 새해'],
  ['New Year Road', '새해 로드'],
  ['New Year', '새해'],
  ['Halloween', '할로윈'],
  ['Christmas', '크리스마스'],
  ['Get Bunny Ears', '토끼 귀 획득'],
  ['Moe-Moe Maid Missions', '모에모에 메이드 미션'],
  ['Ambassador Launch Commemoration', '앰배서더 출시 기념'],
  ['Enstars Memory Road', 'Enstars 메모리 로드'],
  ['Ensemble Stars 8th Anniversary', '앙상블 스타즈 8주년'],
  ['8th Anniversary', '8주년'],
];

const translateName = (s) => WORDS.reduce((acc, [en, ko]) => acc.split(en).join(ko), s);

/** 생일 과제에 나오는 수집 아이템 */
const ITEM = { crackers: '크래커', roses: '장미', hearts: '하트', presents: '선물' };

const toKoDate = (d) => {
  const m = String(d).match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  return m ? `${m[3]}.${String(m[1]).padStart(2, '0')}.${String(m[2]).padStart(2, '0')}` : d;
};

/**
 * 획득 방법 한 문장 -> { text, category }.
 * 규칙에 없으면 원문을 그대로 두고 '그 외'로 둔다(미번역 목록으로 보고된다).
 */
function translateAcquire(raw) {
  const s = raw.trim();
  let m;

  if (/^Default$/i.test(s)) return { text: '기본 제공', category: '기본' };

  // (카드명) 캐릭터's Idol Road — 카드명은 화면에서 밑줄로 따로 그린다
  if ((m = s.match(/^Unlock in\s+\((.+?)\)\s+.+?'s Idol Road$/i)))
    return { text: '아이돌 로드 해방', category: '아이돌로드', cardName: m[1] };

  // Basic Idol Room 랭크
  if ((m = s.match(/^Rank\s+\w+\s+up in Basic Idol Room to Rank\s+(\S+)$/i)))
    return { text: `아이돌 랭크 ${m[1]} 달성 보상`, category: '아이돌랭크' };

  // 교환소
  if (/^Exchange in ES Coin Shop$/i.test(s)) return { text: 'ES 코인 교환소', category: 'ES 코인샵' };
  if (/White Ribbon Shop$/i.test(s)) return { text: 'SS 화이트 리본 교환소', category: 'ES 코인샵' };
  if (/^Exchange in Society Coin Shop$/i.test(s)) return { text: '소사이어티 코인 교환소', category: 'ES 코인샵' };
  if (/^Exchange in CA11 Card Exchange shop$/i.test(s)) return { text: 'CA11 카드 교환소', category: 'ES 코인샵' };
  if (/^Exchange in Maid Stamp Exchange shop$/i.test(s)) return { text: '메이드 스탬프 교환소', category: 'ES 코인샵' };
  if (/^Exchange in All Out! Grand Ambassador Promotion Project Exchange shop$/i.test(s))
    return { text: 'All Out! 그랜드 앰배서더 프로모션 프로젝트 교환소', category: 'ES 코인샵' };

  // 생일
  if ((m = s.match(/^Collect\s+(\d+)\s+(\w+)\s+in\s+(\w+)'s Birthday Course on\s+(\S+)$/i)))
    return { text: `${m[3]} 생일 코스에서 ${ITEM[m[2].toLowerCase()] || m[2]} ${m[1]}개 수집 (${toKoDate(m[4])})`, category: '생일' };
  if ((m = s.match(/^Exchange for\s+(\d+)\s+Nice in\s+(\w+)'s Birthday Livestream on\s+(\S+)$/i)))
    return { text: `${m[2]} 생일 생방송에서 Nice ${m[1]}회 교환 (${toKoDate(m[3])})`, category: '생일' };

  // 캠페인
  if ((m = s.match(/^Unlock in\s+(.+?)\s+Campaign$/i)))
    return { text: `${translateName(m[1])} 캠페인 보상`, category: '캠페인' };

  // 그 밖의 Unlock in ~ : "~ 보상"
  if ((m = s.match(/^Unlock in\s+(.+)$/i))) {
    const name = translateName(m[1]);
    const campaignish = /캠페인|이벤트/.test(name);
    return { text: `${name} 보상`, category: campaignish ? '캠페인' : '그 외' };
  }

  if ((m = s.match(/^Reach level\s+(\d+)\s+in the\s+(.+?)\s+Rank$/i)))
    return { text: `${m[2]} 랭크 레벨 ${m[1]} 달성`, category: '그 외' };
  if (/^Complete all Idol Exploration Program Missions$/i.test(s))
    return { text: '아이돌 탐색 프로그램 미션 전부 달성', category: '그 외' };
  if ((m = s.match(/^Log in during the\s+(.+?)\s+mini event\s*(\(.*\))?$/i)))
    return { text: `${m[1]} 미니 이벤트 기간 로그인`, category: '그 외' };

  return { text: s, category: '그 외', untranslated: true };
}

/**
 * "A or B" 로 이어진 조건을 나눈다.
 * "on Basic or Music" 처럼 or 가 조건 구분이 아닌 곳이 있어, 뒤가 동사로 시작할 때만 자른다.
 */
function splitConditions(line) {
  return line
    .split(/\s+or\s+(?=(?:Unlock|Exchange|Collect|Rank|Reach|Log|Complete)\b)/i)
    .map((s) => s.trim())
    .filter(Boolean);
}

const raw = JSON.parse(fs.readFileSync(SOURCE, 'utf8'));
const untranslated = new Map();
const noImage = [];
const seen = new Map();

const outfits = raw.map((o) => {
  const name = o.nameJa || o.nameEn;
  const description = o.descJa || o.descEn || '';

  const acquires = [];
  for (const line of o.acquire) {
    for (let cond of splitConditions(line)) {
      // "(Basic only)" 조건은 쓰지 않는다. Music 쪽만 본다
      if (/^\((Basic only|Global)\)$/i.test(cond)) continue;
      if (/\(Basic only\)/i.test(cond)) continue;
      cond = cond.replace(/\s*\((Music only|Global)\)/gi, '').trim();
      if (!cond) continue;
      const t = translateAcquire(cond);
      if (t.untranslated) untranslated.set(cond, (untranslated.get(cond) || 0) + 1);
      const key = `${t.cardName || ''}|${t.text}`;
      if (!acquires.some((a) => `${a.cardName || ''}|${a.text}` === key))
        acquires.push({ text: t.text, category: t.category, cardName: t.cardName });
    }
  }
  // 앙스타! 옷장과 얻는 방법이 적히지 않은 옷은 필터에서 '그 외'로 묶는다
  const categories = acquires.length ? [...new Set(acquires.map((a) => a.category))] : ['그 외'];

  // 옷 그림이 위키에 아직 안 올라온 경우 아이콘으로 대신한다
  const imageUrl = o.imageUrl || o.iconUrl || '';
  if (!o.imageUrl) noImage.push(`${o.charKo} / ${name}${o.iconUrl ? ' (아이콘 대체)' : ' (아이콘도 없음)'}`);

  const base = `${o.characterId}-${o.game === 'ES2' ? 'es2' : 'es1'}-${(o.nameEn || name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'x'}`;
  const n = (seen.get(base) || 0) + 1;
  seen.set(base, n);

  return {
    id: n > 1 ? `${base}-${n}` : base,
    characterId: o.characterId,
    game: o.game === 'ES2' ? 'ES2' : 'ES',
    name,
    imageUrl,
    description,
    acquires,
    categories,
  };
});

console.log('옷장:', outfits.length, '벌');
const byChar = {};
for (const o of outfits) byChar[o.characterId] = (byChar[o.characterId] || 0) + 1;
console.log('  캐릭터별:', JSON.stringify(byChar));
const byGame = {};
for (const o of outfits) byGame[o.game] = (byGame[o.game] || 0) + 1;
console.log('  게임별:', JSON.stringify(byGame));
const byCat = {};
for (const o of outfits) for (const c of o.categories) byCat[c] = (byCat[c] || 0) + 1;
console.log('  획득 분류별:', JSON.stringify(byCat));
console.log('  설명 없음:', outfits.filter((o) => !o.description).length);
console.log('  이미지 없음:', noImage.length, noImage.join(' | '));

if (untranslated.size) {
  console.log('\n[규칙에 없어 원문 그대로 둔 문장]');
  for (const [s, n] of [...untranslated].sort((a, b) => b[1] - a[1])) console.log(`  ${String(n).padStart(3)}  ${s}`);
} else {
  console.log('\n미번역 문장 없음');
}

function esc(s) {
  let out = '';
  for (const ch of String(s)) {
    if (ch === '\\') out += '\\\\';
    else if (ch === "'") out += "\\'";
    else out += ch;
  }
  return out;
}

let ts = '// 이 파일은 scripts/generate-outfits.js 가 위키 수집 결과에서 생성한다. 직접 수정하지 말 것\n';
ts += "import type { Outfit } from '../types/outfit';\n\nexport const outfits: Outfit[] = [\n";
for (const o of outfits) {
  ts += '  {\n';
  ts += `    id: '${esc(o.id)}',\n`;
  ts += `    characterId: '${o.characterId}',\n`;
  ts += `    game: '${o.game}',\n`;
  ts += `    name: '${esc(o.name)}',\n`;
  if (o.imageUrl) ts += `    imageUrl: '${esc(o.imageUrl)}',\n`;
  if (o.description) ts += `    description: '${esc(o.description)}',\n`;
  ts += `    categories: [${o.categories.map((c) => `'${c}'`).join(', ')}],\n`;
  if (o.acquires.length) {
    ts += '    acquires: [\n';
    for (const a of o.acquires) {
      const card = a.cardName ? `, cardName: '${esc(a.cardName)}'` : '';
      ts += `      { text: '${esc(a.text)}', category: '${a.category}'${card} },\n`;
    }
    ts += '    ],\n';
  } else ts += '    acquires: [],\n';
  ts += '  },\n';
}
ts += '];\n';

if (DRY) console.log('\n--dry 이므로 쓰지 않음. 크기:', ts.length, 'bytes');
else {
  fs.writeFileSync(OUTPUT, ts);
  console.log('\n생성:', path.relative(ROOT, OUTPUT));
}
void SHORT_NAME;
