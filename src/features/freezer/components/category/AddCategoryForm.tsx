import { useState } from "react";
import { Plus, X } from "lucide-react";
import { createCategory } from "../../../../core/services/freezerService";

export const AddCategoryForm = () => {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");

  const handleConfirm = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    await createCategory(trimmed);
    setName("");
    setAdding(false);
  };

  const handleCancel = () => {
    setAdding(false);
    setName("");
  };

  if (adding) {
    return (
      <div className="flex items-center gap-2">
        <input
          autoFocus
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter") handleConfirm();
            if (e.key === "Escape") handleCancel();
          }}
          placeholder="Nom de la catégorie..."
          className="flex-1 px-4 py-3 bg-white dark:bg-slate-100 border border-slate-200 rounded-2xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
        />
        <button
          onClick={handleConfirm}
          disabled={!name.trim()}
          className="px-4 py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white font-bold rounded-2xl transition-colors text-sm"
        >
          Créer
        </button>
        <button
          aria-label="Annuler"
          onClick={handleCancel}
          className="p-3 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-200 rounded-2xl transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setAdding(true)}
      className="w-full flex items-center justify-center gap-2 py-3.5 border-2 border-dashed border-slate-300 hover:border-orange-400 hover:text-orange-500 text-slate-400 font-bold rounded-2xl transition-colors text-sm"
    >
      <Plus className="w-4 h-4" />
      Ajouter une catégorie
    </button>
  );
};
