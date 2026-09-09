import { useState } from "react";
import { OutdoorEntry } from "../../../../core/domain/types";

export interface ConfirmDeleteOutdoorModalProps {
  activity: OutdoorEntry;
  onCancel: () => void;
  onConfirm: (code: string) => Promise<boolean>;
}

export const ConfirmDeleteOutdoorModal = ({ activity, onCancel, onConfirm }: ConfirmDeleteOutdoorModalProps) => {
  const [submitting, setSubmitting] = useState(false);

  const confirm = async () => {
    setSubmitting(true);
    const ok = await onConfirm(activity.code);
    setSubmitting(false);
    if (ok) onCancel();
  };

  return (
    <div className="fixed inset-0 z-100 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-100 w-full max-w-sm rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-black text-slate-900">Supprimer cette activité ?</h2>
          <p className="text-sm text-slate-500">
            <span className="font-semibold text-slate-700">{activity.name}</span> sera retirée du catalogue. Si un
            planning l'utilise encore, l'API refusera la suppression.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-200 transition-colors disabled:opacity-40"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={confirm}
            disabled={submitting}
            className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-colors disabled:opacity-40"
          >
            {submitting ? "Suppression…" : "Supprimer"}
          </button>
        </div>
      </div>
    </div>
  );
};
