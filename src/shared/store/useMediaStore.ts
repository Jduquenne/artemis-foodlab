import { create } from "zustand";
import { persist } from "zustand/middleware";
import { typedRecipesDb } from "../../core/typed-db/typedRecipesDb";
import { typedOutdoorDb } from "../../core/typed-db/typedOutdoorDb";
import { collectAssetKeys, refreshDelayMs } from "../../core/logic/media/mediaLogic";
import { resolveMediaKeys } from "../../core/services/mediaService";

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
        const now = Date.now();
        if (now - lastCatalogueResolve < CATALOGUE_THROTTLE_MS) return;
        lastCatalogueResolve = now;
        const keys = collectAssetKeys([
          ...Object.values(typedRecipesDb).map((recipe) => recipe.assets),
          ...Object.values(typedOutdoorDb).map((entry) => entry.assets),
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
