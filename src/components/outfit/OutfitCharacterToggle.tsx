import { redMoonCharacters } from '../../data/characters';
import type { CharacterId } from '../../types/card';

interface OutfitCharacterToggleProps {
  characterId: CharacterId;
  onChange: (characterId: CharacterId) => void;
}

/** 한 번에 한 명만 고른다. "카드 그리드"의 개화 전/개화 후 와 같은 모양 */
export function OutfitCharacterToggle({ characterId, onChange }: OutfitCharacterToggleProps) {
  return (
    <div className="flex gap-1 rounded-full border border-[var(--color-border)] bg-[var(--color-card)] p-1">
      {redMoonCharacters.map((character) => (
        <button
          key={character.id}
          type="button"
          aria-pressed={characterId === character.id}
          onClick={() => onChange(character.id)}
          className={`cursor-pointer rounded-full px-3 py-1 text-sm font-medium whitespace-nowrap transition-colors ${
            characterId === character.id
              ? 'bg-[var(--color-gold)] text-white'
              : 'text-[var(--color-text-sub)] hover:text-[var(--color-text)]'
          }`}
        >
          {character.name}
        </button>
      ))}
    </div>
  );
}
