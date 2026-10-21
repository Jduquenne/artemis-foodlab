export function sumBy<T>(items: readonly T[], value: (item: T) => number): number {
  return items.reduce((sum, item) => sum + value(item), 0);
}

export function countBy<T>(items: readonly T[], key: (item: T) => string): Map<string, number> {
  const counts = new Map<string, number>();
  for (const item of items) {
    const k = key(item);
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  return counts;
}

export function groupBy<T, K>(items: readonly T[], key: (item: T) => K): Map<K, T[]> {
  const groups = new Map<K, T[]>();
  for (const item of items) {
    const k = key(item);
    const group = groups.get(k);
    if (group) group.push(item);
    else groups.set(k, [item]);
  }
  return groups;
}

export function toggleInList<T>(list: readonly T[], item: T): T[] {
  return list.includes(item) ? list.filter((entry) => entry !== item) : [...list, item];
}

export function omitKey<T>(record: Record<string, T>, key: string): Record<string, T> {
  if (!(key in record)) return record;
  return Object.fromEntries(Object.entries(record).filter(([k]) => k !== key));
}

export function withRecordList<T>(
  record: Record<string, T[]> | undefined,
  key: string,
  list: T[],
): Record<string, T[]> | undefined {
  const next = { ...record };
  if (list.length > 0) next[key] = list;
  else delete next[key];
  return Object.keys(next).length > 0 ? next : undefined;
}

export function pickRecordLists<T>(
  sources: readonly (Record<string, T[]> | undefined)[],
  keys: readonly string[],
): Record<string, T[]> | undefined {
  const picked: Record<string, T[]> = {};
  for (const key of keys) {
    const found = sources.find((source) => source?.[key]?.length)?.[key];
    if (found) picked[key] = found;
  }
  return Object.keys(picked).length > 0 ? picked : undefined;
}

export function upsertById<T extends { id: string }>(items: readonly T[], item: T): T[] {
  return items.some((existing) => existing.id === item.id)
    ? items.map((existing) => (existing.id === item.id ? item : existing))
    : [...items, item];
}

export function removeById<T extends { id: string }>(items: readonly T[], id: string): T[] {
  return items.filter((item) => item.id !== id);
}

export function setEnabledById<T extends { id: string; enabled: boolean }>(items: readonly T[], id: string, enabled: boolean): T[] {
  return items.map((item) => (item.id === id ? { ...item, enabled } : item));
}
