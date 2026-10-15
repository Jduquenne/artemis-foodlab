import { FoodGroup } from "../../../../core/domain/foodGroup";
import { RowActions } from "../common/RowActions";

export interface FoodGroupRowProps {
  group: FoodGroup;
  memberCount: number;
  onEdit: (group: FoodGroup) => void;
  onAskDelete: (group: FoodGroup) => void;
}

export const FoodGroupRow = ({ group, memberCount, onEdit, onAskDelete }: FoodGroupRowProps) => (
  <div className="flex items-center gap-3 px-4 py-2.5">
    <div className="flex-1 min-w-0">
      <p className="text-sm text-slate-800 truncate">{group.name}</p>
      <p className="text-xs text-slate-400 truncate">
        {memberCount} aliment{memberCount > 1 ? "s" : ""}
      </p>
    </div>
    <span className="shrink-0 text-xs font-mono text-slate-400">{group.id}</span>
    <RowActions name={group.name} onEdit={() => onEdit(group)} onDelete={() => onAskDelete(group)} />
  </div>
);
