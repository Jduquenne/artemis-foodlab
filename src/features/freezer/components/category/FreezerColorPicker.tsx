import { Check } from "lucide-react";
import { FREEZER_ACCENTS, FREEZER_COLOR_KEYS } from "../../../../core/logic/freezer/freezerLogic";

export interface FreezerColorPickerProps {
  value: string | null;
  onChange: (color: string | null) => void;
}

export const FreezerColorPicker = ({ value, onChange }: FreezerColorPickerProps) => (
  <div className="flex flex-wrap gap-1.5">
    <button
      type="button"
      onClick={() => onChange(null)}
      title="Couleur automatique"
      className={`w-6 h-6 rounded-full border flex items-center justify-center text-[9px] font-black transition ${
        value === null
          ? "border-slate-800 text-slate-800"
          : "border-slate-200 text-slate-300 hover:border-slate-400"
      }`}
    >
      A
    </button>
    {FREEZER_COLOR_KEYS.map((key) => (
      <button
        key={key}
        type="button"
        onClick={() => onChange(key)}
        title={key}
        className={`w-6 h-6 rounded-full flex items-center justify-center transition ${FREEZER_ACCENTS[key].swatch} ${
          value === key ? "ring-2 ring-offset-1 ring-slate-800" : "hover:scale-110"
        }`}
      >
        {value === key && <Check className="w-3.5 h-3.5 text-white" />}
      </button>
    ))}
  </div>
);
