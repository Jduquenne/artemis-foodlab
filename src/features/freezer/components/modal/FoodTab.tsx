import { Unit } from "../../../../core/domain/types";
import { FoodSearchInput } from "./FoodSearchInput";

export interface FoodTabProps {
  foodName: string;
  foodId: string | undefined;
  foodQty: string;
  foodUnit: Unit;
  foodPreparation: string;
  onNameChange: (name: string, id?: string) => void;
  onQtyChange: (qty: string) => void;
  onUnitChange: (unit: Unit) => void;
  onPreparationChange: (prep: string) => void;
}

export const FoodTab = ({
  foodName,
  foodId,
  foodQty,
  foodUnit,
  foodPreparation,
  onNameChange,
  onQtyChange,
  onUnitChange,
  onPreparationChange,
}: FoodTabProps) => (
  <>
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Nom</label>
      <FoodSearchInput value={foodName} onChange={onNameChange} />
      {foodId && (
        <p className="text-xs text-orange-500 font-medium pl-1">✓ Lié à la base d'aliments</p>
      )}
    </div>
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
        Préparation <span className="normal-case font-normal">(optionnel)</span>
      </label>
      <input
        type="text"
        value={foodPreparation}
        onChange={e => onPreparationChange(e.target.value)}
        placeholder="Ex: émincé, en rondelles, entier..."
        className="w-full px-4 py-3 bg-white dark:bg-slate-100 border border-slate-200 rounded-2xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
      />
    </div>
    <div className="flex gap-3">
      <div className="flex flex-col gap-1.5 flex-1">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Quantité</label>
        <input
          type="text"
          inputMode="decimal"
          value={foodQty}
          onChange={e => onQtyChange(e.target.value)}
          placeholder="500"
          className="w-full px-4 py-3 bg-white dark:bg-slate-100 border border-slate-200 rounded-2xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
        />
      </div>
      <div className="flex flex-col gap-1.5 w-36">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Unité</label>
        <select
          value={foodUnit}
          onChange={e => onUnitChange(e.target.value as Unit)}
          className="w-full px-3 py-3 bg-white dark:bg-slate-100 border border-slate-200 rounded-2xl text-sm text-slate-800 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
        >
          {Object.values(Unit).map(u => (
            <option key={u} value={u}>{u || "unité"}</option>
          ))}
        </select>
      </div>
    </div>
  </>
);
