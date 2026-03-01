import { useState } from "react";
import { ArrowLeft, Plus, Pencil, Check, X } from "lucide-react";
import { FreezerCategory } from "../../../core/domain/types";
import { removeItemFromCategory, updateCategoryName } from "../../../core/services/freezerService";
import { FreezerItemRow } from "./FreezerItemRow";
import { AddFreezerItemModal } from "./AddFreezerItemModal";
import { markScrolling } from "../../../shared/utils/scrollGuard";

interface FreezerCategoryDetailProps {
  category: FreezerCategory;
  onBack: () => void;
}

export const FreezerCategoryDetail = ({ category, onBack }: FreezerCategoryDetailProps) => {
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState(category.name);

  const handleRename = async () => {
    const trimmed = nameInput.trim();
    if (trimmed && trimmed !== category.name) {
      await updateCategoryName(category.id, trimmed);
    }
    setEditing(false);
  };

  const handleCancelRename = () => {
    setNameInput(category.name);
    setEditing(false);
  };

  return (
    <div className="h-full flex flex-col gap-4 overflow-hidden">
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onBack}
          className="p-2 rounded-xl text-slate-400 hover:text-orange-600 hover:bg-orange-50 transition-colors shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {editing ? (
          <div className="flex-1 flex items-center gap-2 min-w-0">
            <input
              autoFocus
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleRename(); if (e.key === "Escape") handleCancelRename(); }}
              className="flex-1 min-w-0 text-xl font-black bg-transparent border-b-2 border-orange-400 text-slate-900 focus:outline-none"
            />
            <button onClick={handleRename} className="p-1.5 rounded-lg text-orange-500 hover:bg-orange-50 transition-colors">
              <Check className="w-4 h-4" />
            </button>
            <button onClick={handleCancelRename} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-200 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex-1 flex items-center gap-2 min-w-0">
            <h1 className="text-xl font-black text-slate-900 truncate">{category.name}</h1>
            <button
              onClick={() => { setNameInput(category.name); setEditing(true); }}
              className="shrink-0 p-1.5 rounded-lg text-slate-300 hover:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-200 transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <span className="shrink-0 text-sm font-bold text-slate-400">
          {category.items.length} {category.items.length === 1 ? "article" : "articles"}
        </span>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto" onScroll={markScrolling}>
        {category.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400 pb-16">
            <p className="text-sm font-medium">Cette catégorie est vide</p>
            <p className="text-xs">Ajoute un aliment ou un batch cooking</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2 pb-4">
            {category.items.map(item => (
              <FreezerItemRow
                key={item.id}
                item={item}
                categoryId={category.id}
                onDelete={() => removeItemFromCategory(category.id, item.id)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="shrink-0 pb-2">
        <button
          onClick={() => setAddOpen(true)}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-black rounded-2xl transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          Ajouter
        </button>
      </div>

      {addOpen && <AddFreezerItemModal categoryId={category.id} onClose={() => setAddOpen(false)} />}
    </div>
  );
};
