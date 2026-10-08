import { useState } from "react";
import { DASHBOARD_TABS, DashboardTabId } from "./data/dashboardTabs";
import { OverviewPanel } from "./components/overview/OverviewPanel";
import { DataPanel } from "./components/data/DataPanel";
import { PillTabs } from "./components/common/PillTabs";

export const DashboardModule = () => {
  const [tab, setTab] = useState<DashboardTabId>("overview");

  return (
    <div className="h-full flex flex-col gap-3 overflow-hidden">
      <header className="shrink-0 flex items-end justify-between gap-4">
        <h1 className="text-lg font-black text-slate-800">Dashboard</h1>
        {DASHBOARD_TABS.length > 1 && (
          <PillTabs tabs={DASHBOARD_TABS} value={tab} onChange={setTab} />
        )}
      </header>

      <div className="flex-1 min-h-0">
        {tab === "overview" && <OverviewPanel />}
        {tab === "data" && <DataPanel />}
      </div>
    </div>
  );
};
