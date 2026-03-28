import { useState, useMemo, useRef } from "react";
import { ArrowLeft, Plus, Pencil } from "lucide-react";
import { FreezerCategory } from "../../../../core/domain/types";
import { removeItemFromCategory, updateCategoryName } from "../../../../core/services/freezerService";
import { FreezerItemRow } from "../item/FreezerItemRow";
import { AddFreezerItemModal } from "../modal/AddFreezerItemModal";
import { InlineNameEditor } from "../InlineNameEditor";
import { markScrolling } from "../../../../shared/utils/scrollGuard";
import { useColCount } from "../../../../shared/hooks/useColCount";
import { distributeToColumns } from "../../../../shared/utils/columnUtils";

export interface FreezerCategoryDetailProps {
  category: FreezerCategory;
  onBack: () => void;
}

const itemHeight = (item: FreezerCategory["items"][number]) =>
  item.type === "batch" ? 1 : 1 + item.bags.length;

export const FreezerCategoryDetail = ({ category, onBack }: FreezerCategoryDetailProps) => {
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState(category.name);

  const colCount = Math.min(useColCount(), 3);

  const frozenIdsRef = useRef('');
  const frozenColCountRef = useRef(0);
  const frozenMapRef = useRef<Map<string, number>>(new Map());

  const currentIds = category.items.map(i => i.id).join(',');
  if (currentIds !== frozenIdsRef.current || colCount !== frozenColCountRef.current) {
    frozenIdsRef.current = currentIds;
    frozenColCountRef.current = colCount;
    const dist = distributeToColumns(category.items, itemHeight, colCount);
    const map = new Map<string, number>();
    dist.forEach((col, ci) => col.forEach(item => map.set(item.id, ci)));
    frozenMapRef.current = map;
  }

  const columns = useMemo(() => {
    const colArrays: FreezerCategory["items"][] = Array.from({ length: colCount }, () => []);
    for (const item of category.items) {
      const ci = frozenMapRef.current.get(item.id) ?? 0;
      colArrays[ci].push(item);
    }
    return colArrays;
  }, [category.items, colCount]);

  const existingFoodNames = useMemo(
    () => category.items.filter(i => i.type === "food").map(i => i.name),
    [category.items]
  );

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
          aria-label="Retour"
          onClick={onBack}
          className="p-2 rounded-xl text-slate-400 hover:text-orange-600 hover:bg-orange-50 transition-colors shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {editing ? (
          <InlineNameEditor
            value={nameInput}
            onChange={setNameInput}
            onConfirm={handleRename}
            onCancel={handleCancelRename}
            inputClassName="text-xl font-black"
            className="animate-fade-in-up"
          />
        ) : (
          <div className="flex-1 flex items-center gap-2 min-w-0">
            <h1 className="text-xl font-black text-slate-900 truncate">{category.name}</h1>
            <button
              aria-label="Renommer"
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
          <div className="grid gap-2 pb-4" style={{ gridTemplateColumns: `repeat(${colCount}, 1fr)` }}>
            {columns.map((col, ci) => (
              <div key={ci} className="flex flex-col gap-2">
                {col.map(item => (
                  <FreezerItemRow
                    key={item.id}
                    item={item}
                    categoryId={category.id}
                    onDelete={() => removeItemFromCategory(category.id, item.id)}
                  />
                ))}
              </div>
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

      {addOpen && <AddFreezerItemModal categoryId={category.id} existingFoodNames={existingFoodNames} onClose={() => setAddOpen(false)} />}
    </div>
  );
};
