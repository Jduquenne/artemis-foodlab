import { useState, useRef, useEffect } from "react";
import { MoreVertical, Pencil, Trash2, ChevronUp, ChevronDown, Check, X } from "lucide-react";
import { FreezerCategory } from "../../../core/domain/types";
import { updateCategoryName, deleteCategory, moveCategory } from "../../../core/services/freezerService";

interface FreezerCategoryCardProps {
  category: FreezerCategory;
  isFirst: boolean;
  isLast: boolean;
  onClick: () => void;
}

export const FreezerCategoryCard = ({ category, isFirst, isLast, onClick }: FreezerCategoryCardProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [nameInput, setNameInput] = useState(category.name);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  const handleRename = async () => {
    const trimmed = nameInput.trim();
    if (trimmed && trimmed !== category.name) await updateCategoryName(category.id, trimmed);
    setRenaming(false);
    setMenuOpen(false);
  };

  const handleDelete = async () => {
    setMenuOpen(false);
    await deleteCategory(category.id);
  };

  const preview = category.items.slice(0, 3).map(i =>
    i.type === "food" ? i.name : i.recipeName
  );
  const extra = category.items.length - preview.length;

  return (
    <div className="bg-white dark:bg-slate-100 rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex items-center gap-2 px-4 pt-3 pb-2">
        {renaming ? (
          <div className="flex-1 flex items-center gap-2 min-w-0">
            <input
              autoFocus
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter") handleRename();
                if (e.key === "Escape") { setNameInput(category.name); setRenaming(false); }
              }}
              onClick={e => e.stopPropagation()}
              className="flex-1 min-w-0 text-sm font-bold bg-transparent border-b-2 border-orange-400 text-slate-900 focus:outline-none"
            />
            <button onClick={e => { e.stopPropagation(); handleRename(); }} className="p-1 rounded-lg text-orange-500 hover:bg-orange-50 transition-colors">
              <Check className="w-3.5 h-3.5" />
            </button>
            <button onClick={e => { e.stopPropagation(); setNameInput(category.name); setRenaming(false); }} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-200 transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button className="flex-1 min-w-0 text-left" onClick={onClick}>
            <span className="text-sm font-bold text-slate-800 truncate block">{category.name}</span>
          </button>
        )}

        <div className="flex items-center gap-1 shrink-0">
          <span className="text-xs font-bold text-slate-400 min-w-[1.25rem] text-center">
            {category.items.length}
          </span>
          <div className="relative" ref={menuRef}>
            <button
              onClick={e => { e.stopPropagation(); setMenuOpen(o => !o); }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-200 transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-8 z-20 bg-white dark:bg-slate-100 border border-slate-200 rounded-2xl shadow-lg overflow-hidden min-w-36">
                <button
                  onClick={e => { e.stopPropagation(); setRenaming(true); setMenuOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-200 transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" /> Renommer
                </button>
                {!isFirst && (
                  <button
                    onClick={e => { e.stopPropagation(); setMenuOpen(false); moveCategory(category.id, "up"); }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-200 transition-colors"
                  >
                    <ChevronUp className="w-3.5 h-3.5" /> Monter
                  </button>
                )}
                {!isLast && (
                  <button
                    onClick={e => { e.stopPropagation(); setMenuOpen(false); moveCategory(category.id, "down"); }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-200 transition-colors"
                  >
                    <ChevronDown className="w-3.5 h-3.5" /> Descendre
                  </button>
                )}
                <button
                  onClick={e => { e.stopPropagation(); handleDelete(); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors border-t border-slate-100"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Supprimer
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <button className="w-full text-left px-4 pb-3" onClick={onClick}>
        {category.items.length === 0 ? (
          <p className="text-xs text-slate-400 italic">Vide</p>
        ) : (
          <div className="flex flex-wrap gap-1">
            {preview.map((name, i) => (
              <span key={i} className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-200 text-slate-600 rounded-full truncate max-w-[140px]">
                {name}
              </span>
            ))}
            {extra > 0 && (
              <span className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-200 text-slate-400 rounded-full">
                +{extra}
              </span>
            )}
          </div>
        )}
      </button>
    </div>
  );
};
