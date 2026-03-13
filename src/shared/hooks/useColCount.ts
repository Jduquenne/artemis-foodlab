import { useState, useEffect } from 'react';

function computeCols(): number {
  if (window.innerWidth >= 1280) return 4;
  if (window.innerWidth >= 1024) return 3;
  if (window.innerWidth >= 768) return 2;
  return 1;
}

export function useColCount(): number {
  const [cols, setCols] = useState(computeCols);
  useEffect(() => {
    const handler = () => setCols(computeCols());
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return cols;
}
