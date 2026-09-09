import { useState, useRef, useEffect } from "react";
import { MoreVertical, Pencil, Trash2, Snowflake, Palette } from "lucide-react";
import { FreezerCategory } from "../../../../core/domain/types";
import { updateCategoryName, updateCategoryColor, deleteCategory } from "../../../../core/services/freezerService";
import {
  getFreezerCategoryAccent,
  sortFreezerItemsAlphabetically,
  summarizeFreezerCategory,
} from "../../../../core/logic/freezer/freezerLogic";
import { InlineNameEditor } from "../InlineNameEditor";
import { FreezerColorPicker } from "./FreezerColorPicker";

export interface FreezerCategoryCardProps {
  category: FreezerCategory;
  onClick: () => void;
}

export const FreezerCategoryCard = ({ category, onClick }: FreezerCategoryCardProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [picking, setPicking] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [nameInput, setNameInput] = useState(category.name);
  const menuRef = useRef<HTMLDivElement>(null);

  const closeMenu = () => {
    setMenuOpen(false);
    setPicking(false);
  };

  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        closeMenu();
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  const handleRename = async () => {
    const trimmed = nameInput.trim();
    if (trimmed && trimmed !== category.name) await updateCategoryName(category.id, trimmed);
    setRenaming(false);
    closeMenu();
  };

  const handleCancelRename = () => {
    setNameInput(category.name);
    setRenaming(false);
  };

  const handleDelete = async () => {
    closeMenu();
    await deleteCategory(category.id);
  };

  const handlePickColor = async (color: string | null) => {
    closeMenu();
    if (color !== category.color) await updateCategoryColor(category.id, color);
  };

  const accent = getFreezerCategoryAccent(category);
  const summary = summarizeFreezerCategory(category);
  const previewItems = sortFreezerItemsAlphabetically(category.items).slice(0, 7);
  const extra = summary.total - previewItems.length;

  const countLine =
    summary.total === 0
      ? "Vide"
      : `${summary.total} article${summary.total > 1 ? "s" : ""}` +
        (summary.portions > 0 ? ` · ${summary.portions} portion${summary.portions > 1 ? "s" : ""}` : "");

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={e => { if (e.key === "Enter" || e.key === " ") onClick(); }}
      className={`group relative bg-white dark:bg-slate-100 rounded-2xl border border-slate-200 shadow-sm flex flex-col cursor-pointer transition duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-orange-300 md:min-h-[8.5rem] ${menuOpen ? "z-30" : ""}`}
    >
      <div className="flex-1 flex flex-col gap-2 px-4 py-3 md:py-4">
        <div className={`h-1 w-10 rounded-full ${accent.bar}`} />

        <div className="flex items-start gap-2.5">
          <div className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center ${accent.badge}`}>
            <Snowflake className="w-4 h-4" />
          </div>

          <div className="flex-1 min-w-0">
            {renaming ? (
              <InlineNameEditor
                value={nameInput}
                onChange={setNameInput}
                onConfirm={handleRename}
                onCancel={handleCancelRename}
                inputClassName="text-sm font-bold"
              />
            ) : (
              <span className="block text-sm font-bold text-slate-800 truncate">{category.name}</span>
            )}
            <p className="text-xs text-slate-400 mt-0.5 truncate">{countLine}</p>
          </div>

          <div className="relative shrink-0 -mt-1 -mr-1" ref={menuRef} onClick={e => e.stopPropagation()}>
            <button
              aria-label="Options"
              onClick={e => { e.stopPropagation(); setMenuOpen(o => !o); setPicking(false); }}
              className="p-1.5 rounded-lg text-slate-300 group-hover:text-slate-400 hover:!text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-200 transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-8 z-20 bg-white dark:bg-slate-100 border border-slate-200 rounded-2xl shadow-lg overflow-hidden min-w-40">
                <button
                  onClick={e => { e.stopPropagation(); setRenaming(true); closeMenu(); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-200 transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" /> Renommer
                </button>
                <button
                  onClick={e => { e.stopPropagation(); setPicking(p => !p); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-200 transition-colors border-t border-slate-100"
                >
                  <Palette className="w-3.5 h-3.5" /> Couleur
                </button>
                {picking && (
                  <div className="px-4 py-3 border-t border-slate-100">
                    <FreezerColorPicker value={category.color} onChange={handlePickColor} />
                  </div>
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

        {summary.total === 0 ? (
          <p className="flex-1 text-xs text-slate-300">Touche pour ajouter des articles</p>
        ) : (
          <div className="flex flex-wrap content-start gap-1">
            {previewItems.map(item => {
              const isBatch = item.type === "batch";
              const name = isBatch ? item.recipeName : item.name;
              return (
                <span
                  key={item.id}
                  className={`text-xs px-2 py-0.5 rounded-full truncate max-w-[8.5rem] ${
                    isBatch
                      ? "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-300"
                      : "bg-slate-100 dark:bg-slate-200 text-slate-600"
                  }`}
                >
                  {name}
                  {isBatch && item.portions > 0 ? ` ·${item.portions}` : ""}
                </span>
              );
            })}
            {extra > 0 && (
              <span className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-200 text-slate-400 rounded-full">
                +{extra}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
