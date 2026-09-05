import { useEffect } from 'react';
import type { RefObject } from 'react';

/** active일 때만 감시하고, ref 바깥을 클릭하면 onOutside를 호출한다. */
export function useClickOutside<T extends HTMLElement>(
  ref: RefObject<T | null>,
  onOutside: () => void,
  active: boolean,
) {
  useEffect(() => {
    if (!active) return;

    function handleClick(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onOutside();
      }
    }

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [active, onOutside, ref]);
}
