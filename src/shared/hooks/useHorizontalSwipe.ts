import { useRef } from "react";
import type { TouchEvent } from "react";

const MIN_SWIPE_DISTANCE = 50;

export type SwipeDirection = "left" | "right";

export function useHorizontalSwipe(onSwipe: (direction: SwipeDirection) => void) {
  const start = useRef<{ x: number; y: number } | null>(null);

  const onTouchStart = (e: TouchEvent) => {
    start.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const onTouchEnd = (e: TouchEvent) => {
    if (!start.current) return;
    const dx = e.changedTouches[0].clientX - start.current.x;
    const dy = e.changedTouches[0].clientY - start.current.y;
    start.current = null;
    if (Math.abs(dx) < MIN_SWIPE_DISTANCE || Math.abs(dy) > Math.abs(dx)) return;
    onSwipe(dx < 0 ? "left" : "right");
  };

  return { onTouchStart, onTouchEnd };
}
