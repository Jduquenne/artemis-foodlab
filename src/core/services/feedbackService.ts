import { FeedbackCreated, FeedbackInput, FeedbackItem, FeedbackStatusFilter } from "../domain/feedback";
import { apiFetchJson } from "./apiClient";

export function sendFeedback(input: FeedbackInput): Promise<FeedbackCreated> {
  return apiFetchJson<FeedbackCreated>("/feedback", { method: "POST", body: input });
}

export function listFeedback(status: FeedbackStatusFilter): Promise<FeedbackItem[]> {
  return apiFetchJson<FeedbackItem[]>(`/feedback?status=${status}`);
}

export function setFeedbackHandled(id: string, handled: boolean): Promise<FeedbackItem> {
  return apiFetchJson<FeedbackItem>(`/feedback/${id}`, { method: "PATCH", body: { handled } });
}
