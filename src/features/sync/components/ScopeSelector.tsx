import { type ReactNode } from "react";
import { Calendar, Home, Snowflake, ShoppingCart } from "lucide-react";
import { SyncScope, ALL_SCOPES, SCOPE_LABELS } from "../../../core/services/dataService";

const SCOPE_ICONS: Record<SyncScope, ReactNode> = {
  planning: <Calendar size={18} />,
  household: <Home size={18} />,
  freezer: <Snowflake size={18} />,
  shopping: <ShoppingCart size={18} />,
};

export interface ScopeSelectorProps {
  selected: SyncScope[];
  available?: SyncScope[];
  onChange: (scope: SyncScope[]) => void;
}

export const ScopeSelector = ({ selected, available = ALL_SCOPES, onChange }: ScopeSelectorProps) => {
  const toggle = (s: SyncScope) => {
    if (selected.includes(s)) {
      onChange(selected.filter(x => x !== s));
    } else {
      onChange([...selected, s]);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {available.map(scope => {
        const isSelected = selected.includes(scope);
        return (
          <button
            key={scope}
            onClick={() => toggle(scope)}
            className={`flex items-center gap-3 w-full p-3 rounded-xl border-2 transition-colors text-left ${
              isSelected
                ? "border-orange-400 bg-orange-50 dark:bg-orange-950/30"
                : "border-slate-200 dark:border-slate-300 bg-white dark:bg-slate-100"
            }`}
          >
            <div className={`shrink-0 ${isSelected ? "text-orange-500" : "text-slate-400"}`}>
              {SCOPE_ICONS[scope]}
            </div>
            <div className="min-w-0">
              <p className={`text-sm font-bold ${isSelected ? "text-slate-900" : "text-slate-600"}`}>
                {SCOPE_LABELS[scope].label}
              </p>
              <p className="text-xs text-slate-500">{SCOPE_LABELS[scope].description}</p>
            </div>
            <div className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
              isSelected ? "border-orange-500 bg-orange-500" : "border-slate-300"
            }`}>
              {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
            </div>
          </button>
        );
      })}
    </div>
  );
};
