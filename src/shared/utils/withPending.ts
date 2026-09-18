import { usePendingStore } from "../store/usePendingStore";

export async function withPending<T>(key: string, task: () => Promise<T>): Promise<T | undefined> {
  const { keys, begin, end } = usePendingStore.getState();
  if (keys.has(key)) return undefined;
  begin(key);
  try {
    return await task();
  } finally {
    end(key);
  }
}
