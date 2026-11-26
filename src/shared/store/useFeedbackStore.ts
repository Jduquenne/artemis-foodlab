import { create } from "zustand";

interface FeedbackState {
  unreadReplies: number;
  setUnreadReplies: (count: number) => void;
}

export const useFeedbackStore = create<FeedbackState>((set) => ({
  unreadReplies: 0,
  setUnreadReplies: (unreadReplies) => set({ unreadReplies }),
}));
