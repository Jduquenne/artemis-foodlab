import { useEffect, useLayoutEffect, useRef, useState } from "react";

const EDGE_ZONE_WIDTH = 72;
const EDGE_HOLD_MS = 1000;

export type WeekNavDirection = "prev" | "next";

export function useDragEdgeWeekNav(active: boolean, onChangeWeek: (offset: -1 | 1) => void): WeekNavDirection | null {
  const [zone, setZone] = useState<WeekNavDirection | null>(null);
  const onChangeWeekRef = useRef(onChangeWeek);

  useLayoutEffect(() => {
    onChangeWeekRef.current = onChangeWeek;
  });

  useEffect(() => {
    if (!active) return;
    const handlePointerMove = (e: PointerEvent) => {
      if (e.clientX < EDGE_ZONE_WIDTH) setZone("prev");
      else if (e.clientX > window.innerWidth - EDGE_ZONE_WIDTH) setZone("next");
      else setZone(null);
    };
    window.addEventListener("pointermove", handlePointerMove);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      setZone(null);
    };
  }, [active]);

  useEffect(() => {
    if (!zone) return;
    const timer = setTimeout(() => {
      onChangeWeekRef.current(zone === "prev" ? -1 : 1);
      setZone(null);
    }, EDGE_HOLD_MS);
    return () => clearTimeout(timer);
  }, [zone]);

  return zone;
}
