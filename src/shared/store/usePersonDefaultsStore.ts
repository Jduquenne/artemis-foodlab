import { create } from "zustand";
import { PersonDefault } from "../../core/domain/personDefaults";
import { savePersonDefaults } from "../../core/services/personDefaultsService";

interface PersonDefaultsState {
  defaults: PersonDefault[];
  replaceDefaults: (defaults: PersonDefault[]) => void;
  saveDefaults: (defaults: PersonDefault[]) => Promise<void>;
}

export const usePersonDefaultsStore = create<PersonDefaultsState>((set) => ({
  defaults: [],
  replaceDefaults: (defaults) => set({ defaults }),
  saveDefaults: async (defaults) => {
    set({ defaults: await savePersonDefaults(defaults) });
  },
}));
