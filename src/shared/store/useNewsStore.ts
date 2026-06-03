import { create } from "zustand";
import { persist } from "zustand/middleware";
import { typedChangelogDb } from "../../core/typed-db/typedChangelogDb";

interface NewsStore {
  lastSeenDate: string;
  hasNew: boolean;
  markAsSeen: () => void;
}

export const useNewsStore = create<NewsStore>()(
  persist(
    (set) => ({
      lastSeenDate: "",
      hasNew: typedChangelogDb.length > 0 && typedChangelogDb[0].date > "",
      markAsSeen: () => {
        const date = typedChangelogDb[0]?.date ?? "";
        set({ lastSeenDate: date, hasNew: false });
      },
    }),
    {
      name: "cipe_news_last_seen",
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const latest = typedChangelogDb[0]?.date ?? "";
        state.hasNew = latest > state.lastSeenDate;
      },
    }
  )
);
