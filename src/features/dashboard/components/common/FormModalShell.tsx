import { ReactNode } from "react";
import { X } from "lucide-react";

export interface FormModalShellProps {
  title: string;
  subtitle?: string;
  errors: string[];
  onClose: () => void;
  onContinue: () => void;
  confirmation?: ReactNode;
  children: ReactNode;
}

export const FormModalShell = ({ title, subtitle, errors, onClose, onContinue, confirmation, children }: FormModalShellProps) => (
  <div className="fixed inset-0 z-100 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
    <div className="bg-surface w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[90dvh]">
      <div className="p-5 border-b border-slate-200 flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-lg font-black text-slate-900">{title}</h2>
          {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
        </div>
        <button aria-label="Fermer" onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors">
          <X size={20} className="text-slate-400" />
        </button>
      </div>

      <div className="p-5 flex flex-col gap-4 overflow-y-auto">
        {children}
        {errors.length > 0 && (
          <ul className="flex flex-col gap-1">
            {errors.map((error) => (
              <li key={error} className="text-xs text-red-500">{error}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="p-5 pt-0 flex gap-2 shrink-0">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 py-2.5 rounded-xl bg-muted text-slate-600 text-sm font-bold hover:bg-slate-200 transition-colors"
        >
          Annuler
        </button>
        <button
          type="button"
          onClick={onContinue}
          className="flex-1 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-bold hover:bg-orange-600 transition-colors"
        >
          Continuer
        </button>
      </div>
    </div>
    {confirmation}
  </div>
);
