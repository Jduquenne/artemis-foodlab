import { Lock, LockOpen, RefreshCw } from "lucide-react";
import { GeneratedMeal } from "../../../../core/domain/menuGenerator";
import { reasonBadges } from "../../../../core/logic/menuGenerator/menuPreviewLogic";
import { MealReasonIcon } from "./MealReasonIcon";

export interface GeneratedMealCellProps {
  meal: GeneratedMeal;
  recipeName: string | null;
  dessertNames: string[];
  selected: boolean;
  onSelect: (key: string) => void;
  onToggleLock: (key: string) => void;
  onRegenerate: (key: string) => void;
}

export const GeneratedMealCell = ({ meal, recipeName, dessertNames, selected, onSelect, onToggleLock, onRegenerate }: GeneratedMealCellProps) => {
  if (meal.kept || meal.noMeal) {
    return (
      <button
        type="button"
        onClick={() => onSelect(meal.key)}
        disabled={meal.kept}
        className="h-full min-h-20 flex items-center justify-center rounded-xl border border-dashed border-slate-200 px-2 text-[11px] font-semibold text-slate-400"
      >
        <span className="flex flex-col items-center gap-0.5">
          {meal.kept ? "Déjà prévu" : "Pas de repas"}
          {dessertNames.length > 0 && <span className="text-[10px] font-normal text-pink-500 line-clamp-2">+ {dessertNames.join(", ")}</span>}
        </span>
      </button>
    );
  }

  return (
    <div
      className={`h-full min-h-20 flex flex-col rounded-xl border transition-colors ${
        meal.locked ? "border-orange-300 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20" : "border-slate-200 bg-surface"
      } ${selected ? "ring-2 ring-orange-400" : ""}`}
    >
      <button
        type="button"
        onClick={() => onSelect(meal.key)}
        aria-pressed={selected}
        className="flex-1 min-h-0 px-2 pt-1.5 text-left"
      >
        <span className={`block text-xs xl:text-sm font-semibold leading-snug line-clamp-3 xl:line-clamp-4 ${recipeName ? "text-slate-800" : "text-slate-400"}`}>
          {recipeName ?? "Aucune recette"}
        </span>
        {dessertNames.length > 0 && (
          <span className="mt-0.5 block text-[10px] leading-snug text-pink-500 line-clamp-2">Desserts : {dessertNames.join(", ")}</span>
        )}
      </button>
      <div className="flex items-center gap-0.5 px-1 pb-1">
        <button
          type="button"
          onClick={() => onSelect(meal.key)}
          aria-label="Voir pourquoi ce repas"
          className="flex flex-1 min-w-0 items-center gap-1 self-stretch px-1"
        >
          {reasonBadges(meal.reasons).map((kind) => <MealReasonIcon key={kind} kind={kind} />)}
        </button>
        {meal.recipeCode && (
          <button
            type="button"
            onClick={() => onToggleLock(meal.key)}
            aria-pressed={meal.locked}
            aria-label={meal.locked ? "Déverrouiller ce repas" : "Garder ce repas"}
            title={meal.locked ? "Déverrouiller" : "Garder ce repas"}
            className={`p-1 rounded-lg transition-colors ${
              meal.locked ? "text-orange-600 hover:bg-orange-100 dark:hover:bg-orange-900/30" : "text-slate-400 hover:text-orange-600 hover:bg-muted"
            }`}
          >
            {meal.locked ? <Lock size={13} /> : <LockOpen size={13} />}
          </button>
        )}
        <button
          type="button"
          onClick={() => onRegenerate(meal.key)}
          disabled={meal.locked}
          aria-label="Proposer une autre recette"
          title="Proposer une autre recette"
          className="p-1 rounded-lg text-slate-400 hover:text-orange-600 hover:bg-muted transition-colors disabled:opacity-30 disabled:pointer-events-none"
        >
          <RefreshCw size={13} />
        </button>
      </div>
    </div>
  );
};
