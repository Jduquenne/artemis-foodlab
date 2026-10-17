import { useState } from "react";
import { Plus } from "lucide-react";
import { FoodList, MenuGeneratorSettings } from "../../../../core/domain/menuGenerator";
import { emptyFoodList, foodListUsage } from "../../../../core/logic/menuGenerator/habitLogic";
import { removeById, upsertById } from "../../../../core/utils/collectionUtils";
import { useFoodsSnapshot } from "../../../../shared/hooks/useCatalogueSnapshot";
import { FoodListEditor } from "./FoodListEditor";
import { RuleCard } from "./RuleCard";
import { TargetKindIcon } from "./TargetKindIcon";

export interface FoodListsFieldProps {
  settings: MenuGeneratorSettings;
  disabled: boolean;
  onPatch: (update: Partial<MenuGeneratorSettings>) => void;
}

export const FoodListsField = ({ settings, disabled, onPatch }: FoodListsFieldProps) => {
  const foods = useFoodsSnapshot();
  const [editing, setEditing] = useState<FoodList | null>(null);
  const lists = settings.foodLists;

  const save = (list: FoodList) => {
    onPatch({ foodLists: upsertById(lists, list) });
    setEditing(null);
  };

  return (
    <div className="flex flex-col gap-1.5">
      {editing && !lists.some((list) => list.id === editing.id) && (
        <FoodListEditor key={editing.id} initial={editing} lists={lists} disabled={disabled} onSave={save} onCancel={() => setEditing(null)} />
      )}
      {lists.map((list) => {
        if (editing?.id === list.id) {
          return <FoodListEditor key={list.id} initial={list} lists={lists} disabled={disabled} onSave={save} onCancel={() => setEditing(null)} />;
        }
        const usage = foodListUsage(list.id, settings.habits, settings.quotas, settings.dessertRules);
        return (
          <RuleCard
            key={list.id}
            icon={<TargetKindIcon kind="list" />}
            title={list.name}
            subtitle={list.foodIds.map((id) => foods[id]?.name ?? id).join(", ")}
            disabled={disabled || editing !== null}
            deleteDisabledReason={usage > 0 ? `Utilisée par ${usage} règle${usage > 1 ? "s" : ""}` : undefined}
            onEdit={() => setEditing(list)}
            onDelete={() => onPatch({ foodLists: removeById(lists, list.id) })}
          />
        );
      })}
      {!editing && (
        <button
          type="button"
          onClick={() => setEditing(emptyFoodList(crypto.randomUUID()))}
          disabled={disabled}
          className="self-start flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 hover:bg-muted disabled:opacity-50"
        >
          <Plus size={13} /> Nouvelle liste
        </button>
      )}
    </div>
  );
};
