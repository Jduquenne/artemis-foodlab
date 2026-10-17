import { ReactNode } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Switch } from "./Switch";

export interface RuleCardProps {
  icon: ReactNode;
  title: string;
  subtitle: string;
  badge?: ReactNode;
  enabled?: boolean;
  disabled: boolean;
  deleteDisabledReason?: string;
  onToggle?: (enabled: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const RuleCard = ({ icon, title, subtitle, badge, enabled = true, disabled, deleteDisabledReason, onToggle, onEdit, onDelete }: RuleCardProps) => (
  <div className={`group flex items-center gap-2.5 rounded-xl border border-slate-200 bg-surface px-2.5 py-2 transition-opacity ${enabled ? "" : "opacity-55"}`}>
    {icon}
    <button type="button" onClick={onEdit} disabled={disabled} className="flex-1 min-w-0 text-left disabled:cursor-default">
      <span className="flex items-center gap-1.5">
        <span className="truncate text-xs font-bold text-slate-800">{title}</span>
        {badge}
      </span>
      <span className="block truncate text-[11px] text-slate-500 first-letter:uppercase">{subtitle}</span>
    </button>
    <div className="flex shrink-0 items-center gap-0.5">
      <button type="button" onClick={onEdit} disabled={disabled} aria-label="Modifier" title="Modifier" className="p-1.5 rounded-lg text-slate-400 hover:text-orange-600 hover:bg-muted disabled:opacity-40">
        <Pencil size={13} />
      </button>
      <button
        type="button"
        onClick={onDelete}
        disabled={disabled || deleteDisabledReason !== undefined}
        aria-label="Supprimer"
        title={deleteDisabledReason ?? "Supprimer"}
        className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-muted disabled:opacity-30"
      >
        <Trash2 size={13} />
      </button>
      {onToggle && <Switch checked={enabled} onChange={onToggle} disabled={disabled} label={enabled ? "Désactiver" : "Activer"} />}
    </div>
  </div>
);
