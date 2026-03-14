import { useState } from "react";
import { Pencil } from "lucide-react";
import { useFreezerStore } from "../../../../shared/store/useFreezerStore";
import { InlineNameEditor } from "../InlineNameEditor";

export interface FreezerHeaderProps {
  categoryCount: number;
}

export const FreezerHeader = ({ categoryCount }: FreezerHeaderProps) => {
  const { freezerName, setFreezerName } = useFreezerStore();
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState(freezerName);

  const handleConfirm = () => {
    const trimmed = nameInput.trim();
    if (trimmed) setFreezerName(trimmed);
    else setNameInput(freezerName);
    setEditing(false);
  };

  const handleCancel = () => {
    setNameInput(freezerName);
    setEditing(false);
  };

  return (
    <div className="flex items-center gap-3 shrink-0">
      {editing ? (
        <InlineNameEditor
          value={nameInput}
          onChange={setNameInput}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
          inputClassName="text-xl font-black"
        />
      ) : (
        <div className="flex-1 flex items-center gap-2 min-w-0">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 truncate">{freezerName}</h1>
          <button
            aria-label="Renommer"
            onClick={() => { setNameInput(freezerName); setEditing(true); }}
            className="shrink-0 p-1.5 rounded-lg text-slate-300 hover:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-200 transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
      <span className="shrink-0 text-sm font-bold text-slate-400">
        {categoryCount} {categoryCount === 1 ? "catégorie" : "catégories"}
      </span>
    </div>
  );
};
