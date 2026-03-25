import { useEffect } from "react";
import { useNotificationStore } from "../store/useNotificationStore";

const CHECK_INTERVAL_MS = 15 * 60 * 1000;

export const useVersionCheck = () => {
  const push = useNotificationStore((s) => s.push);

  useEffect(() => {
    if (!import.meta.env.PROD) return;

    const check = async () => {
      try {
        const res = await fetch(`/artemis-foodlab/version.json?t=${Date.now()}`);
        if (!res.ok) return;
        const { version } = await res.json() as { version: string };
        if (version !== __APP_VERSION__) {
          push({
            message: `Nouvelle version disponible — mets à jour pour avoir les dernières fonctionnalités.`,
            actions: [
              { label: "Mettre à jour", onClick: () => window.location.reload() },
              { label: "Plus tard", onClick: () => {} },
            ],
            duration: 0,
          });
        }
      } catch { /* réseau indisponible, on ignore */ }
    };

    const timer = setInterval(check, CHECK_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [push]);
};
