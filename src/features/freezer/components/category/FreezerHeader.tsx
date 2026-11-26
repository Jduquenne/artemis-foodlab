import { Pencil } from "lucide-react";
import { useAuthStore } from "../../../../shared/store/useAuthStore";
import { updateMe } from "../../../../core/services/authService";
import { InlineNameEditor } from "../InlineNameEditor";
import { useInlineRename } from "../../../../shared/hooks/useInlineRename";
import { PageHeading } from "../../../../shared/components/layout/PageHeading";

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
        <div className="flex-1 min-w-0">
          <PageHeading
            title={freezerName}
            titleAside={
              <button
                aria-label="Renommer"
                onClick={rename.start}
                className="shrink-0 p-1.5 rounded-lg text-slate-300 hover:text-slate-500 hover:bg-muted transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            }
            subtitle={`${categoryCount} ${categoryCount === 1 ? "catégorie" : "catégories"}`}
          />
        </div>
      )}
    </div>
  );
};
