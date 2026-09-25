import { create } from "zustand";
import { persist } from "zustand/middleware";
import { subscribeCatalogue } from "../../core/catalogue/catalogueEvents";
import { recipesCatalogue } from "../../core/catalogue/recipes";
import { outdoorCatalogue } from "../../core/catalogue/outdoor";
import { collectAssetKeys, refreshDelayMs } from "../../core/logic/media/mediaLogic";
import { resolveMediaKeys } from "../../core/services/mediaService";
import { useAuthStore } from "./useAuthStore";

interface MediaStore {
  overrides: Record<string, string>;
  expiresAt: string | null;
  resolveCatalogue: () => void;
  resolveKeys: (keys: string[]) => Promise<void>;
  reportFailure: (key: string | undefined) => void;
}

const CATALOGUE_THROTTLE_MS = 3000;
const FAILURE_FLUSH_MS = 80;

const dead = new Set<string>();
let failed = new Set<string>();
let failureFlush: ReturnType<typeof setTimeout> | null = null;
let refreshTimer: ReturnType<typeof setTimeout> | null = null;
let lastCatalogueResolve = 0;
let pendingResolve: ReturnType<typeof setTimeout> | null = null;

function armRefreshTimer(expiresAt: string, onDue: () => void): void {
  if (refreshTimer) clearTimeout(refreshTimer);
  refreshTimer = setTimeout(onDue, refreshDelayMs(expiresAt));
}

export const useMediaStore = create<MediaStore>()(
  persist(
    (set, get) => ({
      overrides: {},
      expiresAt: null,

      resolveKeys: async (keys) => {
        const { overrides } = get();
        const wanted = [...new Set(keys)].filter((key) => key && !dead.has(key) && !(key in overrides));
        if (wanted.length === 0) return;

        const { urls, expiresAt, attemptedKeys } = await resolveMediaKeys(wanted);

        for (const key of attemptedKeys) {
          if (!(key in urls)) dead.add(key);
        }

        if (Object.keys(urls).length > 0 || expiresAt) {
          set((state) => ({
            overrides: { ...state.overrides, ...urls },
            expiresAt: expiresAt ?? state.expiresAt,
          }));
        }

        if (expiresAt) {
          armRefreshTimer(expiresAt, () => {
            lastCatalogueResolve = 0;
            get().resolveCatalogue();
          });
        }
      },

      resolveCatalogue: () => {
        const wait = CATALOGUE_THROTTLE_MS - (Date.now() - lastCatalogueResolve);
        if (wait > 0) {
          if (pendingResolve === null) {
            pendingResolve = setTimeout(() => {
              pendingResolve = null;
              get().resolveCatalogue();
            }, wait);
          }
          return;
        }
        lastCatalogueResolve = Date.now();
        const keys = collectAssetKeys([
          ...Object.values(recipesCatalogue).map((recipe) => recipe.assets),
          ...Object.values(outdoorCatalogue).map((entry) => entry.assets),
        ]);
        void get().resolveKeys(keys);
      },

      reportFailure: (key) => {
        if (!key || dead.has(key)) return;
        failed.add(key);
        set((state) => {
          if (!(key in state.overrides)) return state;
          const overrides = Object.fromEntries(Object.entries(state.overrides).filter(([k]) => k !== key));
          return { overrides };
        });
        if (failureFlush) return;
        failureFlush = setTimeout(() => {
          failureFlush = null;
          const batch = [...failed];
          failed = new Set();
          void get().resolveKeys(batch);
        }, FAILURE_FLUSH_MS);
      },
    }),
    {
      name: "cipe_media_overrides",
      onRehydrateStorage: () => (state) => {
        if (!state?.expiresAt) return;
        if (Date.now() >= new Date(state.expiresAt).getTime()) {
          useMediaStore.setState({ overrides: {}, expiresAt: null });
          return;
        }
        armRefreshTimer(state.expiresAt, () => {
          lastCatalogueResolve = 0;
          useMediaStore.getState().resolveCatalogue();
        });
      },
    },
  ),
);

subscribeCatalogue(() => {
  if (useAuthStore.getState().status === "authenticated") useMediaStore.getState().resolveCatalogue();
});
