import { useState } from "react";
import { Plus, X } from "lucide-react";
import { createCategory } from "../../../../core/services/freezerService";
import { FreezerColorPicker } from "./FreezerColorPicker";

export const AddCategoryForm = () => {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState<string | null>(null);

  const reset = () => {
    setAdding(false);
    setName("");
    setColor(null);
  };

  const handleConfirm = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    await createCategory(trimmed, color);
    reset();
  };

  if (adding) {
    return (
      <div className="flex flex-col gap-2.5 rounded-2xl border border-slate-200 bg-white dark:bg-slate-100 p-3">
        <div className="flex items-center gap-2">
          <input
            autoFocus
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter") handleConfirm();
              if (e.key === "Escape") reset();
            }}
            placeholder="Nom de la catégorie..."
            className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-200 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
          />
          <button
            onClick={handleConfirm}
            disabled={!name.trim()}
            className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white font-bold rounded-xl transition-colors text-sm"
          >
            Créer
          </button>
          <button
            aria-label="Annuler"
            onClick={reset}
            className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-200 rounded-xl transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wide shrink-0">Couleur</span>
          <FreezerColorPicker value={color} onChange={setColor} />
        </div>
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
