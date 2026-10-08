import { Pencil, Trash2 } from "lucide-react";

export interface RowActionsProps {
  name: string;
  onEdit: () => void;
  onDelete: () => void;
}

export const RowActions = ({ name, onEdit, onDelete }: RowActionsProps) => (
  <>
    <button
      type="button"
      aria-label={`Modifier ${name}`}
      onClick={onEdit}
      className="p-1.5 rounded-lg text-slate-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/30 transition-colors"
    >
      <Pencil size={15} />
    </button>
    <button
      type="button"
      aria-label={`Supprimer ${name}`}
      onClick={onDelete}
      className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
    >
      <Trash2 size={15} />
    </button>
  </>
);
