// ensemble-stars.fandom.com 에서 3성 카드 정보를 모아 scripts/scraped-cards.json 으로 저장한다.
// MediaWiki 가 공식 제공하는 api.php(action=parse) 를 쓴다.
//   pnpm run cards:scrape                 네 명 전부
//   pnpm run cards:scrape -- 쿠로 소마     이름 일부만 (부분 일치)
//
// 엑셀 기입 규칙
//   카드명      한국어 > 일본어 > 영어 순
//   카테고리    ES!! 는 입수처가 Scout 이면 Scout, 그 외 Event / ES! 는 전부 Special
//   카드 속성   ES!! 는 infobox 테마, ES! 는 Vocal→Brilliant / Dance→Sparkle / Performance→Flash
//   발매일      입수처의 기간 표기 시작일. 상시 입수 카드는 공란
//   대사(원문)  일본어일 때만 채우고, 영어뿐이면 nonJa1/nonJa2 에 남겨 따로 확인한다
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUTPUT = path.join(ROOT, 'scripts', 'scraped-cards.json');

const API = 'https://ensemble-stars.fandom.com/api.php';
const ES1_ATTR = { Vocal: 'Brilliant', Dance: 'Sparkle', Performance: 'Flash' };

const CHARACTERS = [
  { charKo: '하스미 케이토', listPage: 'Keito Hasumi/Cards' },
  { charKo: '키류 쿠로', listPage: 'Kuro Kiryu/Cards' },
  { charKo: '칸자키 소마', listPage: 'Souma Kanzaki/Cards' },
  // 타키 이부키는 Ensemble Stars! 시절 카드가 없다
  { charKo: '타키 이부키', listPage: 'Ibuki Taki/Cards' },
];

const filters = process.argv.slice(2).filter((a) => !a.startsWith('-'));
const targets = filters.length
  ? CHARACTERS.filter((c) => filters.some((f) => c.charKo.includes(f)))
  : CHARACTERS;
if (!targets.length) throw new Error('이름이 맞는 캐릭터가 없다: ' + filters.join(', '));

