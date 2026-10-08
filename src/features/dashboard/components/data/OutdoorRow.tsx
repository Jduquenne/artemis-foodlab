import { OutdoorEntry } from "../../../../core/domain/recipe";
import { useCategoriesSnapshot } from "../../../../shared/hooks/useCatalogueSnapshot";
import { categoryLabel } from "../../../../core/logic/recipe/categoryLogic";
import { RowActions } from "../common/RowActions";

export interface OutdoorRowProps {
  activity: OutdoorEntry;
  onEdit: (activity: OutdoorEntry) => void;
  onAskDelete: (activity: OutdoorEntry) => void;
}

export const OutdoorRow = ({ activity, onEdit, onAskDelete }: OutdoorRowProps) => {
  const categories = useCategoriesSnapshot();

  return (
    <div className="flex items-center gap-3 px-4 py-2.5">
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-800 truncate">{activity.name}</p>
        <p className="text-xs text-slate-400 truncate">{categoryLabel(categories, activity.categoryId)}</p>
      </div>
      <span className="shrink-0 text-xs font-mono text-slate-400">{activity.code}</span>
      <RowActions name={activity.name} onEdit={() => onEdit(activity)} onDelete={() => onAskDelete(activity)} />
    </div>
  );
};
