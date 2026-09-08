import { useState, useEffect } from 'react';

function computeFreezerCols(): number {
  return window.innerWidth >= 900 ? 2 : 1;
}

export function useFreezerColCount(): number {
  const [cols, setCols] = useState(computeFreezerCols);
  useEffect(() => {
    const handler = () => setCols(computeFreezerCols());
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return cols;
}
