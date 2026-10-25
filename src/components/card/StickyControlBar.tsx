import type { ReactNode } from 'react';

interface StickyControlBarProps {
  children: ReactNode;
}

/**
 * 카드를 내려보다가 조작하러 맨 위로 올라가지 않도록, 조작 줄만 화면 위에 붙여둔다.
 * 좌우 -mx-4 px-4 는 배경이 컨테이너 안쪽 여백까지 덮어 카드가 옆으로 비쳐 보이지 않게 한다.
 * z-20 은 카드 그리드보다 위, 상세 모달(z-50)보다 아래.
 */
export function StickyControlBar({ children }: StickyControlBarProps) {
  return (
    <div className="sticky top-0 z-20 -mx-4 flex flex-wrap items-center justify-between gap-2 border-b border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2">
      {children}
    </div>
  );
}
