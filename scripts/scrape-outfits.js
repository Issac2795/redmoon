// 위키의 캐릭터별 Outfits 문서에서 옷장 데이터를 모아 scripts/outfits-raw.json 으로 저장한다.
//   pnpm run outfits:scrape
//
// 문서 구조
//   바깥 탭  : Ensemble_Stars!! / Ensemble_Stars!
//   안쪽 탭  : Outfits / Global_Exclusive_Outfits / Unavailable_Outfits
//   각 표의 칸: Icon | Image | Name | Description | How to Acquire   (표마다 조금씩 다름)
//   이름 칸  : 영문<br>일본어
//   설명 칸  : Official(또는 Wiki) / JP 탭
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUTPUT = path.join(ROOT, 'scripts', 'outfits-raw.json');
const API = 'https://ensemble-stars.fandom.com/api.php';

const CHARACTERS = [
  { id: 'keito', charKo: '하스미 케이토', doc: 'Keito Hasumi/Outfits' },
  { id: 'kuro', charKo: '키류 쿠로', doc: 'Kuro Kiryu/Outfits' },
  { id: 'soma', charKo: '칸자키 소마', doc: 'Souma Kanzaki/Outfits' },
  { id: 'ibuki', charKo: '타키 이부키', doc: 'Ibuki Taki/Outfits' },
];

const clean = (s) => String(s || '').replace(/\s+/g, ' ').trim();
const HAS_JA = /[぀-ゟ゠-ヿ一-鿿]/;

/** <br> 로 나뉜 줄들. 행마다 칸 수가 달라 없는 칸이 넘어오기도 한다 */
function linesOf(el) {
  if (!el) return [];
  const copy = el.cloneNode(true);
  for (const br of [...copy.querySelectorAll('br')]) br.replaceWith(copy.ownerDocument.createTextNode('\n'));
  return copy.textContent.split('\n').map(clean).filter(Boolean);
}

/** 원본 크기 이미지 주소. <a href> 가 원본이고 <img src> 는 축소판이다 */
function imageUrlOf(cell) {
  const a = cell.querySelector('a.image, a.mw-file-description');
  const href = a?.getAttribute('href') || '';
  if (href.includes('ensemble-stars/images')) return href.replace(/\/scale-to-width-down\/\d+/, '');
  const img = cell.querySelector('img');
  const src = (img?.getAttribute('data-src') || img?.getAttribute('src') || '').split(' ')[0];
  return src.includes('ensemble-stars/images') ? src.replace(/\/scale-to-width-down\/\d+/, '') : '';
}

/** Official/Wiki(영어)와 JP(일본어) 탭에서 각각 뽑는다. 탭이 없으면 통째로 영어로 본다 */
function describedBy(cell) {
  if (!cell) return { en: '', ja: '' };
  const tabber = cell.querySelector('.wds-tabber');
  if (!tabber) {
    const t = clean(cell.textContent);
    return HAS_JA.test(t) ? { en: '', ja: t } : { en: t, ja: '' };
  }
  const hashes = [...tabber.querySelectorAll('.wds-tabs > .wds-tabs__tab')].map((x) => x.getAttribute('data-hash'));
  const panels = [...tabber.querySelectorAll(':scope > .wds-tab__content')];
  const out = { en: '', ja: '' };
  hashes.forEach((h, i) => {
    const text = clean(panels[i]?.textContent);
    if (!text) return;
    if (h === 'JP') out.ja = text;
    else if (h === 'CN') return; // 중국어판 설명은 쓰지 않는다
    else out.en = out.en || text;
  });
  return out;
}

/**
 * 표를 격자로 펼친다.
 * SCR 같은 변형 옷은 바로 위 행의 "How to Acquire" 칸을 rowspan 으로 함께 쓰기 때문에,
 * cells 를 그대로 읽으면 그 행들의 획득 방법이 통째로 빠진다.
 */
function expand(table) {
  const grid = [];
  for (let r = 0; r < table.rows.length; r++) {
    grid[r] = grid[r] || [];
    let c = 0;
    for (const cell of table.rows[r].cells) {
      while (grid[r][c] !== undefined) c++;
      for (let dr = 0; dr < cell.rowSpan; dr++) {
        grid[r + dr] = grid[r + dr] || [];
        for (let dc = 0; dc < cell.colSpan; dc++) grid[r + dr][c + dc] = cell;
      }
      c += cell.colSpan;
    }
  }
  return grid;
}

