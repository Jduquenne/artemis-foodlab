import { useState } from "react";
import { AlertTriangle, CheckCircle2, ChevronDown } from "lucide-react";
import { CatalogueIssue, getCatalogueHealth } from "../../../../core/logic/dashboard/dashboardStats";
import { CatalogueIssueList } from "./CatalogueIssueList";

export interface HealthBannerProps {
  issues: CatalogueIssue[];
}

export const HealthBanner = ({ issues }: HealthBannerProps) => {
  const { issueCount, flaggedItems } = getCatalogueHealth(issues);
  const clear = issueCount === 0;
  const [open, setOpen] = useState(false);

  return (
    <div className="shrink-0 rounded-2xl border border-slate-200 bg-white dark:bg-slate-100 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={clear}
        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left disabled:cursor-default"
      >
        {clear ? (
          <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
        ) : (
          <AlertTriangle size={16} className="text-amber-500 shrink-0" />
        )}
        <span className="text-sm font-bold text-slate-800">
          {clear ? "Catalogue en ordre" : `${issueCount} ${issueCount === 1 ? "point à vérifier" : "points à vérifier"}`}
        </span>
        {!clear && (
          <span className="text-xs text-slate-400">
            · {flaggedItems} {flaggedItems === 1 ? "entrée" : "entrées"}
          </span>
        )}
        {!clear && (
          <ChevronDown
            size={16}
            className={`ml-auto text-slate-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          />
        )}
      </button>

      {open && !clear && (
        <div className="max-h-56 overflow-y-auto border-t border-slate-100">
          <CatalogueIssueList issues={issues} />
        </div>
      )}
    </div>
  );
};
