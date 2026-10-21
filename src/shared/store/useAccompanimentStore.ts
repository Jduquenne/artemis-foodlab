import { create } from "zustand";
import { Accompaniment, AccompanimentInput } from "../../core/domain/accompaniment";
import { createAccompaniment, deleteAccompaniment, updateAccompaniment } from "../../core/services/accompanimentService";
import { removeById, upsertById } from "../../core/utils/collectionUtils";
import { useProfileStore } from "./useProfileStore";
import { useRefreshStore } from "./useRefreshStore";

interface AccompanimentState {
  accompaniments: Accompaniment[];
  replaceAccompaniments: (accompaniments: Accompaniment[]) => void;
  createAccompaniment: (input: AccompanimentInput) => Promise<Accompaniment>;
  updateAccompaniment: (id: string, input: AccompanimentInput) => Promise<Accompaniment>;
  deleteAccompaniment: (id: string) => Promise<void>;
}

function afterServerCascade(accompaniments: Accompaniment[]): void {
  useProfileStore.getState().pruneAccompanimentDefaults(accompaniments);
  useRefreshStore.getState().bump();
}

export const useAccompanimentStore = create<AccompanimentState>((set, get) => ({
  accompaniments: [],
  replaceAccompaniments: (accompaniments) => set({ accompaniments }),
  createAccompaniment: async (input) => {
    const created = await createAccompaniment(input);
    set({ accompaniments: upsertById(get().accompaniments, created) });
    return created;
  },
  updateAccompaniment: async (id, input) => {
    const updated = await updateAccompaniment(id, input);
    const accompaniments = upsertById(get().accompaniments, updated);
    set({ accompaniments });
    afterServerCascade(accompaniments);
    return updated;
  },
  deleteAccompaniment: async (id) => {
    await deleteAccompaniment(id);
    const accompaniments = removeById(get().accompaniments, id);
    set({ accompaniments });
    afterServerCascade(accompaniments);
  },
}));
