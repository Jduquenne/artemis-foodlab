import { usePendingStore } from "../store/usePendingStore";

export async function withPending<T>(key: string | string[], task: () => Promise<T>): Promise<T | undefined> {
  const keys = Array.isArray(key) ? key : [key];
  const { keys: active, begin, end } = usePendingStore.getState();
  if (keys.some((k) => active.has(k))) return undefined;
  keys.forEach(begin);
  try {
    return await task();
  } finally {
    keys.forEach(end);
  }
}
