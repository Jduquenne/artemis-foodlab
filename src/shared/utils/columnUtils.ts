export function distributeToColumns<T>(items: T[], getHeight: (item: T) => number, colCount: number): T[][] {
  if (colCount <= 1) return [items];
  const cols: T[][] = Array.from({ length: colCount }, () => []);
  const heights = new Array<number>(colCount).fill(0);
  const sorted = [...items].sort((a, b) => getHeight(b) - getHeight(a));
  for (const item of sorted) {
    const minIdx = heights.indexOf(Math.min(...heights));
    cols[minIdx].push(item);
    heights[minIdx] += getHeight(item);
  }
  return cols;
}
