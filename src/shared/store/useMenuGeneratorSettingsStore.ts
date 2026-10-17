import { create } from "zustand";
import { persist } from "zustand/middleware";
import { SavedGeneratorSettings } from "../../core/domain/menuGenerator";

interface MenuGeneratorSettingsState {
  saved: Partial<SavedGeneratorSettings> | null;
  save: (settings: SavedGeneratorSettings) => void;
  clear: () => void;
}

export const useMenuGeneratorSettingsStore = create<MenuGeneratorSettingsState>()(
  persist(
    (set) => ({
      saved: null,
      save: (settings) => set({ saved: settings }),
      clear: () => set({ saved: null }),
    }),
    { name: "cipe_menu_generator_settings", version: 1 }
  )
);
