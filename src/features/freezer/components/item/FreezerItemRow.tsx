import { useState, useRef } from "react";
import { Snowflake, Plus, MoreVertical, Trash2 } from "lucide-react";
import { FreezerItem } from "../../../../core/domain/types";
import { addBagToFoodItem } from "../../../../core/services/freezerService";
import { getFoodBagsSummary } from "../../../../core/logic/freezer/freezerLogic";
import { FloatingMenu } from "../../../../shared/components/ui/FloatingMenu";
import { BatchFreezerItemRow } from "./BatchFreezerItemRow";
import { BagRow } from "./BagRow";
import { AddBagForm } from "./AddBagForm";

export interface FreezerItemRowProps {
  item: FreezerItem;
  categoryId: string;
  onDelete: () => void;
}

export const FreezerItemRow = ({ item, categoryId, onDelete }: FreezerItemRowProps) => {
  const [addingBag, setAddingBag] = useState(false);
  const [itemMenuOpen, setItemMenuOpen] = useState(false);
  const itemMenuButtonRef = useRef<HTMLButtonElement>(null);

  if (item.type === "batch") {
    return <BatchFreezerItemRow item={item} categoryId={categoryId} onDelete={onDelete} />;
  }

  const isEmpty = item.bags.length === 0;

  return (
    <div className={`bg-white dark:bg-slate-100 rounded-2xl border border-slate-200 px-3 py-2.5 transition ${isEmpty ? "opacity-60" : ""}`}>
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-slate-100 dark:bg-slate-200">
          <Snowflake className={`w-4 h-4 ${isEmpty ? "text-slate-300" : "text-slate-500"}`} />
        </div>

        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold truncate ${isEmpty ? "text-slate-400" : "text-slate-800"}`}>{item.name}</p>
          <p className="text-[11px] text-slate-400 truncate">{getFoodBagsSummary(item)}</p>
        </div>

        <div className="flex items-center gap-0.5 shrink-0">
          <button
            aria-label="Ajouter un sac"
            onClick={() => setAddingBag(a => !a)}
            className="p-2 rounded-xl text-slate-400 hover:text-orange-500 hover:bg-orange-50 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            ref={itemMenuButtonRef}
            aria-label="Options"
            onClick={() => setItemMenuOpen(o => !o)}
            className="p-2 rounded-xl text-slate-300 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-200 transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          <FloatingMenu open={itemMenuOpen} anchorRef={itemMenuButtonRef} onClose={() => setItemMenuOpen(false)}>
            <button
              onClick={() => { setItemMenuOpen(false); onDelete(); }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-4 h-4 shrink-0" />
              Supprimer l'aliment
            </button>
          </FloatingMenu>
        </div>
      </div>

      {(item.bags.length > 0 || addingBag) && (
        <div className="mt-2 ml-4 pl-3 border-l-2 border-slate-100 dark:border-slate-200 flex flex-col gap-1">
          {item.bags.map(bag => (
            <BagRow
              key={bag.id}
              bag={bag}
              categoryId={categoryId}
              itemId={item.id}
            />
          ))}

          {addingBag && (
            <AddBagForm
              initialUnit={item.bags[0]?.unit}
              onSave={async bag => {
                await addBagToFoodItem(categoryId, item.id, bag);
                setAddingBag(false);
              }}
              onCancel={() => setAddingBag(false)}
            />
          )}
        </div>
      )}
    </div>
  );
};
