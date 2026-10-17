import { X } from "lucide-react";
import { DessertPick, FoodList } from "../../../../core/domain/menuGenerator";
import { searchDessertRecipes } from "../../../../core/logic/menuGenerator/dessertLogic";
import { HABIT_TARGET_KIND_LABELS, HabitTargetKind, defaultHabitTarget } from "../../../../core/logic/menuGenerator/habitLogic";
import { useRecipesSnapshot } from "../../../../shared/hooks/useCatalogueSnapshot";
import { ChoicePills } from "./ChoicePills";
import { HabitTargetField } from "./HabitTargetField";
import { RecipeSearchInput } from "./RecipeSearchInput";

export interface DessertPickFieldProps {
  item: DessertPick;
  index: number;
  lists: readonly FoodList[];
  disabled: boolean;
  onChange: (item: DessertPick) => void;
  onRemove: () => void;
}

const MODE_OPTIONS: readonly { id: DessertPick["kind"]; label: string }[] = [
  { id: "recipe", label: "Recette précise" },
  { id: "pick", label: "Au choix parmi" },
];

const PICK_KINDS = (Object.keys(HABIT_TARGET_KIND_LABELS) as HabitTargetKind[])
  .filter((id) => id !== "noMeal" && id !== "protein")
  .map((id) => ({ id, label: HABIT_TARGET_KIND_LABELS[id] }));

export const DessertPickField = ({ item, index, lists, disabled, onChange, onRemove }: DessertPickFieldProps) => {
  const recipes = useRecipesSnapshot();

  return (
    <div className="flex flex-col gap-1.5 rounded-lg bg-muted p-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-bold text-slate-500">Dessert {index + 1}</span>
        <button type="button" onClick={onRemove} disabled={disabled} aria-label={`Retirer le dessert ${index + 1}`} className="p-0.5 rounded text-slate-400 hover:text-red-500 disabled:opacity-50">
          <X size={12} />
        </button>
      </div>
      <ChoicePills
        options={MODE_OPTIONS}
        isActive={(id) => id === item.kind}
        onToggle={(kind) => onChange(kind === "recipe" ? { kind, recipeCode: "" } : { kind, target: { kind: "category", categoryId: "" } })}
        disabled={disabled}
      />
      {item.kind === "recipe" ? (
        <div className="flex flex-col gap-1">
          {item.recipeCode && <span className="text-xs font-semibold text-slate-700">{recipes[item.recipeCode]?.name ?? item.recipeCode}</span>}
          <RecipeSearchInput
            disabled={disabled}
            search={searchDessertRecipes}
            placeholder="Recette dessert, ex : chocolat 85 %…"
            onPick={(recipeCode) => onChange({ kind: "recipe", recipeCode })}
          />
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          <ChoicePills
            options={PICK_KINDS}
            isActive={(kind) => kind === item.target.kind}
            onToggle={(kind) => {
              const target = defaultHabitTarget(kind);
              if (target.kind !== "noMeal" && kind !== item.target.kind) onChange({ kind: "pick", target });
            }}
            disabled={disabled}
          />
          <HabitTargetField
            target={item.target}
            lists={lists}
            disabled={disabled}
            onChange={(target) => {
              if (target.kind !== "noMeal") onChange({ kind: "pick", target });
            }}
          />
          <p className="text-[11px] text-slate-400">Tiré parmi les recettes marquées dessert, en tenant compte de la saison.</p>
        </div>
      )}
    </div>
  );
};
