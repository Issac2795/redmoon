// 위키 카드 문서에서 "카드 이미지"(액자 포함 세로 그림)를 모아 scripts/card-images.json 으로 저장한다.
//   pnpm run cards:images
//
// 이미지 세 종류를 구분해서 쓴다.
//   썸네일 이미지 : 목록용 작은 정사각 아이콘 (..._Mini.png)
//   풀 이미지     : 가로로 긴 원화 (..._CG.png / ..._Frameless.png)
//   카드 이미지   : 게임 안에서 보이는 세로 카드 (여기서 모으는 것)
//
// 카드 이미지는 문서의 div.card-single.card-unbloomed / .card-bloomed 안에 들어 있다.
// 대상 카드는 엑셀의 썸네일 URL에서 문서 제목을 역산해 정한다(번역명과 무관하게 정확).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';
import XLSX from 'xlsx';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = path.join(ROOT, 'origin_data', 'data_file.xlsx');
const OUTPUT = path.join(ROOT, 'scripts', 'card-images.json');
const API = 'https://ensemble-stars.fandom.com/api.php';
const CONCURRENCY = 4;

const ENG_CHAR = {
  '하스미 케이토': 'Keito Hasumi',
  '키류 쿠로': 'Kuro Kiryu',
  '칸자키 소마': 'Souma Kanzaki',
  '타키 이부키': 'Ibuki Taki',
};

const rows = XLSX.utils.sheet_to_json(XLSX.readFile(SOURCE).Sheets['card_data'], { defval: '', header: 1 });

/** 썸네일 파일명 "(영문 카드명)_캐릭터_[M_]Mini.png" -> 위키 문서 제목 */
function pageTitleOf(thumbUrl, charKo) {
  const decoded = decodeURIComponent(String(thumbUrl).split('/revision')[0]);
  const file = decoded.slice(decoded.lastIndexOf('/') + 1);
  const m = file.match(/^(\(.+\))_(.+?)(?:_M)?_Mini\.png$/);
  if (!m || m[2].replace(/_/g, ' ') !== ENG_CHAR[charKo]) return null;
  return `${m[1].replace(/_/g, ' ')} ${ENG_CHAR[charKo]}`;
}

const targets = [];
for (let n = 2; n <= rows.length; n++) {
  const r = rows[n - 1];
  if (!r.some((v) => String(v).trim())) continue;
  const page = pageTitleOf(r[11], r[0]);
  if (!page) { console.log(`  ${n}행 ${r[0]}/${r[2]}: 문서 제목을 못 구함`); continue; }
  targets.push({ row: n, charKo: r[0], name: r[2], page });
}
console.log('대상 카드:', targets.length);

async function cardImages(page) {
  const url = `${API}?action=parse&page=${encodeURIComponent(page)}&prop=text&format=json&formatversion=2`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  if (json.error) return { error: json.error.code };
  const doc = new JSDOM(json.parse.text).window.document;
  // 썸네일로 축소된 주소가 섞여 있어 원본 크기로 되돌린다
  const pick = (selector) => {
    const img = doc.querySelector(`${selector} img`);
    if (!img) return '';
    const src = (img.getAttribute('data-src') || img.getAttribute('src') || '').split(' ')[0];
    return src.includes('ensemble-stars/images') ? src.replace(/\/scale-to-width-down\/\d+/, '') : '';
  };
  return { before: pick('.card-single.card-unbloomed'), after: pick('.card-single.card-bloomed') };
}

const out = [];
let done = 0;
for (let i = 0; i < targets.length; i += CONCURRENCY) {
  await Promise.all(targets.slice(i, i + CONCURRENCY).map(async (t) => {
    try {
      out.push({ ...t, ...(await cardImages(t.page)) });
    } catch (e) {
      out.push({ ...t, error: String(e.message) });
    }
    if (++done % 20 === 0) process.stdout.write(` ${done}`);
  }));
}
out.sort((a, b) => a.row - b.row);

const bad = out.filter((c) => c.error);
const missing = out.filter((c) => !c.error && (!c.before || !c.after));
console.log(`\n수집 ${out.length}장 | 오류 ${bad.length} | 둘 중 하나라도 없음 ${missing.length}`);
for (const c of bad) console.log(`  오류 ${c.row}행 ${c.name}: ${c.error}`);
for (const c of missing) console.log(`  누락 ${c.row}행 ${c.charKo}/${c.name}: 전=${c.before ? 'O' : '-'} 후=${c.after ? 'O' : '-'}`);

fs.writeFileSync(OUTPUT, JSON.stringify(out, null, 2));
console.log('->', path.relative(ROOT, OUTPUT));
