import { create } from "zustand";
import { persist } from "zustand/middleware";

interface FreezerStore {
  freezerName: string;
  setFreezerName: (name: string) => void;
}

export const useFreezerStore = create<FreezerStore>()(
  persist(
    (set) => ({
      freezerName: "Mon Congélateur",
      setFreezerName: (name) => set({ freezerName: name }),
    }),
    { name: "cipe_freezer" }
  )
);
