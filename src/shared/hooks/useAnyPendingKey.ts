import { usePendingStore } from "../store/usePendingStore";

export function useAnyPendingKey(keys: string[]): boolean {
  return usePendingStore((s) => keys.some((k) => s.keys.has(k)));
}
