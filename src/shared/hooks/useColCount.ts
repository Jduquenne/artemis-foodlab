import { useState, useEffect } from 'react';

export interface ColBreakpoint {
  minWidth: number;
  cols: number;
}

function computeCols(breakpoints: readonly ColBreakpoint[]): number {
  return breakpoints.find((breakpoint) => window.innerWidth >= breakpoint.minWidth)?.cols ?? 1;
}

export function useColCount(breakpoints: readonly ColBreakpoint[]): number {
  const [cols, setCols] = useState(() => computeCols(breakpoints));
  useEffect(() => {
    const handler = () => setCols(computeCols(breakpoints));
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, [breakpoints]);
  return cols;
}
