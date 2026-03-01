import { useState, useRef, useEffect } from "react";
import { Snowflake, ChefHat, Plus, MoreVertical, Copy, Trash2 } from "lucide-react";
import { FreezerItem } from "../../../core/domain/types";
import { addBagToFoodItem, removeBagFromFoodItem, removeItemFromCategory } from "../../../core/services/freezerService";
import { pluralizeUnit } from "../../../core/utils/unitUtils";
import { AddBagForm } from "./AddBagForm";

interface FreezerItemRowProps {
  item: FreezerItem;
  categoryId: string;
  onDelete: () => void;
}

const formatDate = (iso: string) => {
  const [, m, d] = iso.split("-");
  return `${d}/${m}`;
};

export const FreezerItemRow = ({ item, categoryId, onDelete }: FreezerItemRowProps) => {
  const [addingBag, setAddingBag] = useState(false);
  const [openBagMenuId, setOpenBagMenuId] = useState<string | null>(null);
  const [itemMenuOpen, setItemMenuOpen] = useState(false);
  const itemMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!itemMenuOpen) return;
    const handler = (e: MouseEvent) => {
      if (itemMenuRef.current && !itemMenuRef.current.contains(e.target as Node)) {
        setItemMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [itemMenuOpen]);

  if (item.type === "batch") {
    return (
      <div className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-100 rounded-2xl">
        <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
          <ChefHat className="w-4 h-4 text-orange-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800 truncate">{item.recipeName}</p>
          <p className="text-xs text-slate-400 mt-0.5">
            {item.portions} repas · {formatDate(item.addedDate)}
          </p>
        </div>
        <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 bg-orange-100 text-orange-600 rounded-full">
          BATCH
        </span>
        <button
          onClick={onDelete}
          className="shrink-0 p-2.5 text-slate-300 hover:text-red-400 hover:bg-red-50 rounded-xl transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-100 rounded-2xl px-4 py-3">
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-200 flex items-center justify-center shrink-0">
          <Snowflake className="w-4 h-4 text-slate-500" />
        </div>
        <p className="flex-1 min-w-0 text-sm font-semibold text-slate-800 truncate">{item.name}</p>

        <div className="flex items-center gap-1 shrink-0">
          <span className="text-xs font-bold text-slate-400">
            {item.bags.length} sac{item.bags.length > 1 ? "s" : ""}
          </span>
          <button
            onClick={() => setAddingBag(a => !a)}
            className="p-2.5 rounded-xl text-slate-400 hover:text-orange-500 hover:bg-orange-50 transition-colors"
            title="Ajouter un sac"
          >
            <Plus className="w-4 h-4" />
          </button>
          <div className="relative" ref={itemMenuRef}>
            <button
              onClick={() => setItemMenuOpen(o => !o)}
              className="p-2.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-200 transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            {itemMenuOpen && (
              <div className="absolute right-0 top-11 z-20 bg-white dark:bg-slate-100 border border-slate-200 rounded-2xl shadow-lg overflow-hidden min-w-44">
                <button
                  onClick={() => { setItemMenuOpen(false); onDelete(); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4 shrink-0" />
                  Supprimer l'aliment
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-2 flex flex-col gap-1 pl-12">
        {item.bags.map(bag => (
          <div key={bag.id} className="relative flex items-center gap-2">
            <span className="flex-1 min-w-0 text-xs text-slate-600">
              <span className="font-medium">{bag.quantity}{bag.unit ? " " + pluralizeUnit(bag.unit, parseFloat(bag.quantity)) : ""}</span>
              {bag.preparation && <span className="text-slate-400"> · {bag.preparation}</span>}
              <span className="text-slate-300"> · {formatDate(bag.addedDate)}</span>
            </span>

            <button
              onClick={() => setOpenBagMenuId(id => id === bag.id ? null : bag.id)}
              className="shrink-0 p-2.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-200 transition-colors"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>

            {openBagMenuId === bag.id && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setOpenBagMenuId(null)} />
                <div className="absolute right-0 top-10 z-20 bg-white dark:bg-slate-100 border border-slate-200 rounded-2xl shadow-lg overflow-hidden min-w-44">
                  <button
                    onClick={() => {
                      addBagToFoodItem(categoryId, item.id, {
                        quantity: bag.quantity,
                        unit: bag.unit,
                        preparation: bag.preparation,
                      });
                      setOpenBagMenuId(null);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-200 transition-colors"
                  >
                    <Copy className="w-4 h-4 shrink-0" />
                    Dupliquer ce sac
                  </button>
                  <button
                    onClick={() => {
                      removeBagFromFoodItem(categoryId, item.id, bag.id);
                      setOpenBagMenuId(null);
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
    </div>
  );
};
