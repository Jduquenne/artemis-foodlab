import { useState } from "react";
import { MoreVertical, Copy, Trash2 } from "lucide-react";
import { FreezerBag } from "../../../../core/domain/types";
import { addBagToFoodItem, removeBagFromFoodItem } from "../../../../core/services/freezerService";
import { pluralizeUnit } from "../../../../core/utils/unitUtils";

export interface BagRowProps {
  bag: FreezerBag;
  categoryId: string;
  itemId: string;
  formattedDate: string;
}

export const BagRow = ({ bag, categoryId, itemId, formattedDate }: BagRowProps) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const displayUnit = bag.unit
    ? " " + pluralizeUnit(bag.unit, parseFloat(bag.quantity))
    : "";

  return (
    <div className="relative flex items-center gap-2">
      <span className="flex-1 min-w-0 text-xs text-slate-600">
        <span className="font-medium">{bag.quantity}{displayUnit}</span>
        {bag.preparation && <span className="text-slate-400"> · {bag.preparation}</span>}
        <span className="text-slate-300"> · {formattedDate}</span>
      </span>

      <button
        aria-label="Options du sac"
        onClick={() => setMenuOpen(o => !o)}
        className="shrink-0 p-2.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-200 transition-colors"
      >
        <MoreVertical className="w-3.5 h-3.5" />
      </button>

      {menuOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
          <div className="absolute right-0 top-10 z-20 bg-white dark:bg-slate-100 border border-slate-200 rounded-2xl shadow-lg overflow-hidden min-w-44">
            <button
              onClick={() => {
                addBagToFoodItem(categoryId, itemId, {
                  quantity: bag.quantity,
                  unit: bag.unit,
                  preparation: bag.preparation,
                });
                setMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-200 transition-colors"
            >
              <Copy className="w-4 h-4 shrink-0" />
              Dupliquer ce sac
            </button>
            <button
              onClick={() => {
                removeBagFromFoodItem(categoryId, itemId, bag.id);
                setMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors border-t border-slate-100"
            >
              <Trash2 className="w-4 h-4 shrink-0" />
              Supprimer ce sac
            </button>
          </div>
        </>
      )}
    </div>
  );
};
