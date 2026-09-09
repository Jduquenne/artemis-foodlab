export type DashboardTabId = "overview" | "data";

export interface DashboardTab {
  id: DashboardTabId;
  label: string;
}

export const DASHBOARD_TABS: DashboardTab[] = [
  { id: "overview", label: "Vue d'ensemble" },
  { id: "data", label: "Données" },
];
