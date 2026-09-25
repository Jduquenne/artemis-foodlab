import { create } from "zustand";

interface RefreshState {
  tick: number;
  bump: () => void;
}

export const useRefreshStore = create<RefreshState>((set) => ({
  tick: 0,
  bump: () => set((s) => ({ tick: s.tick + 1 })),
}));
