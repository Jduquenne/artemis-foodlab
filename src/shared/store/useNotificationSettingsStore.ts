import { create } from "zustand";
import { persist } from "zustand/middleware";

interface NotificationSettingsState {
  versionCheckEnabled: boolean;
  setVersionCheckEnabled: (enabled: boolean) => void;
}

export const useNotificationSettingsStore = create<NotificationSettingsState>()(
  persist(
    (set) => ({
      versionCheckEnabled: true,
      setVersionCheckEnabled: (enabled) => set({ versionCheckEnabled: enabled }),
    }),
    { name: "cipe_notification_settings" }
  )
);
