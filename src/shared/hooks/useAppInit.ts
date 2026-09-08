import { useState, useEffect } from "react";
import { db } from "../../core/services/databaseService";
import { hydrateFromCache } from "../../core/services/catalogueSyncService";
import { useNewsStore } from "../store/useNewsStore";

const MIN_DISPLAY_MS = 800;

export function useAppInit(): boolean {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const start = Date.now();
    db.open()
      .then(() => hydrateFromCache())
      .then(() => {
        useNewsStore.getState().syncHasNew();
        const delay = Math.max(0, MIN_DISPLAY_MS - (Date.now() - start));
        setTimeout(() => setIsReady(true), delay);
      })
      .catch(() => setIsReady(true));
  }, []);

  return isReady;
}
