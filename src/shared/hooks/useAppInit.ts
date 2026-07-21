import { useState, useEffect } from "react";
import { db } from "../../core/services/databaseService";
import { hydrateFromCache, seedIfEmpty, syncFromGateway } from "../../core/services/recipesSyncService";

const MIN_DISPLAY_MS = 800;

export function useAppInit(): boolean {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const start = Date.now();
    db.open()
      .then(() => seedIfEmpty())
      .then(() => hydrateFromCache())
      .then(() => {
        const delay = Math.max(0, MIN_DISPLAY_MS - (Date.now() - start));
        setTimeout(() => setIsReady(true), delay);
        syncFromGateway();
      })
      .catch(() => setIsReady(true));
  }, []);

  return isReady;
}
