import { FeedbackCreated, FeedbackInput, FeedbackItem, FeedbackPurgeResult, FeedbackStatusFilter, OwnFeedbackItem } from "../domain/feedback";
import { apiFetch, apiFetchJson } from "./apiClient";

export function sendFeedback(input: FeedbackInput): Promise<FeedbackCreated> {
  return apiFetchJson<FeedbackCreated>("/feedback", { method: "POST", body: input });
}

export function listFeedback(status: FeedbackStatusFilter): Promise<FeedbackItem[]> {
  return apiFetchJson<FeedbackItem[]>(`/feedback?status=${status}`);
}

export function setFeedbackHandled(id: string, handled: boolean): Promise<FeedbackItem> {
  return apiFetchJson<FeedbackItem>(`/feedback/${id}`, { method: "PATCH", body: { handled } });
}

export function replyToFeedback(id: string, reply: string): Promise<FeedbackItem> {
  return apiFetchJson<FeedbackItem>(`/feedback/${id}/reply`, { method: "PUT", body: { reply } });
}

export function deleteFeedbackReply(id: string): Promise<FeedbackItem> {
  return apiFetchJson<FeedbackItem>(`/feedback/${id}/reply`, { method: "DELETE" });
}

export async function deleteFeedback(id: string): Promise<void> {
  await apiFetch(`/feedback/${id}`, { method: "DELETE" });
}

export function purgeHandledFeedback(): Promise<FeedbackPurgeResult> {
  return apiFetchJson<FeedbackPurgeResult>("/feedback?status=handled", { method: "DELETE" });
}

export function listOwnFeedback(): Promise<OwnFeedbackItem[]> {
  return apiFetchJson<OwnFeedbackItem[]>("/feedback/mine");
}

export function markOwnRepliesRead(): Promise<{ marked: number }> {
  return apiFetchJson<{ marked: number }>("/feedback/mine/read", { method: "POST" });
}
