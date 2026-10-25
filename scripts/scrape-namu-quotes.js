// 나무위키 캐릭터 문서에서 카드명과 대사(일본어 원문 + 한국어 번역)를 모아
// scripts/namu-quotes.json 으로 저장한다.
//   pnpm run cards:namu              네 명 전부 (앙상블 스타즈! 문서)
//   pnpm run cards:namu -- 쿠로      이름 일부만
//
// 문서 구조: 카드 한 장이 표 하나.
//   1행 = "[카드명] 캐릭터" (각주 링크는 제거)
//   마지막 행 = 칸 2개(개화 전 / 개화 후), 각 칸이 "일본어\n한국어"
// 아직 번역/원문이 안 적힌 칸은 "번역", "원문", "해석" 같은 안내 문구가 들어 있어 빈 값으로 본다.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUTPUT = path.join(ROOT, 'scripts', 'namu-quotes.json');

const CHARACTERS = [
  { charKo: '하스미 케이토', doc: '하스미 케이토/앙상블 스타즈!', namuName: '하스미 케이토' },
  { charKo: '키류 쿠로', doc: '키류 쿠로/앙상블 스타즈!', namuName: '키류 쿠로' },
  { charKo: '칸자키 소마', doc: '칸자키 소마/앙상블 스타즈!', namuName: '칸자키 소마' },
  { charKo: '타키 이부키', doc: '타키 이부키/앙상블 스타즈!', namuName: '타키 이부키' },
];

const KANA = /[぀-ゟ゠-ヿ]/;
const HANGUL = /[가-힣]/;

/** 값이 아니라 "아직 안 적혔다"는 안내 문구인지 */
const PLACEHOLDER = new Set(['번역', '원문', '해석', '-', '–', '없음']);
const clean = (s) => {
  const t = String(s || '').replace(/\s+/g, ' ').trim();
  return PLACEHOLDER.has(t) ? '' : t;
};

/**
 * 칸 안은 "일본어<br>한국어" 구조다. jsdom 에는 innerText 가 없어
 * <br> 를 줄바꿈 문자로 바꿔치기한 뒤 textContent 로 읽는다.
 */
function linesOf(el) {
  const copy = el.cloneNode(true);
  // 각주와 취소선(오역 메모 등)은 대사가 아니다
  copy.querySelectorAll('del, s, a[href^="#fn-"]').forEach((n) => n.remove());
  for (const br of [...copy.querySelectorAll('br')]) {
    br.replaceWith(copy.ownerDocument.createTextNode('\n'));
  }
  return copy.textContent.split('\n').map((s) => s.trim()).filter(Boolean);
}

function parse(html, namuName) {
  const doc = new JSDOM(html).window.document;
  const out = [];
  let star = null;
  const walker = doc.createTreeWalker(doc.body, 1);
  let node;
  while ((node = walker.nextNode())) {
    if (/^H[2-6]$/.test(node.tagName)) {
      const m = node.textContent.trim().match(/★(\d)/);
      if (m) star = m[1];
      continue;
    }
    if (node.tagName !== 'TABLE' || !star) continue;
    const rows = node.rows;
    if (rows.length < 3) continue;
    if (rows[0].cells.length !== 1 || rows[0].cells[0].colSpan !== 2) continue;

    const head = rows[0].cells[0].cloneNode(true);
    head.querySelectorAll('a[href^="#fn-"]').forEach((a) => a.remove());
    const header = head.textContent.replace(/\s+/g, ' ').trim();
    if (!header.endsWith(namuName)) continue;

    const last = rows[rows.length - 1];
    if (last.cells.length !== 2) continue;
    // 줄 순서가 "일본어 다음 한국어"가 아닌 카드도 있어서, 위치가 아니라 글자 종류로 가른다
    const pair = [...last.cells].map((c) => {
      const lines = linesOf(c).map(clean).filter(Boolean);
      let ja = lines.find((s) => KANA.test(s) && !HANGUL.test(s)) || '';
      let ko = lines.find((s) => HANGUL.test(s)) || '';
      // "…………" 처럼 가나도 한글도 없는 대사는 글자로 가를 수 없으니 줄 순서를 따른다
      if (!ja && !ko && lines.length === 2) [ja, ko] = lines;
      const rest = lines.filter((s) => s !== ja && s !== ko);
      return { ja, ko, unclassified: rest };
    });

    const m = header.match(/^\[\s*(.+?)\s*\]\s*(.+)$/);
    out.push({ star, name: m ? m[1] : header, before: pair[0], after: pair[1] });
  }
  return out;
}

const filters = process.argv.slice(2).filter((a) => !a.startsWith('-'));
const targets = filters.length
  ? CHARACTERS.filter((c) => filters.some((f) => c.charKo.includes(f)))
  : CHARACTERS;
if (!targets.length) throw new Error('이름이 맞는 캐릭터가 없다: ' + filters.join(', '));

const all = [];
for (const t of targets) {
  const url = 'https://namu.wiki/w/' + encodeURIComponent(t.doc);
  const res = await fetch(url);
  if (!res.ok) {
    console.log(`${t.charKo}: HTTP ${res.status} — 건너뜀 (${t.doc})`);
    continue;
  }
  const cards = parse(await res.text(), t.namuName);
  const byStar = {};
  for (const c of cards) byStar[c.star] = (byStar[c.star] || 0) + 1;
  console.log(`${t.charKo}: ${cards.length}장 ` + JSON.stringify(byStar));
  for (const c of cards) all.push({ charKo: t.charKo, ...c });
}

fs.writeFileSync(OUTPUT, JSON.stringify(all, null, 2));
console.log('\n총', all.length, '장 ->', path.relative(ROOT, OUTPUT));
