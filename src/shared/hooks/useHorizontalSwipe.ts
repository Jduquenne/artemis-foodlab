import { useRef } from "react";
import type { TouchEvent } from "react";

const MIN_SWIPE_DISTANCE = 50;

export type SwipeDirection = "left" | "right";

export function useHorizontalSwipe(onSwipe: (direction: SwipeDirection) => void) {
  const start = useRef<{ x: number; y: number } | null>(null);

  const onTouchStart = (e: TouchEvent) => {
    const touch = e.touches[0];
    start.current = touch ? { x: touch.clientX, y: touch.clientY } : null;
  };

  const onTouchEnd = (e: TouchEvent) => {
    const touch = e.changedTouches[0];
    if (!start.current || !touch) return;
    const dx = touch.clientX - start.current.x;
    const dy = touch.clientY - start.current.y;
    start.current = null;
    if (Math.abs(dx) < MIN_SWIPE_DISTANCE || Math.abs(dy) > Math.abs(dx)) return;
    onSwipe(dx < 0 ? "left" : "right");
  };

  return { onTouchStart, onTouchEnd };
}
