import { create } from "zustand";

export interface NotificationAction {
  label: string;
  onClick: () => void;
}

export interface AppNotification {
  id: string;
  message: string;
  actions: [NotificationAction, NotificationAction];
  duration: number;
}

interface NotificationState {
  current: AppNotification | null;
  queue: AppNotification[];
  push: (n: Omit<AppNotification, "id">) => void;
  dismiss: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  current: null,
  queue: [],

  push: (n) => {
    const notification: AppNotification = { ...n, id: crypto.randomUUID() };
    const { current } = get();
    if (!current) {
      set({ current: notification });
    } else {
      set((s) => ({ queue: [...s.queue, notification] }));
    }
  },

  dismiss: () => {
    const { queue } = get();
    const [next, ...rest] = queue;
    set({ current: next ?? null, queue: rest });
  },
}));
