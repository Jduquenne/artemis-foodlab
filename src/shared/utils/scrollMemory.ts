export interface ScrollMemoryEntry {
  top: number;
  visibleCount: number;
}

const memory = new Map<string, ScrollMemoryEntry>();

export const getScrollMemory = (key: string): ScrollMemoryEntry | undefined =>
  memory.get(key);

export const saveScrollMemory = (
  key: string,
  patch: Partial<ScrollMemoryEntry>,
): void => {
  const current = memory.get(key) ?? { top: 0, visibleCount: 0 };
  memory.set(key, { ...current, ...patch });
};
