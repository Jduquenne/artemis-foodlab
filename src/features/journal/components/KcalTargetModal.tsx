import { useState } from "react";
import { X, Check } from "lucide-react";

export interface KcalTargetModalProps {
  current: number;
  onSubmit: (value: number) => void;
  onClose: () => void;
}

export const KcalTargetModal = ({ current, onSubmit, onClose }: KcalTargetModalProps) => {
  const [value, setValue] = useState(String(current));
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 220);
  };

  const handleSubmit = () => {
    const num = parseInt(value, 10);
    if (!isNaN(num) && num > 0) {
      onSubmit(num);
      handleClose();
    }
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
            Objectif calorique
          </p>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-4">
          <label className="block text-xs font-semibold text-slate-500 mb-2">
            Calories par jour (kcal)
          </label>
          <input
            type="number"
            min="500"
            max="5000"
            step="50"
            value={value}
            autoFocus
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            className="w-full text-right text-xl font-bold bg-slate-50 dark:bg-slate-200 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-400 text-slate-800"
          />
        </div>

        <div className="flex items-center justify-end gap-3 px-5 pb-5">
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
