import { useState } from "react";
import { X, Check } from "lucide-react";
import { useJournalStore } from "../../../../shared/store/useJournalStore";

export interface MacroTargetsModalProps {
  onClose: () => void;
}

const FIELDS = [
  { key: "kcal" as const, label: "Calories", unit: "kcal", min: 500, max: 5000, step: 50 },
  { key: "proteins" as const, label: "Protéines", unit: "g", min: 10, max: 500, step: 5 },
  { key: "lipids" as const, label: "Lipides", unit: "g", min: 10, max: 300, step: 5 },
  { key: "carbohydrates" as const, label: "Glucides", unit: "g", min: 10, max: 600, step: 5 },
  { key: "fibers" as const, label: "Fibres", unit: "g", min: 5, max: 100, step: 1 },
];

export const MacroTargetsModal = ({ onClose }: MacroTargetsModalProps) => {
  const { kcalTarget, macroTargets, setKcalTarget, setMacroTargets } = useJournalStore();
  const [isClosing, setIsClosing] = useState(false);
  const [draft, setDraft] = useState({
    kcal: String(kcalTarget),
    proteins: String(macroTargets.proteins),
    lipids: String(macroTargets.lipids),
    carbohydrates: String(macroTargets.carbohydrates),
    fibers: String(macroTargets.fibers),
  });

  const handleClose = () => { setIsClosing(true); setTimeout(onClose, 220); };

  const handleChange = (key: keyof typeof draft, value: string) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    const kcal = parseInt(draft.kcal, 10);
    const proteins = parseInt(draft.proteins, 10);
    const lipids = parseInt(draft.lipids, 10);
    const carbohydrates = parseInt(draft.carbohydrates, 10);
    const fibers = parseInt(draft.fibers, 10);
    if ([kcal, proteins, lipids, carbohydrates, fibers].some(isNaN)) return;
    setKcalTarget(kcal);
    setMacroTargets({ proteins, lipids, carbohydrates, fibers });
    handleClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div
        className={`w-full max-w-xs bg-white dark:bg-slate-100 rounded-2xl shadow-2xl flex flex-col overflow-hidden ${
          isClosing ? "modal-center-exit" : "modal-center-enter"
        }`}
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-slate-100">
          <p className="text-xs font-black text-orange-600 uppercase tracking-widest">
            Objectifs nutritionnels
          </p>
          <button
            onClick={handleClose}
            aria-label="Fermer"
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-3 flex flex-col gap-3">
          {FIELDS.map(({ key, label, unit, min, max, step }) => (
            <div key={key} className="flex items-center justify-between gap-3">
              <label htmlFor={`macro-input-${key}`} className="text-sm font-semibold text-slate-600 shrink-0">{label}</label>
              <div className="flex items-center gap-1.5">
                <input
                  id={`macro-input-${key}`}
                  type="number"
                  min={min}
                  max={max}
                  step={step}
                  value={draft[key]}
                  onChange={(e) => handleChange(key, e.target.value)}
                  className="w-20 text-right text-sm font-bold bg-slate-50 dark:bg-slate-200 border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-orange-400 text-slate-800"
                />
                <span className="text-xs text-slate-400 w-6">{unit}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-end gap-3 px-5 pb-5 pt-2 border-t border-slate-100">
          <button
            onClick={handleClose}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-200 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-bold bg-orange-500 hover:bg-orange-600 text-white transition-colors"
          >
            <Check className="w-4 h-4" />
            Valider
          </button>
        </div>
      </div>
    </div>
  );
};
