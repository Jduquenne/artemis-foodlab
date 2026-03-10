import { Macronutrients } from "../../../core/domain/types";

export interface MacroSummaryProps {
  macros: Macronutrients;
}

const ITEMS: { key: keyof Macronutrients; label: string }[] = [
  { key: "proteins", label: "Protéines" },
  { key: "lipids", label: "Lipides" },
  { key: "carbohydrates", label: "Glucides" },
  { key: "fibers", label: "Fibres" },
];

export const MacroSummary = ({ macros }: MacroSummaryProps) => {
  return (
    <div className="grid grid-cols-4 gap-2 shrink-0">
      {ITEMS.map(({ key, label }) => (
        <div
          key={key}
          className="bg-white dark:bg-slate-100 rounded-xl px-2 py-2.5 flex flex-col items-center gap-0.5"
        >
          <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wide text-slate-400 leading-none">
            {label}
          </span>
          <span className="text-sm sm:text-base font-black text-slate-800 leading-none">
            {Math.round(macros[key])}
            <span className="text-[10px] font-medium text-slate-400 ml-0.5">g</span>
          </span>
        </div>
      ))}
    </div>
  );
};
