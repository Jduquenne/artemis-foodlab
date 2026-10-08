import { ReactNode } from "react";
import { Plus, Search } from "lucide-react";

export interface DataPanelShellProps {
  title: string;
  count: number;
  search?: { value: string; onChange: (value: string) => void };
  filters?: ReactNode;
  onAdd: () => void;
  children: ReactNode;
}

export const DataPanelShell = ({ title, count, search, filters, onAdd, children }: DataPanelShellProps) => (
  <div className="h-full rounded-2xl border border-slate-200 bg-surface flex flex-col overflow-hidden">
    <header className="shrink-0 flex flex-wrap items-center gap-3 px-4 py-3 border-b border-slate-100">
      <h2 className="text-sm font-bold text-slate-500 shrink-0">
        {title} <span className="text-slate-400">· {count}</span>
      </h2>
      {filters}
      {search ? (
        <div className="relative flex-1 min-w-40 max-w-xs ml-auto">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search.value}
            onChange={(e) => search.onChange(e.target.value)}
            placeholder="Rechercher"
            className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 bg-surface text-sm text-slate-800 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
          />
        </div>
      ) : (
        <span className="flex-1" />
      )}
      <button
        type="button"
        onClick={onAdd}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-bold hover:bg-orange-600 transition-colors shrink-0"
      >
        <Plus size={14} />
        Ajouter
      </button>
    </header>
    {children}
  </div>
);
