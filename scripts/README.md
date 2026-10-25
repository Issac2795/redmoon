# scripts

카드 데이터의 원본은 `origin_data/data_file.xlsx` 의 `card_data` 시트이고,
`src/data/cards.ts` 는 거기서 **생성되는** 파일이다. cards.ts 를 직접 고치지 말고 엑셀을 고친 뒤 다시 생성한다.

```
origin_data/data_file.xlsx  --(pnpm run cards)-->  src/data/cards.ts
```

## 명령

| 명령 | 하는 일 |
| --- | --- |
| `pnpm run cards` | 엑셀을 읽어 `src/data/cards.ts` 를 덮어쓴다 |
| `pnpm run cards:dry` | 쓰지 않고 카드 수·일련번호만 확인한다 |
| `pnpm run cards:check` | id가 유일한지, 라벨이 빈 행이 있는지 점검한다 |
| `pnpm run cards:scrape` | 위키에서 3성 카드 정보를 모아 `scripts/scraped-cards.json` 에 저장한다 |

생성 후에는 `pnpm run build` 로 타입까지 확인한다. 덮어쓴 결과는 `git diff src/data/cards.ts` 로 검토하면 된다.

## 작업 순서

1. 엑셀을 **닫는다**. 열려 있으면 쓰기가 막힌다(`EBUSY`).
2. 엑셀에 카드를 추가하고 라벨·차수까지 채운다.
3. `pnpm run cards:check` — id 중복과 라벨 공란을 먼저 잡는다.
4. `pnpm run cards` → `pnpm run build`.

## 카드 id

`캐릭터-레어도-라벨-발매일` 형식이다. 차수(stage)는 표시용 그룹핑 값이라 카드끼리 겹칠 수 있어 id에 쓰지 않는다.
같은 날 같은 라벨로 여러 장이 나온 경우에만 시트 순서대로 `-1`, `-2` 가 붙는다
(예: 앙스타! 초기 `! 통상` 3장 → `keito-3-! 통상-2015-04-28-1` ~ `-3`).

라벨이나 발매일을 고치면 그 카드의 id가 바뀐다는 점만 유의한다.

## 위키 스크래퍼

`scripts/scrape-wiki-cards.js` 는 ensemble-stars.fandom.com 의 `api.php`(MediaWiki 가 공식 제공하는 조회 경로)를 쓴다.
이름 일부만 넘기면 그 캐릭터만 돈다.

```
pnpm run cards:scrape -- 쿠로 소마
```

결과 JSON 은 엑셀에 직접 쓰지 않고 확인용으로만 남는다(엑셀 기입은 수동 또는 별도 작업).
필드별 기입 규칙은 스크립트 상단 주석에 적어두었다.
한국어 카드명이 위키에 없으면 일본어, 그것도 없으면 영어명을 쓴다(`nameSource` 로 구분).
대사는 일본어일 때만 `quoteBeforeOriginal`/`quoteAfterOriginal` 에 들어가고,
영어뿐이면 `nonJa1`/`nonJa2` 에 남으므로 따로 확인해야 한다.
