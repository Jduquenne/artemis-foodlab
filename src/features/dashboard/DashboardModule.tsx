import { useState } from "react";
import { DASHBOARD_TABS, DashboardTabId } from "./data/dashboardTabs";
import { OverviewPanel } from "./components/overview/OverviewPanel";
import { UsersPanel } from "./components/users/UsersPanel";

export const DashboardModule = () => {
  const [tab, setTab] = useState<DashboardTabId>("overview");

  return (
    <div className="h-full flex flex-col gap-3 overflow-hidden">
      <header className="shrink-0 flex items-end justify-between gap-4">
        <h1 className="text-lg font-black text-slate-800">Dashboard</h1>
        {DASHBOARD_TABS.length > 1 && (
          <nav className="flex gap-1">
            {DASHBOARD_TABS.map((entry) => (
              <button
                key={entry.id}
                onClick={() => setTab(entry.id)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  tab === entry.id
                    ? "text-orange-600 bg-orange-100 dark:bg-orange-900/30"
                    : "text-slate-500 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                }`}
              >
                {entry.label}
              </button>
            ))}
          </nav>
        )}
      </header>

      <div className="flex-1 min-h-0">
        {tab === "overview" && <OverviewPanel />}
        {tab === "users" && <UsersPanel />}
      </div>
    </div>
  );
};
