import { Pencil, Trash2 } from "lucide-react";
import { WeeklyQuota } from "../../../../core/domain/menuGenerator";
import { HabitNames, habitTargetLabel } from "../../../../core/logic/menuGenerator/habitLogic";
import { QUOTA_COMPARATOR_LABELS, QUOTA_STRICTNESS_LABELS } from "../../../../core/logic/menuGenerator/quotaLogic";

export interface QuotaRowProps {
  quota: WeeklyQuota;
  names: HabitNames;
  disabled: boolean;
  onToggle: (enabled: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const QuotaRow = ({ quota, names, disabled, onToggle, onEdit, onDelete }: QuotaRowProps) => (
  <div className={`flex items-start gap-2 rounded-xl border border-slate-200 px-2.5 py-2 ${quota.enabled ? "" : "opacity-50"}`}>
    <input
      type="checkbox"
      checked={quota.enabled}
      disabled={disabled}
      onChange={(e) => onToggle(e.target.checked)}
      aria-label={quota.enabled ? "Désactiver le quota" : "Activer le quota"}
      className="mt-0.5 accent-orange-500"
    />
    <div className="flex-1 min-w-0">
      <p className="text-xs font-bold text-slate-800">
        {habitTargetLabel(quota.target, names)}
        <span className="ml-1.5 font-semibold text-orange-600">{QUOTA_STRICTNESS_LABELS[quota.strictness]}</span>
      </p>
      <p className="text-[11px] text-slate-500">
        {QUOTA_COMPARATOR_LABELS[quota.comparator]} {quota.count} par semaine
      </p>
    </div>
    <button type="button" onClick={onEdit} disabled={disabled} aria-label="Modifier le quota" className="p-1 rounded-lg text-slate-400 hover:text-orange-600 hover:bg-muted disabled:opacity-50">
      <Pencil size={13} />
    </button>
    <button type="button" onClick={onDelete} disabled={disabled} aria-label="Supprimer le quota" className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-muted disabled:opacity-50">
      <Trash2 size={13} />
    </button>
  </div>
);
