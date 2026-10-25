import { STAGE_LABEL, toggleStage } from './bloom';
import type { BloomMode, BloomStage } from './bloom';

const OPTIONS: BloomStage[] = ['before', 'after'];

interface BloomToggleProps {
  mode: BloomMode;
  onChange: (mode: BloomMode) => void;
}

/** 개화 전·후를 각각 켜고 끈다. 둘 다 끄는 건 막혀 있어 최소 하나는 늘 켜져 있다 */
export function BloomToggle({ mode, onChange }: BloomToggleProps) {
  return (
    <div className="flex gap-1 rounded-full border border-[var(--color-border)] bg-[var(--color-card)] p-1">
      {OPTIONS.map((stage) => {
        const on = mode === 'both' || mode === stage;
        // 하나만 켜져 있을 때 그걸 또 누르면 아무 일도 없다는 걸 커서와 설명으로 알린다
        const isLastOn = on && mode !== 'both';
        return (
          <button
            key={stage}
            type="button"
            aria-pressed={on}
            title={isLastOn ? '개화 전·후 중 하나는 반드시 켜져 있어야 합니다' : undefined}
            onClick={() => onChange(toggleStage(mode, stage))}
            className={`rounded-full px-3 py-1 text-sm font-medium whitespace-nowrap transition-colors ${
              isLastOn ? 'cursor-default' : 'cursor-pointer'
            } ${on ? 'bg-[var(--color-gold)] text-white' : 'text-[var(--color-text-sub)] hover:text-[var(--color-text)]'}`}
          >
            {STAGE_LABEL[stage]}
          </button>
        );
      })}
    </div>
  );
}
