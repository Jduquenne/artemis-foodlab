import { Pencil, Trash2 } from "lucide-react";
import { OutdoorEntry } from "../../../../core/domain/types";
import { getCategoryById } from "../../../../core/domain/categories";

export interface OutdoorRowProps {
  activity: OutdoorEntry;
  onEdit: (activity: OutdoorEntry) => void;
  onAskDelete: (activity: OutdoorEntry) => void;
}

export const OutdoorRow = ({ activity, onEdit, onAskDelete }: OutdoorRowProps) => {
  const category = getCategoryById(activity.categoryId);

  return (
    <div className="flex items-center gap-3 px-4 py-2.5">
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-800 truncate">{activity.name}</p>
        <p className="text-xs text-slate-400 truncate">{category?.name ?? activity.categoryId}</p>
      </div>
      <span className="shrink-0 text-xs font-mono text-slate-400">{activity.code}</span>
      <button
        type="button"
        aria-label={`Modifier ${activity.name}`}
        onClick={() => onEdit(activity)}
        className="p-1.5 rounded-lg text-slate-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/30 transition-colors"
      >
        <Pencil size={15} />
      </button>
      <button
        type="button"
        aria-label={`Supprimer ${activity.name}`}
        onClick={() => onAskDelete(activity)}
        className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
};
