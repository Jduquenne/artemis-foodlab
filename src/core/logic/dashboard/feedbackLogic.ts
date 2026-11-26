import { FEEDBACK_AREAS, FEEDBACK_GENERAL_AREA, FeedbackArea, FeedbackItem, FeedbackStatusFilter } from "../../domain/feedback";

export function isFeedbackHandled(item: FeedbackItem): boolean {
  return item.handledAt !== null;
}

export function matchesFeedbackFilter(item: FeedbackItem, filter: FeedbackStatusFilter): boolean {
  if (filter === "all") return true;
  return filter === "handled" ? isFeedbackHandled(item) : !isFeedbackHandled(item);
}

export function feedbackAuthorLabel(item: FeedbackItem): string {
  if (item.userEmail !== null) return item.fromDemo ? `${item.userEmail} (démo)` : item.userEmail;
  return item.fromDemo ? "Compte démo supprimé" : "Compte supprimé";
}

export function replaceFeedback(list: readonly FeedbackItem[], updated: FeedbackItem): FeedbackItem[] {
  return list.map((item) => (item.id === updated.id ? updated : item));
}

export function feedbackAreasFor(isAdmin: boolean): FeedbackArea[] {
  return FEEDBACK_AREAS.filter((area) => isAdmin || !area.adminOnly);
}

export function feedbackAreaOf(pathname: string, areas: readonly FeedbackArea[]): string {
  return areas.find((area) => area.id !== FEEDBACK_GENERAL_AREA && pathname.startsWith(area.id))?.id ?? FEEDBACK_GENERAL_AREA;
}

export function feedbackAreaLabel(screen: string | null): string | null {
  if (screen === null) return null;
  return FEEDBACK_AREAS.find((area) => area.id === screen)?.label ?? screen;
}
