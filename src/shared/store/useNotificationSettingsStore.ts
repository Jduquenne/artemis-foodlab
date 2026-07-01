import { create } from "zustand";
import { persist } from "zustand/middleware";

interface NotificationSettingsState {
  backupReminderEnabled: boolean;
  versionCheckEnabled: boolean;
  setBackupReminderEnabled: (enabled: boolean) => void;
  setVersionCheckEnabled: (enabled: boolean) => void;
}

export const useNotificationSettingsStore = create<NotificationSettingsState>()(
  persist(
    (set) => ({
      backupReminderEnabled: true,
      versionCheckEnabled: true,
      setBackupReminderEnabled: (enabled) => set({ backupReminderEnabled: enabled }),
      setVersionCheckEnabled: (enabled) => set({ versionCheckEnabled: enabled }),
    }),
    { name: "cipe_notification_settings" }
  )
);
