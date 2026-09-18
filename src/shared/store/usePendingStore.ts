import { create } from "zustand";

interface PendingState {
  keys: Set<string>;
  begin: (key: string) => void;
  end: (key: string) => void;
}

export const usePendingStore = create<PendingState>((set) => ({
  keys: new Set(),
  begin: (key) =>
    set((s) => {
      const next = new Set(s.keys);
      next.add(key);
      return { keys: next };
    }),
  end: (key) =>
    set((s) => {
      if (!s.keys.has(key)) return s;
      const next = new Set(s.keys);
      next.delete(key);
      return { keys: next };
    }),
}));
