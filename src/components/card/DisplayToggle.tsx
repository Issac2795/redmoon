export interface DisplayState {
  name: boolean;
  /** 카드명을 줄임표 없이 전문으로 표시. name이 켜져 있을 때만 의미가 있다 */
  fullName: boolean;
  date: boolean;
  skill: boolean;
}

interface DisplayToggleProps {
  display: DisplayState;
  onChange: (display: DisplayState) => void;
  /** 그리드 화면처럼 서포트 스킬 표시가 필요 없는 곳에서는 끈다 */
  showSkillToggle?: boolean;
}

const CHECKBOX_CLASS = 'origin-left scale-150 cursor-pointer accent-[var(--color-brand)]';

export function DisplayToggle({ display, onChange, showSkillToggle = true }: DisplayToggleProps) {
  return (
    <div className="flex gap-4 text-sm text-[var(--color-text)]">
      <div className="flex items-center gap-3">
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={display.name}
            onChange={() => onChange({ ...display, name: !display.name })}
            className={CHECKBOX_CLASS}
          />
          카드명
        </label>
        {display.name && (
          <label className="flex cursor-pointer items-center gap-2 text-[var(--color-text-sub)]">
            <input
              type="checkbox"
              checked={display.fullName}
              onChange={() => onChange({ ...display, fullName: !display.fullName })}
              className={CHECKBOX_CLASS}
            />
            전체
          </label>
        )}
      </div>
      <label className="flex cursor-pointer items-center gap-2">
        <input
          type="checkbox"
          checked={display.date}
          onChange={() => onChange({ ...display, date: !display.date })}
          className={CHECKBOX_CLASS}
        />
        날짜
      </label>
      {showSkillToggle && (
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={display.skill}
            onChange={() => onChange({ ...display, skill: !display.skill })}
            className={CHECKBOX_CLASS}
          />
          서포트 스킬
        </label>
      )}
    </div>
  );
}
