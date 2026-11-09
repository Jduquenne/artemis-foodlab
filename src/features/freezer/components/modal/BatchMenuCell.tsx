import { Plus } from "lucide-react";

export interface BatchMenuCellProps {
  dishName: string | null;
  isSameBatch: boolean;
  selected: boolean;
  past: boolean;
  label: string;
  onSelect: () => void;
}

export const BatchMenuCell = ({ dishName, isSameBatch, selected, past, label, onSelect }: BatchMenuCellProps) => (
  <button
    type="button"
    aria-label={label}
    aria-pressed={selected}
    onClick={onSelect}
    className={`min-h-14 sm:min-h-[4.5rem] h-full flex flex-col items-start justify-center gap-0.5 rounded-xl border px-2 py-1.5 text-left transition-colors ${
      selected
        ? "border-orange-400 bg-orange-50 dark:bg-orange-900/20 ring-2 ring-orange-400"
        : dishName
          ? "border-slate-200 bg-surface hover:bg-subtle"
          : "border-dashed border-slate-300 hover:border-orange-300 hover:bg-subtle"
    } ${past && !selected ? "opacity-50" : ""}`}
  >
    {dishName ? (
      <>
        <span className="text-[11px] sm:text-xs font-semibold leading-snug text-slate-800 line-clamp-3">{dishName}</span>
        {isSameBatch && <span className="text-[10px] font-bold text-orange-600 dark:text-orange-300">Déjà ce plat</span>}
      </>
    ) : (
      <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-400">
        <Plus className="w-3 h-3" />
        Libre
      </span>
    )}
  </button>
);
