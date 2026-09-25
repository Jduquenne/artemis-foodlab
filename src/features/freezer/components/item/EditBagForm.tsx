import { useState } from "react";
import { Check, Loader2, X } from "lucide-react";
import { PREPARATION_OPTIONS } from "../../../../core/domain/preparationOptions";
import { FreezerBag } from "../../../../core/domain/freezer";
import { Unit } from "../../../../core/domain/ingredient";
import { FREEZER_BAG_UNITS } from "../../../../core/logic/freezer/freezerLogic";

export interface EditBagFormProps {
    bag: FreezerBag;
    onSave: (updates: Omit<FreezerBag, "id">) => void;
    onCancel: () => void;
    saving?: boolean;
}

export const EditBagForm = ({ bag, onSave, onCancel, saving }: EditBagFormProps) => {
    const [quantity, setQuantity] = useState(String(bag.quantity));
    const [unit, setUnit] = useState<Unit>(bag.unit ?? Unit.G);
    const [preparation, setPreparation] = useState<string>(bag.preparation ?? "");
    const [addedDate, setAddedDate] = useState(bag.addedDate);

    const parsedQty = parseFloat(quantity);
    const canSave = !isNaN(parsedQty) && parsedQty > 0 && addedDate.length > 0;

    const handleSave = () => {
        if (!canSave || saving) return;
        onSave({
            quantity: parsedQty,
            unit,
            preparation: preparation || undefined,
            addedDate,
        });
    };

    return (
        <div className="flex flex-col gap-1.5 pt-2 mt-1 border-t border-orange-100">
            <div className="flex items-center gap-1.5">
                <input
                    autoFocus
                    type="text"
                    inputMode="decimal"
                    value={quantity}
                    onChange={e => setQuantity(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") onCancel(); }}
                    placeholder="Qté"
                    disabled={saving}
                    className="w-14 px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-400 text-center disabled:opacity-50"
                />
                <select
                    value={unit}
                    onChange={e => setUnit(e.target.value as Unit)}
                    disabled={saving}
                    className="w-20 px-1.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:border-orange-400 disabled:opacity-50"
                >
                    {FREEZER_BAG_UNITS.map(u => (
                        <option key={u} value={u}>{u}</option>
                    ))}
                </select>
                <select
                    value={preparation}
                    onChange={e => setPreparation(e.target.value as string)}
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
                    onClick={handleSave}
                    disabled={!canSave || saving}
                    className="p-1.5 rounded-lg text-orange-500 hover:bg-orange-50 disabled:opacity-40 transition-colors shrink-0"
                >
                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                </button>
                <button
                    aria-label="Annuler"
                    onClick={onCancel}
                    disabled={saving}
                    className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-200 transition-colors shrink-0 disabled:opacity-40"
                >
                    <X className="w-3.5 h-3.5" />
                </button>
            </div>
            <div className="flex items-center gap-2 px-0.5">
                <span className="text-xs text-slate-400 shrink-0">Mise en congélateur</span>
                <input
                    type="date"
                    value={addedDate}
                    onChange={e => setAddedDate(e.target.value)}
                    disabled={saving}
                    className="flex-1 min-w-0 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:border-orange-400 disabled:opacity-50"
                />
            </div>
        </div>
    );
};
