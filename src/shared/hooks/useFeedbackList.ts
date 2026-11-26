import { useEffect, useState } from "react";
import { FeedbackItem, FeedbackPurgeResult, FeedbackStatusFilter } from "../../core/domain/feedback";
import { removeFeedback, replaceFeedback } from "../../core/logic/dashboard/feedbackLogic";
import {
  deleteFeedback,
  deleteFeedbackReply,
  listFeedback,
  purgeHandledFeedback,
  replyToFeedback,
  setFeedbackHandled,
} from "../../core/services/feedbackService";
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

  const patchItem = (updated: FeedbackItem | undefined) => {
    if (updated) setItems((list) => (list ? replaceFeedback(list, updated) : list));
    return updated !== undefined;
  };

  const toggleHandled = (item: FeedbackItem) => {
    withPending(`feedback-handled:${item.id}`, () => setFeedbackHandled(item.id, item.handledAt === null)).then(patchItem, () => undefined);
  };

  const reply = (item: FeedbackItem, text: string): Promise<boolean> =>
    withPending(`feedback-reply:${item.id}`, () => replyToFeedback(item.id, text)).then(patchItem, () => false);

  const deleteReply = (item: FeedbackItem) => {
    withPending(`feedback-reply-delete:${item.id}`, () => deleteFeedbackReply(item.id)).then(patchItem, () => undefined);
  };

  const remove = (item: FeedbackItem): Promise<boolean> =>
    withPending(`feedback-delete:${item.id}`, async () => {
      await deleteFeedback(item.id);
      return true;
    }).then((done) => {
      if (done) setItems((list) => (list ? removeFeedback(list, item.id) : list));
      return done === true;
    }, () => false);

  const purgeHandled = (): Promise<FeedbackPurgeResult | undefined> =>
    withPending("feedback-purge", () => purgeHandledFeedback()).then((result) => {
      if (result) setReloadTick((t) => t + 1);
      return result;
    }, () => undefined);

  return { items, loadError, reload: () => setReloadTick((t) => t + 1), toggleHandled, reply, deleteReply, remove, purgeHandled };
}
