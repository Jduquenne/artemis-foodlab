import { useState } from "react";
import { FreezerBag } from "../../../../core/domain/freezer";
import { Unit } from "../../../../core/domain/ingredient";
import { parseDecimal } from "../../../../core/utils/numberUtils";
import { BagFields } from "./BagFields";

export interface AddBagFormProps {
  onSave: (bag: Omit<FreezerBag, "id" | "addedDate">) => void;
  onCancel: () => void;
  initialUnit?: Unit;
  saving?: boolean;
}

export const AddBagForm = ({ onSave, onCancel, initialUnit = Unit.G, saving }: AddBagFormProps) => {
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState<Unit>(initialUnit);
  const [preparation, setPreparation] = useState<string>("");

  const parsedQty = parseDecimal(quantity);
  const canSave = parsedQty !== null && parsedQty > 0;

  const handleSave = () => {
    if (!canSave || saving) return;
    onSave({
      quantity: parsedQty,
      unit,
      preparation: preparation || undefined,
    });
  };

  return (
    <div className="pt-2 mt-1 border-t border-slate-100">
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
    </div>
  );
};
