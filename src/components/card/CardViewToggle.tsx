import type { CardCellVariant } from './CardCell';

const VIEW_LABEL: Record<CardCellVariant, string> = {
  thumbnail: '카드로 보기',
  card: '썸네일로 보기',
};

interface CardViewToggleProps {
  variant: CardCellVariant;
  onChange: (variant: CardCellVariant) => void;
}

/** 썸네일 ↔ 카드 이미지 전환. 버튼 문구는 "지금 누르면 바뀌는 모습"을 가리킨다 */
export function CardViewToggle({ variant, onChange }: CardViewToggleProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(variant === 'thumbnail' ? 'card' : 'thumbnail')}
      className="cursor-pointer rounded-full border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-1.5 text-sm font-medium whitespace-nowrap text-[var(--color-text-sub)] transition-colors hover:border-[var(--color-gold)] hover:text-[var(--color-text)]"
    >
      {VIEW_LABEL[variant]}
    </button>
  );
}
