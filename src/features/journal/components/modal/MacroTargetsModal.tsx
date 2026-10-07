import { useMemo, useState } from "react";
import { X, Check } from "lucide-react";
import { useProfileStore } from "../../../../shared/store/useProfileStore";
import { useActiveProfile, useActiveTargets } from "../../../../shared/hooks/useActiveProfile";
import { atwaterKcal } from "../../../../core/logic/nutrition/atwaterLogic";
import { NUTRIENT_DEFINITIONS, NutrientKey } from "../../../../core/domain/nutrition";
import { DecimalInput } from "../../../../shared/components/ui/DecimalInput";
import { usePendingKey } from "../../../../shared/hooks/usePendingKey";
import { withPending } from "../../../../shared/utils/withPending";

export interface MacroTargetsModalProps {
  onClose: () => void;
}

export const MacroTargetsModal = ({ onClose }: MacroTargetsModalProps) => {
  const profile = useActiveProfile();
  const { macroTargets } = useActiveTargets();
  const updateProfile = useProfileStore((s) => s.updateProfile);
  const pendingKey = `profile-targets:${profile?.id ?? ""}`;
  const submitting = usePendingKey(pendingKey);
  const [isClosing, setIsClosing] = useState(false);
  const [draft, setDraft] = useState<Record<NutrientKey, number | null>>({ ...macroTargets });

  const computedKcal = useMemo(
    () =>
      atwaterKcal({
        proteins: draft.proteins ?? 0,
        lipids: draft.lipids ?? 0,
        carbohydrates: draft.carbohydrates ?? 0,
        fibers: draft.fibers ?? 0,
      }),
    [draft],
  );

  const handleClose = () => { setIsClosing(true); setTimeout(onClose, 220); };

  const handleChange = (key: NutrientKey, value: number | null) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    const { proteins, lipids, carbohydrates, fibers } = draft;
    if (!profile || proteins === null || lipids === null || carbohydrates === null || fibers === null) return;
    const saved = await withPending(pendingKey, async () => {
      await updateProfile(profile.id, { kcalTarget: computedKcal, macroTargets: { proteins, lipids, carbohydrates, fibers } });
      return true;
    }).catch(() => false);
    if (saved) handleClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        className={`w-full max-w-xs bg-white dark:bg-slate-100 rounded-2xl shadow-2xl flex flex-col overflow-hidden ${
          isClosing ? "modal-center-exit" : "modal-center-enter"
        }`}
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-slate-100">
          <p className="text-xs font-black text-orange-600 uppercase tracking-widest">
            Objectifs{profile ? ` · ${profile.name}` : ""}
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
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-semibold text-slate-600 shrink-0">Calories</span>
            <div className="flex items-center gap-1.5">
              <span className="w-20 text-right text-sm font-bold px-2 py-1.5 text-slate-800">{computedKcal}</span>
              <span className="text-xs text-slate-400 w-6">kcal</span>
            </div>
          </div>
          {NUTRIENT_DEFINITIONS.map(({ key, label, unit }) => (
            <div key={key} className="flex items-center justify-between gap-3">
              <label htmlFor={`macro-input-${key}`} className="text-sm font-semibold text-slate-600 shrink-0">{label}</label>
              <div className="flex items-center gap-1.5">
                <DecimalInput
                  id={`macro-input-${key}`}
                  integer
                  value={draft[key]}
                  onValueChange={(value) => handleChange(key, value)}
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
            disabled={submitting || Object.values(draft).some((value) => value === null)}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-bold bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white transition-colors"
          >
            <Check className="w-4 h-4" />
            Valider
          </button>
        </div>
      </div>
    </div>
  );
};
