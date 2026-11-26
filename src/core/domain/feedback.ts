export const FEEDBACK_MESSAGE_MAX = 2000;
export const FEEDBACK_RATINGS: readonly number[] = [1, 2, 3, 4, 5];

export interface FeedbackInput {
  message: string;
  screen: string;
  appVersion: string;
  rating: number | null;
}

export interface FeedbackCreated {
  id: string;
  createdAt: string;
}

export type FeedbackStatusFilter = "open" | "handled" | "all";

export interface FeedbackItem {
  id: string;
  message: string;
  screen: string | null;
  appVersion: string | null;
  rating: number | null;
  fromDemo: boolean;
  userEmail: string | null;
  createdAt: string;
  handledAt: string | null;
}

export interface FeedbackArea {
  id: string;
  label: string;
  adminOnly: boolean;
}

export const FEEDBACK_GENERAL_AREA = "general";

export const FEEDBACK_AREAS: readonly FeedbackArea[] = [
  { id: FEEDBACK_GENERAL_AREA, label: "L'app en général", adminOnly: false },
  { id: "/today", label: "Aujourd'hui", adminOnly: false },
  { id: "/journal", label: "Journal", adminOnly: false },
  { id: "/planning", label: "Menu", adminOnly: false },
  { id: "/recipes", label: "Recettes", adminOnly: false },
  { id: "/shopping", label: "Courses", adminOnly: false },
  { id: "/freezer", label: "Congélateur", adminOnly: false },
  { id: "/recipe-builder", label: "Créateur de recette", adminOnly: true },
  { id: "/dashboard", label: "Dashboard", adminOnly: true },
];
