import { useCallback, useLayoutEffect, useRef, useState } from "react";
import {
  getScrollMemory,
  saveScrollMemory,
} from "../utils/scrollMemory";

export const useScrollRestore = (key: string) => {
  const ref = useRef<HTMLDivElement>(null);
  const [initial] = useState(() => getScrollMemory(key));

  useLayoutEffect(() => {
    if (ref.current && initial) ref.current.scrollTop = initial.top;
  }, [initial]);

  const onScroll = useCallback(() => {
    if (ref.current) saveScrollMemory(key, { top: ref.current.scrollTop });
  }, [key]);

  const saveVisibleCount = useCallback(
    (visibleCount: number) => saveScrollMemory(key, { visibleCount }),
    [key],
  );

  return { ref, initial, onScroll, saveVisibleCount };
};
