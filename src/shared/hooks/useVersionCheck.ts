import { useEffect } from "react";
import { useNotificationStore } from "../store/useNotificationStore";
import { useNotificationSettingsStore } from "../store/useNotificationSettingsStore";

const CHECK_INTERVAL_MS = 15 * 60 * 1000;

export const useVersionCheck = () => {
  const push = useNotificationStore((s) => s.push);
  const enabled = useNotificationSettingsStore((s) => s.versionCheckEnabled);

  useEffect(() => {
    if (!import.meta.env.PROD || !enabled) return;

    const check = async () => {
      try {
        const res = await fetch(`${import.meta.env.BASE_URL}version.json?t=${Date.now()}`);
        if (!res.ok) return;
        const data: unknown = await res.json();
        const version = typeof data === "object" && data !== null && "version" in data ? data.version : null;
        if (typeof version === "string" && version !== __APP_VERSION__) {
          push({
            message: `Nouvelle version disponible — mets à jour pour avoir les dernières fonctionnalités.`,
            actions: [
              { label: "Mettre à jour", onClick: () => window.location.reload() },
              { label: "Plus tard", onClick: () => {} },
            ],
            duration: 0,
          });
        }
      } catch {
        return;
      }
    };

    const timer = setInterval(check, CHECK_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [push, enabled]);
};
