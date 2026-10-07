import { useState } from "react";
import { FreezerBag } from "../../../../core/domain/freezer";
import { Unit } from "../../../../core/domain/ingredient";
import { parseDecimal } from "../../../../shared/utils/numberUtils";
import { BagFields } from "./BagFields";

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

    const parsedQty = parseDecimal(quantity);
    const canSave = parsedQty !== null && parsedQty > 0 && addedDate.length > 0;

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
            <BagFields
                quantity={quantity}
                unit={unit}
                preparation={preparation}
                canSave={canSave}
                saving={saving}
                onQuantityChange={setQuantity}
                onUnitChange={setUnit}
                onPreparationChange={setPreparation}
                onSave={handleSave}
                onCancel={onCancel}
            />
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
