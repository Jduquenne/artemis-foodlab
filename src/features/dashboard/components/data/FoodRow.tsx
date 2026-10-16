import { Snowflake } from "lucide-react";
import { Food } from "../../../../core/domain/ingredient";
import { RowActions } from "../common/RowActions";
import { formatMonths, hasSeason } from "../../../../core/logic/season/seasonLogic";

export interface FoodRowProps {
  food: Food;
  groupName: string | null;
  onEdit: (food: Food) => void;
  onAskDelete: (food: Food) => void;
}

export const FoodRow = ({ food, groupName, onEdit, onAskDelete }: FoodRowProps) => (
  <div className="flex items-center gap-3 px-4 py-2.5">
    <div className="flex-1 min-w-0">
      <p className="text-sm text-slate-800 truncate flex items-center gap-1.5">
        {food.name}
        {food.isFreezable && <Snowflake size={12} className="text-cyan-500 shrink-0" />}
      </p>
      <p className="text-xs text-slate-400 truncate">
        {food.category}
        {groupName && ` · ${groupName}`}
        {hasSeason(food.months) && ` · ${formatMonths(food.months)}`}
      </p>
    </div>
    <span className="shrink-0 text-xs tabular-nums text-slate-500 w-16 text-right">
      {food.macros.kcal} kcal
    </span>
    <RowActions name={food.name} onEdit={() => onEdit(food)} onDelete={() => onAskDelete(food)} />
  </div>
);
