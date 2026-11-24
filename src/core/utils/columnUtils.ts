export function distributeToColumns<T>(items: T[], getHeight: (item: T) => number, colCount: number): T[][] {
  if (colCount <= 1) return [items];
  const cols: { items: T[]; height: number }[] = Array.from({ length: colCount }, () => ({ items: [], height: 0 }));
  const sorted = [...items].sort((a, b) => getHeight(b) - getHeight(a));
  for (const item of sorted) {
    const lowest = cols.reduce((min, col) => (col.height < min.height ? col : min));
    lowest.items.push(item);
    lowest.height += getHeight(item);
  }
  return cols.map((col) => col.items);
}
