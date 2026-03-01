import { useState } from "react";
import { Check, X } from "lucide-react";
import { Unit, FreezerBag } from "../../../core/domain/types";

const FOOD_UNITS: { value: Unit; label: string }[] = [
  { value: Unit.G, label: "g" },
  { value: Unit.KG, label: "kg" },
  { value: Unit.ML, label: "ml" },
  { value: Unit.CL, label: "cl" },
  { value: Unit.L, label: "l" },
  { value: Unit.PORTION, label: "portion(s)" },
  { value: Unit.PACKET, label: "sachet(s)" },
  { value: Unit.SLICE, label: "tranche(s)" },
  { value: Unit.NONE, label: "unité(s)" },
];

interface AddBagFormProps {
  onSave: (bag: Omit<FreezerBag, "id" | "addedDate">) => void;
  onCancel: () => void;
  initialUnit?: Unit;
}

export const AddBagForm = ({ onSave, onCancel, initialUnit = Unit.G }: AddBagFormProps) => {
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState<Unit>(initialUnit);
  const [preparation, setPreparation] = useState("");

  const canSave = quantity.trim().length > 0;

  const handleSave = () => {
    if (!canSave) return;
    onSave({
      quantity: quantity.trim(),
      unit,
      preparation: preparation.trim() || undefined,
    });
  };

  return (
    <div className="flex items-center gap-1.5 pt-2 mt-1 border-t border-slate-100">
      <input
        autoFocus
        type="text"
        inputMode="decimal"
        value={quantity}
        onChange={e => setQuantity(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") onCancel(); }}
        placeholder="Qté"
        className="w-14 px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-400 text-center"
      />
      <select
        value={unit}
        onChange={e => setUnit(e.target.value as Unit)}
        className="w-20 px-1.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:border-orange-400"
      >
        {FOOD_UNITS.map(u => (
          <option key={u.value} value={u.value}>{u.label}</option>
        ))}
      </select>
      <input
        type="text"
        value={preparation}
        onChange={e => setPreparation(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") onCancel(); }}
        placeholder="Préparation (optionnel)"
        className="flex-1 min-w-0 px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-400"
      />
      <button
        onClick={handleSave}
        disabled={!canSave}
        className="p-1.5 rounded-lg text-orange-500 hover:bg-orange-50 disabled:opacity-40 transition-colors shrink-0"
      >
        <Check className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={onCancel}
        className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-200 transition-colors shrink-0"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
