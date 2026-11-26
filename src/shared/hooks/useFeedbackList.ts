import { useEffect, useState } from "react";
import { FeedbackItem, FeedbackStatusFilter } from "../../core/domain/feedback";
import { replaceFeedback } from "../../core/logic/dashboard/feedbackLogic";
import { listFeedback, setFeedbackHandled } from "../../core/services/feedbackService";
import { withPending } from "../utils/withPending";

export function useFeedbackList(status: FeedbackStatusFilter) {
  const [items, setItems] = useState<FeedbackItem[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [reloadTick, setReloadTick] = useState(0);
  const [loadedKey, setLoadedKey] = useState(`${status}-${reloadTick}`);
  const key = `${status}-${reloadTick}`;
  if (loadedKey !== key) {
    setLoadedKey(key);
    setItems(null);
    setLoadError(false);
  }

  useEffect(() => {
    let active = true;
    listFeedback(status)
      .then((list) => { if (active) setItems(list); })
      .catch(() => { if (active) setLoadError(true); });
    return () => { active = false; };
  }, [status, reloadTick]);

  const toggleHandled = (item: FeedbackItem) => {
    withPending(`feedback-handled:${item.id}`, () => setFeedbackHandled(item.id, item.handledAt === null))
      .then((updated) => { if (updated) setItems((list) => (list ? replaceFeedback(list, updated) : list)); }, () => undefined);
  };

  return { items, loadError, reload: () => setReloadTick((t) => t + 1), toggleHandled };
}
