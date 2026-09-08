import { useState } from "react";
import { CheckCircle2, ChevronDown } from "lucide-react";
import { CatalogueIssue } from "../../../../core/logic/dashboard/dashboardStats";

export interface CatalogueIssueListProps {
  issues: CatalogueIssue[];
}

export const CatalogueIssueList = ({ issues }: CatalogueIssueListProps) => {
  const [openKey, setOpenKey] = useState<string | null>(null);

  return (
    <div className="h-full rounded-2xl border border-slate-200 bg-white dark:bg-slate-100 flex flex-col overflow-hidden">
      <h2 className="shrink-0 px-4 pt-4 pb-2 text-sm font-bold text-slate-500">Santé des données</h2>

      {issues.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-2 p-6 text-center">
          <CheckCircle2 size={28} className="text-emerald-500" />
          <p className="text-sm text-slate-500">Rien à corriger dans le catalogue.</p>
        </div>
      ) : (
        <div className="flex-1 min-h-0 overflow-y-auto">
          {issues.map((issue) => {
            const isOpen = openKey === issue.key;
            return (
              <div key={issue.key} className="border-t border-slate-100 first:border-t-0">
                <button
                  onClick={() => setOpenKey(isOpen ? null : issue.key)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-200 transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                  <span className="flex-1 text-sm text-slate-700">{issue.label}</span>
                  <span className="text-sm font-black text-slate-800 tabular-nums">{issue.names.length}</span>
                  <ChevronDown
                    size={15}
                    className={`text-slate-400 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {isOpen && (
                  <ul className="px-4 pb-3 pl-9 flex flex-wrap gap-x-4 gap-y-1">
                    {issue.names.map((name, index) => (
                      <li key={`${issue.key}-${index}`} className="text-xs text-slate-500">
                        {name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
