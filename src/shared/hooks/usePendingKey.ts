import { usePendingStore } from "../store/usePendingStore";

export function usePendingKey(key: string): boolean {
  return usePendingStore((s) => s.keys.has(key));
}
