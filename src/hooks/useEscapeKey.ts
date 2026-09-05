import { useEffect } from 'react';

/** active일 때만 감시하고, Esc 키를 누르면 onEscape를 호출한다. */
export function useEscapeKey(onEscape: () => void, active: boolean) {
  useEffect(() => {
    if (!active) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onEscape();
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [active, onEscape]);
}
