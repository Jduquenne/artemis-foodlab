import { useState } from "react";
import { Plus, Snowflake, Pencil, Check, X } from "lucide-react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../core/services/db";
import { createCategory } from "../../core/services/freezerService";
import { useFreezerStore } from "../../shared/store/useFreezerStore";
import { FreezerCategoryCard } from "./components/FreezerCategoryCard";
import { FreezerCategoryDetail } from "./components/FreezerCategoryDetail";
import { markScrolling } from "../../shared/utils/scrollGuard";

export const FreezerModule = () => {
  const { freezerName, setFreezerName } = useFreezerStore();
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(freezerName);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [addingCategory, setAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const categories = useLiveQuery(() => db.freezerCategories.orderBy("position").toArray(), []) ?? [];

  const activeCategory = categories.find(c => c.id === activeCategoryId) ?? null;

  const handleSaveName = () => {
    const trimmed = nameInput.trim();
    if (trimmed) setFreezerName(trimmed);
    else setNameInput(freezerName);
    setEditingName(false);
  };

  const handleAddCategory = async () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;
    await createCategory(trimmed);
    setNewCategoryName("");
    setAddingCategory(false);
  };

  if (activeCategory) {
    return <FreezerCategoryDetail category={activeCategory} onBack={() => setActiveCategoryId(null)} />;
  }

  return (
    <div className="h-full flex flex-col gap-4 overflow-hidden">
      <div className="flex items-center gap-3 shrink-0">
        {editingName ? (
          <div className="flex-1 flex items-center gap-2 min-w-0">
            <input
              autoFocus
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleSaveName(); if (e.key === "Escape") { setNameInput(freezerName); setEditingName(false); } }}
              className="flex-1 min-w-0 text-xl font-black bg-transparent border-b-2 border-orange-400 text-slate-900 focus:outline-none"
            />
            <button onClick={handleSaveName} className="p-1.5 rounded-lg text-orange-500 hover:bg-orange-50 transition-colors">
              <Check className="w-4 h-4" />
            </button>
            <button onClick={() => { setNameInput(freezerName); setEditingName(false); }} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-200 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex-1 flex items-center gap-2 min-w-0">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 truncate">{freezerName}</h1>
            <button
              onClick={() => { setNameInput(freezerName); setEditingName(true); }}
              className="shrink-0 p-1.5 rounded-lg text-slate-300 hover:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-200 transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <span className="shrink-0 text-sm font-bold text-slate-400">
          {categories.length} {categories.length === 1 ? "catégorie" : "catégories"}
        </span>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto" onScroll={markScrolling}>
        {categories.length === 0 && !addingCategory ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400 pb-16">
            <Snowflake className="w-12 h-12 text-slate-300" />
            <p className="text-sm font-medium text-center">Aucune catégorie pour l'instant</p>
            <p className="text-xs text-center">Crée ta première catégorie pour organiser ton congélateur</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 pb-4">
            {categories.map((category, i) => (
              <FreezerCategoryCard
                key={category.id}
                category={category}
                isFirst={i === 0}
                isLast={i === categories.length - 1}
                onClick={() => setActiveCategoryId(category.id)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="shrink-0 pb-2">
        {addingCategory ? (
          <div className="flex items-center gap-2">
            <input
              autoFocus
              value={newCategoryName}
              onChange={e => setNewCategoryName(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleAddCategory(); if (e.key === "Escape") { setAddingCategory(false); setNewCategoryName(""); } }}
              placeholder="Nom de la catégorie..."
              className="flex-1 px-4 py-3 bg-white dark:bg-slate-100 border border-slate-200 rounded-2xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
            />
            <button
              onClick={handleAddCategory}
              disabled={!newCategoryName.trim()}
              className="px-4 py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white font-bold rounded-2xl transition-colors text-sm"
            >
              Créer
            </button>
            <button
              onClick={() => { setAddingCategory(false); setNewCategoryName(""); }}
              className="p-3 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-200 rounded-2xl transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setAddingCategory(true)}
            className="w-full flex items-center justify-center gap-2 py-3.5 border-2 border-dashed border-slate-300 hover:border-orange-400 hover:text-orange-500 text-slate-400 font-bold rounded-2xl transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            Ajouter une catégorie
          </button>
        )}
      </div>
    </div>
  );
};
