export type DashboardTabId = "overview" | "users";

export interface DashboardTab {
  id: DashboardTabId;
  label: string;
}

export const DASHBOARD_TABS: DashboardTab[] = [
  { id: "overview", label: "Vue d'ensemble" },
  { id: "users", label: "Utilisateurs" },
];
