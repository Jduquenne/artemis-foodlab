import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { CatalogueIssue } from "../../../../core/logic/dashboard/dashboardStats";

export interface CatalogueIssueListProps {
  issues: CatalogueIssue[];
}

export const CatalogueIssueList = ({ issues }: CatalogueIssueListProps) => {
  const [openKey, setOpenKey] = useState<string | null>(null);

  return (
    <div className="divide-y divide-slate-100">
      {issues.map((issue) => {
        const isOpen = openKey === issue.key;
        return (
          <div key={issue.key}>
            <button
              onClick={() => setOpenKey(isOpen ? null : issue.key)}
              className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-200 transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
              <span className="flex-1 text-xs text-slate-700">{issue.label}</span>
              <span className="text-xs font-black text-slate-800 tabular-nums">{issue.names.length}</span>
              <ChevronDown
                size={14}
                className={`text-slate-400 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
              />
            </button>
            {isOpen && (
              <ul className="px-4 pb-2.5 pl-9 flex flex-wrap gap-x-4 gap-y-1">
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
  );
};
