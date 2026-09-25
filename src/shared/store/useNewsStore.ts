import { create } from "zustand";
import { persist } from "zustand/middleware";
import { subscribeCatalogue } from "../../core/catalogue/catalogueEvents";
import { typedRecipesDb } from "../../core/catalogue/typedRecipesDb";
import { getNewsGroups, latestNewsDate } from "../../core/logic/news/newsLogic";

interface NewsStore {
  lastSeenDate: string;
  hasNew: boolean;
  syncHasNew: () => void;
  markAsSeen: () => void;
}

export const useNewsStore = create<NewsStore>()(
  persist(
    (set, get) => ({
      lastSeenDate: "",
      hasNew: false,
      syncHasNew: () => {
        const latest = latestNewsDate(getNewsGroups(typedRecipesDb));
        set({ hasNew: latest !== "" && latest > get().lastSeenDate });
      },
      markAsSeen: () => {
        const latest = latestNewsDate(getNewsGroups(typedRecipesDb));
        set({ lastSeenDate: latest || get().lastSeenDate, hasNew: false });
      },
    }),
    {
      name: "cipe_news_last_seen",
      partialize: (state) => ({ lastSeenDate: state.lastSeenDate }),
    }
  )
);

subscribeCatalogue(() => useNewsStore.getState().syncHasNew());
