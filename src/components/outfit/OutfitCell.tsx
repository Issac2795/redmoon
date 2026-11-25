import type { Outfit } from '../../types/outfit';

interface OutfitCellProps {
  outfit: Outfit;
  open: boolean;
  onToggle: (id: string) => void;
}

export function OutfitCell({ outfit, open, onToggle }: OutfitCellProps) {
  const hasDetail = Boolean(outfit.description) || outfit.acquires.length > 0;

  return (
    // min-w-0 이 없으면 긴 설명이 칸을 밀어내 옆 칸까지 삐져나온다
    <div className="flex min-w-0 flex-col items-center gap-1">
      {/*
        옷 그림은 대부분 세로로 긴 5:8 이지만, 자료가 부족한 옷은 16:9 스크린샷이 들어 있다.
        object-cover + object-left 로 세로를 채우고 오른쪽만 잘라내, 왼쪽에 선 캐릭터가 남는다.
      */}
      {outfit.imageUrl ? (
        <img
          src={outfit.imageUrl}
          alt={outfit.name}
          loading="lazy"
          className="aspect-[5/8] w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] object-cover object-left"
        />
      ) : (
        <div className="flex aspect-[5/8] w-full items-center justify-center rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-bg)] px-2 text-center text-xs text-[var(--color-text-sub)]">
          그림 없음
        </div>
      )}

      <button
        type="button"
        onClick={() => onToggle(outfit.id)}
        aria-expanded={open}
        disabled={!hasDetail}
        title={outfit.name}
        className={`w-full rounded px-1 text-center text-xs leading-tight break-words ${
          hasDetail
            ? 'cursor-pointer text-[var(--color-text)] hover:text-[var(--color-brand)]'
            : 'cursor-default text-[var(--color-text-sub)]'
        }`}
      >
        {outfit.name}
        {/* ▾ 와 ▴ 는 같은 크기의 작은 삼각형 쌍이다(▲ 는 혼자 커 보인다) */}
        {hasDetail && <span className="ml-1 text-[var(--color-text-sub)]">{open ? '▴' : '▾'}</span>}
      </button>

      {open && hasDetail && (
        <div className="w-full min-w-0 space-y-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-2 text-left text-xs">
          {outfit.description && (
            <p className="leading-relaxed break-words text-[var(--color-text)]">{outfit.description}</p>
          )}
          {/* 얻는 방법은 구분선만으로 충분하다. 머리글을 두면 좁은 칸에서 자리만 차지한다 */}
          {outfit.acquires.length > 0 && (
            <div className={outfit.description ? 'border-t border-[var(--color-border)] pt-2' : ''}>
              <ul className="space-y-0.5">
                {outfit.acquires.map((a) => (
                  <li key={`${a.cardName ?? ''}|${a.text}`} className="break-words text-[var(--color-text)]">
                    ·{' '}
                    {a.cardName && (
                      // 나중에 이 카드로 이동시킬 자리라 밑줄로 눈에 띄게 둔다
                      <span className="underline decoration-dotted underline-offset-2">{a.cardName}</span>
                    )}
                    {a.cardName ? ' ' : ''}
                    {a.text}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
