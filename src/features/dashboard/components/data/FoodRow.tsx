import { Flame, Snowflake } from "lucide-react";
import { Food } from "../../../../core/domain/ingredient";
import { RowActions } from "../common/RowActions";
import { formatMonths, hasSeason } from "../../../../core/logic/season/seasonLogic";
import { FoodPrice } from "../../../../core/domain/price";
import { formatEuro } from "../../../../core/logic/price/priceLogic";
import { isLiquidFood } from "../../../../core/logic/price/priceQueueLogic";
import { COOKING_METHOD_LABELS, FoodCooking } from "../../../../core/domain/cooking";

export interface FoodRowProps {
  food: Food;
  groupName: string | null;
  price: FoodPrice | undefined;
  cookings: FoodCooking[];
  onEdit: (food: Food) => void;
  onEditCooking: (food: Food) => void;
  onAskDelete: (food: Food) => void;
}

export const FoodRow = ({ food, groupName, price, cookings, onEdit, onEditCooking, onAskDelete }: FoodRowProps) => (
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
        {cookings.length > 0 && ` · ${cookings.map((cooking) => COOKING_METHOD_LABELS[cooking.method]).join(", ")}`}
      </p>
    </div>
    <span className="shrink-0 text-xs tabular-nums text-slate-500 w-20 text-right">
      {price ? `${formatEuro(price.pricePerKg)}/${isLiquidFood(food) ? "l" : "kg"}` : "—"}
    </span>
    <span className="shrink-0 text-xs tabular-nums text-slate-500 w-16 text-right">
      {food.macros.kcal} kcal
    </span>
    <button
      type="button"
      aria-label={`Cuisson de ${food.name}`}
      title="Cuisson"
      onClick={() => onEditCooking(food)}
      className={`p-1.5 rounded-lg transition-colors hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/30 ${cookings.length > 0 ? "text-orange-500" : "text-slate-400"}`}
    >
      <Flame size={15} />
    </button>
    <RowActions name={food.name} onEdit={() => onEdit(food)} onDelete={() => onAskDelete(food)} />
  </div>
);
