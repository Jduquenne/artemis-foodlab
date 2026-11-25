import { BatchUnit } from "../../../../core/domain/freezer";
import { formatBatchQuantity } from "../../../../core/logic/freezer/batchQuantityLogic";
import { DecimalInput } from "../../../../shared/components/ui/DecimalInput";

export interface FrozenBaseAmountFieldsProps {
  baseName: string;
  unit: BatchUnit;
  available: number;
  persons: number | null;
  quantity: number | null;
  suggested: number | null;
  error: string | null;
  disabled: boolean;
  onPersonsChange: (persons: number | null) => void;
  onQuantityChange: (quantity: number | null) => void;
}

const INPUT_CLASS =
  "w-full px-3 py-2.5 bg-surface border border-slate-200 rounded-xl text-sm font-bold text-slate-900 tabular-nums focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 disabled:opacity-50";

export const FrozenBaseAmountFields = ({
  baseName,
  unit,
  available,
  persons,
  quantity,
  suggested,
  error,
  disabled,
  onPersonsChange,
  onQuantityChange,
}: FrozenBaseAmountFieldsProps) => (
  <div className="flex flex-col gap-2">
    <div className="grid grid-cols-2 gap-3">
      <label className="flex flex-col gap-1">
        <span className="text-xs font-bold text-slate-500">Personnes</span>
        <DecimalInput
          value={persons}
          onValueChange={onPersonsChange}
          min={1}
          integer
          disabled={disabled}
          aria-label="Nombre de personnes pour ce repas"
          className={INPUT_CLASS}
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-xs font-bold text-slate-500">
          {baseName} ({unit === "g" ? "g" : "portions"})
        </span>
        <DecimalInput
          value={quantity}
          onValueChange={onQuantityChange}
          integer={unit === "portion"}
          disabled={disabled}
          aria-label={`Quantité de ${baseName} prise au congélateur`}
          className={INPUT_CLASS}
        />
      </label>
    </div>
    <p className="text-xs text-slate-400">
      {suggested !== null ? `La recette en demande environ ${formatBatchQuantity(unit, suggested)}. ` : ""}
      Au congélateur : {formatBatchQuantity(unit, available)}. La quantité est retirée du lot à l'enregistrement.
    </p>
    {error && <p className="text-xs font-medium text-red-500">{error}</p>}
  </div>
);
