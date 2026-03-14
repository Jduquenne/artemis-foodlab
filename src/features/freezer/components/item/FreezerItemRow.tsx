import { useState, useRef, useEffect } from "react";
import { Snowflake, Plus, MoreVertical, Trash2 } from "lucide-react";
import { FreezerItem } from "../../../../core/domain/types";
import { addBagToFoodItem } from "../../../../core/services/freezerService";
import { BatchFreezerItemRow } from "./BatchFreezerItemRow";
import { BagRow } from "./BagRow";
import { AddBagForm } from "./AddBagForm";

export interface FreezerItemRowProps {
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
    return <BatchFreezerItemRow item={item} categoryId={categoryId} onDelete={onDelete} formattedDate={formatDate(item.addedDate)} />;
  }

  const isEmpty = item.bags.length === 0;

  return (
    <div className={`bg-white dark:bg-slate-100 rounded-2xl px-3 py-2.5 transition-opacity ${isEmpty ? "opacity-60" : ""}`}>
      <div className="flex items-center gap-2">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${isEmpty ? "bg-slate-100 dark:bg-slate-200" : "bg-slate-100 dark:bg-slate-200"}`}>
          <Snowflake className={`w-3.5 h-3.5 ${isEmpty ? "text-slate-300" : "text-slate-500"}`} />
        </div>
        <p className={`flex-1 min-w-0 text-sm font-semibold truncate ${isEmpty ? "text-slate-400" : "text-slate-800"}`}>{item.name}</p>

        <div className="flex items-center gap-0.5 shrink-0">
          <span className="text-xs font-bold text-slate-400">
            {isEmpty ? "Vide" : `${item.bags.length} sac${item.bags.length > 1 ? "s" : ""}`}
          </span>
          <button
            aria-label="Ajouter un sac"
            onClick={() => setAddingBag(a => !a)}
            className="p-2 rounded-xl text-slate-400 hover:text-orange-500 hover:bg-orange-50 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <div className="relative" ref={itemMenuRef}>
            <button
              aria-label="Options"
              onClick={() => setItemMenuOpen(o => !o)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-200 transition-colors"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>
            {itemMenuOpen && (
              <div className="absolute right-0 top-9 z-20 bg-white dark:bg-slate-100 border border-slate-200 rounded-2xl shadow-lg overflow-hidden min-w-44">
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

      <div className="mt-1.5 flex flex-col gap-0.5 pl-9">
        {item.bags.map(bag => (
          <BagRow
            key={bag.id}
            bag={bag}
            categoryId={categoryId}
            itemId={item.id}
            formattedDate={formatDate(bag.addedDate)}
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
    </div>
  );
};