function parse(html) {
  const doc = new JSDOM(html).window.document;
  const top = [...doc.querySelectorAll('.wds-tabber')].filter((t) => !t.parentElement.closest('.wds-tabber'))[0];
  if (!top) return [];

  const rows = [];
  const topTabs = [...top.querySelectorAll(':scope > .wds-tabs__wrapper > .wds-tabs > .wds-tabs__tab')].map((x) =>
    x.getAttribute('data-hash'),
  );
  // 앙스타!! 에만 나온 캐릭터(이부키)는 게임 탭이 없고 섹션 탭이 바로 최상위에 온다
  const hasGameTabs = topTabs.some((h) => String(h).startsWith('Ensemble_Stars'));
  const gameTabs = hasGameTabs ? topTabs : ['Ensemble_Stars!!'];
  const gamePanels = hasGameTabs ? [...top.querySelectorAll(':scope > .wds-tab__content')] : [top.parentElement];

  gamePanels.forEach((panel, gi) => {
    const game = gameTabs[gi] === 'Ensemble_Stars!!' ? 'ES2' : 'ES1';
    const inner = panel.querySelector('.wds-tabber');
    const sections = [];
    if (inner) {
      const hashes = [...inner.querySelectorAll(':scope > .wds-tabs__wrapper > .wds-tabs > .wds-tabs__tab')].map((x) =>
        x.getAttribute('data-hash'),
      );
      const panels = [...inner.querySelectorAll(':scope > .wds-tab__content')];
      panels.forEach((p, i) => sections.push({ section: hashes[i] || '', el: p }));
    } else sections.push({ section: 'Outfits', el: panel });

    for (const { section, el } of sections) {
      for (const table of el.querySelectorAll('table')) {
        if (table.rows.length < 2) continue;
        const grid = expand(table);
        // 헤더로 열 위치를 잡는다(표마다 열 구성이 다르다)
        const head = (grid[0] || []).map((c) => clean(c.textContent).toLowerCase());
        const col = (name) => head.findIndex((h) => h === name);
        const iImage = col('image');
        const iName = head.findIndex((h) => h === 'name' || h === 'uniform');
        if (iImage < 0 || iName < 0) continue;
        const iIcon = col('icon');
        const iDesc = col('description');
        const iAcq = col('how to acquire');

        for (let r = 1; r < grid.length; r++) {
          const cells = grid[r] || [];
          if (!cells[iName]) continue;
          const names = linesOf(cells[iName]);
          const nameJa = names.find((x) => HAS_JA.test(x)) || '';
          const nameEn = names.find((x) => !HAS_JA.test(x)) || '';
          if (!nameJa && !nameEn) continue;
          const desc = iDesc >= 0 ? describedBy(cells[iDesc]) : { en: '', ja: '' };
          rows.push({
            game,
            section,
            nameEn,
            nameJa,
            imageUrl: imageUrlOf(cells[iImage]),
            // 옷 그림이 아직 안 올라온 경우를 위해 아이콘도 같이 둔다
            iconUrl: iIcon >= 0 && cells[iIcon] ? imageUrlOf(cells[iIcon]) : '',
            descEn: desc.en,
            descJa: desc.ja,
            // 얻는 방법은 앙스타!! 옷장만 쓴다
            acquire: game === 'ES2' && iAcq >= 0 ? linesOf(cells[iAcq]) : [],
          });
        }
      }
    }
  });
  return rows;
}

const filters = process.argv.slice(2).filter((a) => !a.startsWith('-'));
const targets = filters.length ? CHARACTERS.filter((c) => filters.some((f) => c.charKo.includes(f))) : CHARACTERS;

const all = [];
for (const t of targets) {
  const url = `${API}?action=parse&page=${encodeURIComponent(t.doc)}&prop=text&format=json&formatversion=2`;
  const res = await fetch(url);
  const json = await res.json();
  if (json.error) {
    console.log(`${t.charKo}: ${json.error.code} — 건너뜀 (${t.doc})`);
    continue;
  }
  const rows = parse(json.parse.text).map((r) => ({ characterId: t.id, charKo: t.charKo, ...r }));
  const by = {};
  for (const r of rows) by[`${r.game}/${r.section}`] = (by[`${r.game}/${r.section}`] || 0) + 1;
  console.log(`${t.charKo}: ${rows.length}벌 ` + JSON.stringify(by));
  all.push(...rows);
}

fs.writeFileSync(OUTPUT, JSON.stringify(all, null, 2));
console.log('\n총', all.length, '벌 ->', path.relative(ROOT, OUTPUT));
