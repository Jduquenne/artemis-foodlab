import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { RecapEntry, isRecapChange } from "../../../../core/logic/dashboard/recap";

export interface ConfirmActionModalProps {
  title: string;
  intro?: string;
  recap?: RecapEntry[];
  emptyRecapText?: string;
  consequence?: string;
  confirmLabel: string;
  danger?: boolean;
  requireText?: string;
  requireTextLabel?: string;
  onConfirm: () => Promise<boolean>;
  onCancel: () => void;
}

export const ConfirmActionModal = ({
  title,
  intro,
  recap,
  emptyRecapText = "Aucune modification.",
  consequence,
  confirmLabel,
  danger = false,
  requireText,
  requireTextLabel,
  onConfirm,
  onCancel,
}: ConfirmActionModalProps) => {
  const [typed, setTyped] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const gateOpen = !requireText || typed.trim() === requireText;
  const disabled = submitting || !gateOpen;

  const confirm = async () => {
    if (!gateOpen) return;
    setSubmitting(true);
    try {
      await onConfirm();
    } finally {
      setSubmitting(false);
    }
  };

  const confirmClass = danger
    ? "bg-red-500 hover:bg-red-600"
    : "bg-orange-500 hover:bg-orange-600";

  return (
    <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-100 w-full max-w-sm rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[90dvh]">
        <div className="p-5 pb-3 shrink-0">
          <h2 className="text-lg font-black text-slate-900">{title}</h2>
          {intro && <p className="mt-1 text-sm text-slate-500">{intro}</p>}
        </div>

        <div className="px-5 flex flex-col gap-3 overflow-y-auto">
          {recap !== undefined && (
            recap.length === 0 ? (
              <p className="text-sm text-slate-400">{emptyRecapText}</p>
            ) : (
              <ul className="flex flex-col gap-1.5 rounded-xl bg-slate-50 dark:bg-slate-200/60 p-3">
                {recap.map((entry) => (
                  <li key={entry.label} className="flex items-baseline gap-2 text-sm">
                    <span className="shrink-0 text-xs font-bold text-slate-500">{entry.label}</span>
                    {isRecapChange(entry) ? (
                      <span className="min-w-0 text-slate-700">
                        <span className="text-slate-400 line-through break-words">{entry.from}</span>
                        {" → "}
                        <span className="font-semibold break-words">{entry.to}</span>
                      </span>
                    ) : (
                      <span className="min-w-0 text-slate-700 break-words">{entry.value}</span>
                    )}
                  </li>
                ))}
              </ul>
            )
          )}

          {consequence && (
            <div className="flex gap-2 rounded-xl bg-red-50 dark:bg-red-950/30 p-3 text-xs text-red-600 dark:text-red-400">
              <AlertTriangle size={14} className="shrink-0 mt-0.5" />
              <span>{consequence}</span>
            </div>
          )}

          {requireText && (
            <label className="flex flex-col gap-1">
              <span className="text-xs font-bold text-slate-500">
                {requireTextLabel ?? `Retapez « ${requireText} » pour confirmer`}
              </span>
              <input
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                autoComplete="off"
                className="rounded-lg border border-slate-200 bg-white dark:bg-slate-100 px-2.5 py-1.5 text-sm text-slate-800 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
              />
            </label>
          )}
        </div>

        <div className="p-5 pt-4 flex gap-2 shrink-0">
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-200 transition-colors disabled:opacity-40"
          >
            Retour
          </button>
          <button
            type="button"
            onClick={confirm}
            disabled={disabled}
            className={`flex-1 py-2.5 rounded-xl text-white text-sm font-bold transition-colors disabled:opacity-40 ${confirmClass}`}
          >
            {submitting ? "En cours…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
