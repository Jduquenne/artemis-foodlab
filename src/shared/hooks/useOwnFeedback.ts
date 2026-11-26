import { useEffect, useState } from "react";
import { OwnFeedbackItem } from "../../core/domain/feedback";
import { hasUnreadReply } from "../../core/logic/dashboard/feedbackLogic";
import { listOwnFeedback, markOwnRepliesRead } from "../../core/services/feedbackService";
import { useFeedbackStore } from "../store/useFeedbackStore";

export interface OwnFeedbackState {
  items: OwnFeedbackItem[] | null;
  newReplyIds: ReadonlySet<string>;
  loadError: boolean;
}

export function useOwnFeedback(): OwnFeedbackState {
  const [state, setState] = useState<OwnFeedbackState>({ items: null, newReplyIds: new Set(), loadError: false });

  useEffect(() => {
    let active = true;
    listOwnFeedback()
      .then((items) => {
        if (!active) return;
        const newReplyIds = new Set(items.filter(hasUnreadReply).map((item) => item.id));
        setState({ items, newReplyIds, loadError: false });
        if (newReplyIds.size > 0) {
          markOwnRepliesRead().then(() => useFeedbackStore.getState().setUnreadReplies(0), () => undefined);
        }
      })
      .catch(() => { if (active) setState((s) => ({ ...s, loadError: true })); });
    return () => { active = false; };
  }, []);

  return state;
}
