import { Check, Loader2, X } from "lucide-react";
import { PREPARATION_OPTIONS } from "../../../../core/domain/preparationOptions";
import { Unit, SELECTABLE_UNITS } from "../../../../core/domain/ingredient";

export interface BagFieldsProps {
  quantity: string;
  unit: Unit;
  preparation: string;
  canSave: boolean;
  saving?: boolean;
  onQuantityChange: (quantity: string) => void;
  onUnitChange: (unit: Unit) => void;
  onPreparationChange: (preparation: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export const BagFields = ({
  quantity,
  unit,
  preparation,
  canSave,
  saving,
  onQuantityChange,
  onUnitChange,
  onPreparationChange,
  onSave,
  onCancel,
}: BagFieldsProps) => (
  <div className="flex items-center gap-1.5">
    <input
      autoFocus
      type="text"
      inputMode="decimal"
      value={quantity}
      onChange={e => onQuantityChange(e.target.value)}
      onKeyDown={e => { if (e.key === "Enter") onSave(); if (e.key === "Escape") onCancel(); }}
      placeholder="Qté"
      disabled={saving}
      className="w-14 px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-400 text-center disabled:opacity-50"
    />
    <select
      value={unit}
      onChange={e => onUnitChange(e.target.value as Unit)}
      disabled={saving}
      className="w-20 px-1.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:border-orange-400 disabled:opacity-50"
    >
      {SELECTABLE_UNITS.map(u => (
        <option key={u} value={u}>{u}</option>
      ))}
    </select>
    <select
      value={preparation}
      onChange={e => onPreparationChange(e.target.value)}
      disabled={saving}
      className="flex-1 min-w-0 px-1.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:border-orange-400 disabled:opacity-50"
    >
      <option value="">—</option>
      {PREPARATION_OPTIONS.map(p => (
        <option key={p} value={p}>{p}</option>
      ))}
    </select>
    <button
      aria-label="Confirmer"
      onClick={onSave}
      disabled={!canSave || saving}
      className="p-1.5 rounded-lg text-orange-500 hover:bg-orange-50 disabled:opacity-40 transition-colors shrink-0"
    >
      {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
    </button>
    <button
      aria-label="Annuler"
      onClick={onCancel}
      disabled={saving}
      className="p-1.5 rounded-lg text-slate-400 hover:bg-muted transition-colors shrink-0 disabled:opacity-40"
    >
      <X className="w-3.5 h-3.5" />
    </button>
  </div>
);
