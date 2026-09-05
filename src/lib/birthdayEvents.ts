import { characters } from '../data/characters';
import type { BirthdayEvent } from '../types/calendar';

/** characters.ts의 birthday('MM-DD')를 기준으로 해당 연도들의 생일 이벤트를 만들어낸다. */
export function getBirthdayEvents(years: number[]): BirthdayEvent[] {
  const events: BirthdayEvent[] = [];
  for (const year of years) {
    for (const character of characters) {
      if (!character.birthday) continue;
      events.push({
        id: `bday-${character.id}-${year}`,
        category: '생일',
        startDate: `${year}-${character.birthday}`,
        characterId: character.id,
      });
    }
  }
  return events;
}
