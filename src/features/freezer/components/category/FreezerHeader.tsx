import { Pencil } from "lucide-react";
import { useAuthStore } from "../../../../shared/store/useAuthStore";
import { updateMe } from "../../../../core/services/authService";
import { InlineNameEditor } from "../InlineNameEditor";
import { useInlineRename } from "../../../../shared/hooks/useInlineRename";

export interface FreezerHeaderProps {
  categoryCount: number;
}

export const FreezerHeader = ({ categoryCount }: FreezerHeaderProps) => {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const freezerName = user?.freezerName ?? "Mon Congélateur";
  const rename = useInlineRename(freezerName, "freezer-rename", async (name) => setUser(await updateMe({ freezerName: name })));

  return (
    <div className="flex items-center gap-3 shrink-0">
      {rename.editing ? (
        <InlineNameEditor
          value={rename.value}
          onChange={rename.setValue}
          onConfirm={rename.confirm}
          onCancel={rename.cancel}
          inputClassName="text-xl font-black"
          pending={rename.pending}
        />
      ) : (
        <div className="flex-1 flex items-center gap-2 min-w-0">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 truncate">{freezerName}</h1>
          <button
            aria-label="Renommer"
            onClick={rename.start}
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
