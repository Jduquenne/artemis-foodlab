import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { FoodList, MenuGeneratorSettings } from "../../../../core/domain/menuGenerator";
import { emptyFoodList, foodListUsage } from "../../../../core/logic/menuGenerator/habitLogic";
import { removeById, upsertById } from "../../../../core/utils/collectionUtils";
import { useFoodsSnapshot } from "../../../../shared/hooks/useCatalogueSnapshot";
import { FoodListEditor } from "./FoodListEditor";

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
        const usage = foodListUsage(list.id, settings.habits, settings.quotas);
        return (
          <div key={list.id} className="flex items-start gap-2 rounded-xl border border-slate-200 px-2.5 py-2">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-800">{list.name}</p>
              <p className="text-[11px] text-slate-500 truncate">{list.foodIds.map((id) => foods[id]?.name ?? id).join(", ")}</p>
            </div>
            <button type="button" onClick={() => setEditing(list)} disabled={disabled || editing !== null} aria-label="Modifier la liste" className="p-1 rounded-lg text-slate-400 hover:text-orange-600 hover:bg-muted disabled:opacity-50">
              <Pencil size={13} />
            </button>
            <button
              type="button"
              onClick={() => onPatch({ foodLists: removeById(lists, list.id) })}
              disabled={disabled || editing !== null || usage > 0}
              aria-label="Supprimer la liste"
              title={usage > 0 ? `Utilisée par ${usage} règle${usage > 1 ? "s" : ""}` : "Supprimer la liste"}
              className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-muted disabled:opacity-30"
            >
              <Trash2 size={13} />
            </button>
          </div>
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
