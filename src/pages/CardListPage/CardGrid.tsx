import type { GridSection } from '../../lib/gridSections';
import type { Card, Character } from '../../types/card';
import type { BloomMode } from '../../components/card/BloomToggle';
import { CardCell } from '../../components/card/CardCell';

interface CardGridProps {
  sections: GridSection[];
  characters: Character[];
  bloomMode: BloomMode;
  showName: boolean;
  showFullName: boolean;
  showDate: boolean;
  showSkill: boolean;
  onSelectCard: (card: Card) => void;
}

/** 헤더와 섹션마다 별도로 그리는 미니 그리드들의 열 너비를 고정폭으로 맞춰 전체가 정렬되도록 함. 가장 긴 행 제목("MainStory 3차")이 겨우 들어가는 선에서 최대한 좁힘 */
const LABEL_COLUMN_WIDTH = '120px';

/** 한 캐릭터 칸에 카드가 몰릴 때 가로로 최대 2개씩만 배치하고 나머지는 아래줄로 내림 */
function chunkPairs<T>(items: T[]): T[][] {
  const pairs: T[][] = [];
  for (let i = 0; i < items.length; i += 2) {
    pairs.push(items.slice(i, i + 2));
  }
  return pairs;
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
}: CardGridProps) {
  if (sections.length === 0) {
    return <p className="p-6 text-center text-sm text-[var(--color-text-sub)]">표시할 카드가 없습니다.</p>;
  }

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
                        <CardCell
                          card={null}
                          character={characters[index]}
                          bloomMode={bloomMode}
                          showName={showName}
                          showFullName={showFullName}
                          showDate={showDate}
                          showSkill={showSkill}
                          onSelect={onSelectCard}
                        />
                      ) : (
                        chunkPairs(cardsForChar).map((pair, pairIndex) => (
                          // CardCell이 이미 이미지 양옆에 여백을 갖고 있어서 gap 없이도 카드가 붙어 보이지 않는다.
                          // items-start여야 카드명이 두 줄로 늘어나도 옆 카드의 썸네일이 아래로 밀리지 않는다.
                          <div key={pairIndex} className="flex items-start justify-center">
                            {pair.map((card) => (
                              <CardCell
                                key={card.id}
                                card={card}
                                character={characters[index]}
                                bloomMode={bloomMode}
                                showName={showName}
                                showFullName={showFullName}
                                showDate={showDate}
                                showSkill={showSkill}
                                onSelect={onSelectCard}
                              />
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
