import { useEffect } from "react";
import { exportData } from "../../core/services/backupService";
import { useNotificationStore } from "../store/useNotificationStore";
import { useNotificationSettingsStore } from "../store/useNotificationSettingsStore";

const INTERVAL_MS = 30 * 60 * 1000;

export const useBackupReminder = () => {
  const push = useNotificationStore((s) => s.push);
  const enabled = useNotificationSettingsStore((s) => s.backupReminderEnabled);

  useEffect(() => {
    if (!enabled) return;
    const timer = setInterval(() => {
      push({
        message: "Cela fait 30 minutes — pensez à sauvegarder vos données !",
        actions: [
          { label: "Sauvegarder", onClick: exportData },
          { label: "Plus tard", onClick: () => {} },
        ],
        duration: 60_000,
      });
    }, INTERVAL_MS);

    return () => clearInterval(timer);
  }, [push, enabled]);
};
