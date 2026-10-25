import type { GridSection } from '../../lib/gridSections';
import type { Card, Character } from '../../types/card';
import type { BloomMode, BloomStage } from '../../components/card/bloom';
import { CardCell } from '../../components/card/CardCell';
import type { CardCellVariant } from '../../components/card/CardCell';

interface CardGridProps {
  sections: GridSection[];
  characters: Character[];
  bloomMode: BloomMode;
  showName: boolean;
  showFullName: boolean;
  showDate: boolean;
  showSkill: boolean;
  onSelectCard: (card: Card, stage: BloomStage) => void;
  variant: CardCellVariant;
}

/** 헤더와 섹션마다 별도로 그리는 미니 그리드들의 열 너비를 고정폭으로 맞춰 전체가 정렬되도록 함. 가장 긴 행 제목("MainStory 3차")이 겨우 들어가는 선에서 최대한 좁힘 */
const LABEL_COLUMN_WIDTH = '120px';

/**
 * 카드 이미지는 세로로 길어 칸을 가득 채우면 한 캐릭터 칸에 2장이 들어갈 때마다 크기가 달라진다.
 * 썸네일 칸과 같은 86px로 묶어, 카드가 몇 장이든 표의 열 너비와 카드 크기가 일정하게 유지된다.
 */
const CARD_WIDTH_CLASS: Record<CardCellVariant, Record<'single' | 'both', string>> = {
  thumbnail: { single: '', both: '' },
  card: { single: 'w-[86px]', both: 'w-[172px]' },
};

/**
 * 한 캐릭터 칸에 카드가 몰릴 때 가로로 몇 장까지 둘지.
 * 개화 전·후를 같이 켜면 카드 한 장이 두 배로 넓어져, 두 장을 나란히 두면 열을 넘친다.
 */
function cardsPerRow(bloomMode: BloomMode): number {
  return bloomMode === 'both' ? 1 : 2;
}

/** 한 칸에 가로로 perRow개씩 배치하고 나머지는 아래줄로 내림 */
function chunkCards<T>(items: T[], perRow: number): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += perRow) {
    rows.push(items.slice(i, i + perRow));
  }
  return rows;
}

export function CardGrid({
  sections,
  characters,
  bloomMode,
  showName,
  showFullName,
  showDate,
  showSkill,
  onSelectCard,
  variant,
}: CardGridProps) {
  if (sections.length === 0) {
    return <p className="p-6 text-center text-sm text-[var(--color-text-sub)]">표시할 카드가 없습니다.</p>;
  }

  const sizeKey = bloomMode === 'both' ? 'both' : 'single';
  const widthClass = CARD_WIDTH_CLASS[variant][sizeKey];
  const perRow = cardsPerRow(bloomMode);

  const columnTemplate = `${LABEL_COLUMN_WIDTH} repeat(${characters.length}, 1fr)`;

  return (
    <div className="space-y-4">
      <div
        className="grid overflow-hidden rounded-xl border border-[var(--color-border)]"
        style={{ gridTemplateColumns: columnTemplate }}
      >
        <div className="p-2" />
        {characters.map((character) => (
          <div key={character.id} className="p-2 text-center">
            <span className="inline-block border-[var(--color-gold)] text-sm font-medium text-[var(--color-text)]">
              {character.name}
            </span>
          </div>
        ))}
      </div>

      {sections.map((section) => (
        <div key={section.title} className="overflow-hidden rounded-xl border border-[var(--color-border)]">
          <div className="border-b border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-1.5 text-xs font-semibold text-[var(--color-brand)]">
            {section.title}
          </div>
          <div className="grid" style={{ gridTemplateColumns: columnTemplate }}>
            {section.rows.map((row, rowIndex) => {
              const isLastRow = rowIndex === section.rows.length - 1;
              const borderClass = isLastRow ? '' : 'border-b border-[var(--color-border)]';
              return (
                <div key={`${row.rowLabel}-${rowIndex}`} className="contents">
                  <div
                    className={`flex items-center border-l-4 border-l-[var(--color-brand)] px-3 text-sm whitespace-nowrap text-[var(--color-text)] ${borderClass}`}
                  >
                    {row.rowLabel}
                  </div>
                  {row.cardsByCharacter.map((cardsForChar, index) => (
                    <div
                      key={characters[index].id}
                      className={`min-w-0 flex flex-col items-center justify-center gap-1 py-1 ${borderClass}`}
                    >
                      {cardsForChar.length === 0 ? (
                        <div className={widthClass}>
                          <CardCell
                            card={null}
                            character={characters[index]}
                            bloomMode={bloomMode}
                            showName={showName}
                            showFullName={showFullName}
                            showDate={showDate}
                            showSkill={showSkill}
                            onSelect={onSelectCard}
                            variant={variant}
                          />
                        </div>
                      ) : (
                        chunkCards(cardsForChar, perRow).map((row2, rowIdx2) => (
                          // CardCell이 이미 이미지 양옆에 여백을 갖고 있어서 gap 없이도 카드가 붙어 보이지 않는다.
                          // items-start여야 카드명이 두 줄로 늘어나도 옆 카드의 썸네일이 아래로 밀리지 않는다.
                          <div key={rowIdx2} className="flex items-start justify-center">
                            {row2.map((card) => (
                              <div key={card.id} className={widthClass}>
                                <CardCell
                                  card={card}
                                  character={characters[index]}
                                  bloomMode={bloomMode}
                                  showName={showName}
                                  showFullName={showFullName}
                                  showDate={showDate}
                                  showSkill={showSkill}
                                  onSelect={onSelectCard}
                                  variant={variant}
                                />
                              </div>
                            ))}
                          </div>
                        ))
                      )}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