async function parsePage(page) {
  const url = `${API}?action=parse&page=${encodeURIComponent(page)}&prop=text&format=json&formatversion=2`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} :: ${page}`);
  const json = await res.json();
  if (json.error) throw new Error(`${json.error.code} :: ${page}`);
  return new JSDOM(json.parse.text).window.document;
}

/** 표의 첫 줄 제목이 정확히 게임 이름인 표를 고른다(Global 전용판은 제외) */
function collect3Star(doc, gameTitle) {
  const table = [...doc.querySelectorAll('table')].find(
    (t) => (t.rows[0]?.textContent || '').replace(/\s+/g, ' ').trim() === gameTitle,
  );
  if (!table) return [];
  const heads = [...table.querySelectorAll('h2')];
  const h = heads.find((x) => x.textContent.trim().startsWith('3★'));
  if (!h) return [];
  const next = heads[heads.indexOf(h) + 1] || null;
  const out = [];
  const w = doc.createTreeWalker(table, 1);
  let started = false;
  let node;
  while ((node = w.nextNode())) {
    if (node === h) { started = true; continue; }
    if (next && node === next) break;
    if (!started) continue;
    const href = node.tagName === 'A' ? node.getAttribute('href') : null;
    if (href && href.includes('/wiki/(') && !out.includes(href)) out.push(href);
  }
  return out;
}

function extract(doc, page, game, charKo) {
  const nameEl = doc.querySelector('.infobox-char-name');
  let name = '';
  let nameSource = '';
  if (nameEl) {
    const lines = nameEl.innerHTML.split(/<br\s*\/?>/i).map((s) => s.replace(/<[^>]*>/g, '').trim()).filter(Boolean);
    const brackets = lines.map((l) => (l.match(/^[[［](.+?)[\]］]/) || [])[1]).filter(Boolean);
    const ko = brackets.find((b) => /[가-힣]/.test(b));
    const ja = brackets.find((b) => /[ぁ-んァ-ヶ一-龯]/.test(b));
    if (ko) { name = ko; nameSource = 'ko'; }
    else if (ja) { name = ja; nameSource = 'ja'; }
    else { name = (lines[0].match(/^\((.+?)\)/) || [])[1] || lines[0]; nameSource = 'en'; }
  }

  const theme = (doc.querySelector('aside.portable-infobox')?.className.match(/pi-theme-([\w-]+)/) || [])[1] || '';
  const parts = theme.split('-');
  const attribute = game === 'ES2' ? parts[1] || '' : ES1_ATTR[parts[0]] || '';

  const acq = doc.querySelector('[data-source="MAcquire"], [data-source="BAcquire"]');
  const valueEl = acq ? acq.querySelector('.pi-data-value') : null;
  let items = acq ? [...acq.querySelectorAll('li')].map((li) => li.textContent.replace(/\s+/g, ' ').trim()) : [];
  if (!items.length && valueEl) items = [valueEl.textContent.replace(/\s+/g, ' ').trim()];
  const first = items[0] || '';
  const category = game === 'ES1' ? 'Special' : /Scout/i.test(first) ? 'Scout' : 'Event';
  const releaseDate = (items.join(' | ').match(/\((\d{1,2}\/\d{1,2}\/\d{4})\s*[-–]/) || [])[1] || '';

  const urls = [...doc.querySelectorAll('img')]
    .map((i) => i.getAttribute('data-src') || i.getAttribute('src') || '')
    .filter((s) => s.includes('ensemble-stars/images'))
    .map((s) => s.replace(/\/scale-to-width-down\/\d+/, '').split(' ')[0]);
  const pick = (suffixes) => {
    for (const suf of suffixes) {
      const hit = urls.find((u) => decodeURIComponent(u.split('/revision')[0]).endsWith(suf));
      if (hit) return hit;
    }
    return '';
  };

  const raw1 = doc.querySelector('.card-quote-1')?.textContent.trim() || '';
  const raw2 = doc.querySelector('.card-quote-2')?.textContent.trim() || '';
  const isJa = (t) => /[ぁ-んァ-ヶ一-龯]/.test(t);

  return {
    page, game, charKo, name, nameSource, attribute, category, releaseDate,
    acquiring: first.slice(0, 80),
    thumbBefore: pick(['_M_Mini.png', '_Mini.png']),
    thumbAfter: pick(['_M_Mini_Bloomed.png', '_Mini_Bloomed.png']),
    fullBefore: pick(['_Frameless.png']),
    fullAfter: pick(['_Frameless_Bloomed.png']),
    quoteBeforeOriginal: isJa(raw1) ? raw1 : '',
    quoteAfterOriginal: isJa(raw2) ? raw2 : '',
    nonJa1: !isJa(raw1) && raw1 ? raw1 : '',
    nonJa2: !isJa(raw2) && raw2 ? raw2 : '',
  };
}

const all = [];
for (const t of targets) {
  const listDoc = await parsePage(t.listPage);
  const es2 = collect3Star(listDoc, 'Ensemble Stars!!');
  const es1 = collect3Star(listDoc, 'Ensemble Stars!');
  console.log(`${t.charKo}: ES!! ${es2.length}장, ES! ${es1.length}장`);
  for (const [hrefs, game] of [[es2, 'ES2'], [es1, 'ES1']]) {
    for (const href of hrefs) {
      const page = decodeURIComponent(href.replace('/wiki/', '')).replace(/_/g, ' ');
      all.push(extract(await parsePage(page), page, game, t.charKo));
      process.stdout.write('.');
    }
  }
  console.log('');
}

fs.writeFileSync(OUTPUT, JSON.stringify(all, null, 2));
console.log('\n총 수집:', all.length, '장 ->', path.relative(ROOT, OUTPUT));
