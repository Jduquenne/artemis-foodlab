import { useMemo, useState } from "react";
import { AlertTriangle, ChevronLeft, ChevronRight, X } from "lucide-react";
import { BatchFreezerItem } from "../../../../core/domain/freezer";
import { SLOT_LABELS } from "../../../../core/domain/slotLabels";
import {
  batchMenuWeek,
  isoWeekOf,
  mondayOf,
  plannedDishAt,
  shiftWeek,
  slotTargetOf,
} from "../../../../core/logic/planning/batchToMenuLogic";
import { placeMainDish } from "../../../../core/services/planningService";
import { formatSourceDayFull, toIsoDate } from "../../../../core/utils/dateUtils";
import { getWeekRange } from "../../../../core/utils/weekUtils";
import { useRecipesSnapshot } from "../../../../shared/hooks/useCatalogueSnapshot";
import { useChoiceContext } from "../../../../shared/hooks/useChoiceContext";
import { usePendingKey } from "../../../../shared/hooks/usePendingKey";
import { usePlannedWeek } from "../../../../shared/hooks/usePlannedWeek";
import { useNotificationStore } from "../../../../shared/store/useNotificationStore";
import { withPending } from "../../../../shared/utils/withPending";
import { BatchMenuSelection, BatchMenuWeekGrid } from "./BatchMenuWeekGrid";

export interface AddBatchToMenuModalProps {
  item: BatchFreezerItem;
  onClose: () => void;
}

export const AddBatchToMenuModal = ({ item, onClose }: AddBatchToMenuModalProps) => {
  const [todayIso] = useState(() => toIsoDate(new Date()));
  const [monday, setMonday] = useState(() => mondayOf(new Date()));
  const [selection, setSelection] = useState<BatchMenuSelection | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const recipes = useRecipesSnapshot();
  const choiceContext = useChoiceContext();
  const pushNotification = useNotificationStore((s) => s.push);
  const pendingKey = `freezer-batch-to-menu:${item.id}`;
  const saving = usePendingKey(pendingKey);

  const { year, week } = isoWeekOf(monday);
  const days = useMemo(() => batchMenuWeek(monday), [monday]);
  const slots = usePlannedWeek(year, week);
  const recipeNameOf = (code: string) => recipes[code]?.name ?? code;
  const isCurrentWeek = toIsoDate(monday) === toIsoDate(mondayOf(new Date()));

  const target = selection ? slotTargetOf(selection.date, selection.slot) : null;
  const plannedCode = selection && target ? plannedDishAt(slots, target.day, selection.slot) : null;
  const replacedName = plannedCode && plannedCode !== item.recipeId ? recipeNameOf(plannedCode) : null;

  const handleClose = () => { setIsClosing(true); setTimeout(onClose, 300); };

  const handleSave = async () => {
    if (!target || !selection) return;
    const done = await withPending(pendingKey, async () => {
      await placeMainDish(target, item.recipeId, choiceContext);
      return true;
    }).catch(() => false);
    if (!done) return;
    pushNotification({
      message: `« ${item.recipeName} » ajouté au menu : ${formatSourceDayFull(selection.date)}, ${SLOT_LABELS[selection.slot].toLowerCase()}.`,
      duration: 6000,
      variant: "info",
    });
    handleClose();
  };

  const saveLabel = selection && target
    ? `Ajouter : ${formatSourceDayFull(selection.date)}, ${SLOT_LABELS[selection.slot].toLowerCase()}`
    : "Choisis un repas";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-0 sm:px-4">
      <div className={`w-full sm:max-w-3xl bg-slate-50 rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col max-h-[90dvh] ${isClosing ? "modal-exit sm:modal-center-exit" : "modal-enter sm:modal-center-enter"}`}>
        <div className="flex items-center justify-between gap-3 px-5 pt-5 pb-3 shrink-0">
          <div className="min-w-0">
            <h2 className="text-base font-black text-slate-900">Ajouter au menu</h2>
            <p className="text-xs text-slate-500 truncate">
              {item.recipeName} · {item.portions} portion{item.portions > 1 ? "s" : ""} au congélateur
            </p>
          </div>
          <button aria-label="Fermer" onClick={handleClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-muted transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center justify-between gap-2 px-5 pb-3 shrink-0">
          <button
            aria-label="Semaine précédente"
            onClick={() => setMonday((current) => shiftWeek(current, -1))}
            className="p-2 rounded-xl text-slate-500 hover:bg-muted transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-sm font-black text-slate-800">Semaine {week}</span>
            <span className="text-xs text-slate-400">{getWeekRange(monday)}</span>
            {!isCurrentWeek && (
              <button
                onClick={() => setMonday(mondayOf(new Date()))}
                className="text-xs font-bold text-orange-600 dark:text-orange-300 px-2 py-1 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
              >
                Cette semaine
              </button>
            )}
          </div>
          <button
            aria-label="Semaine suivante"
            onClick={() => setMonday((current) => shiftWeek(current, 1))}
            className="p-2 rounded-xl text-slate-500 hover:bg-muted transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-5 pb-4 flex flex-col gap-3">
          <BatchMenuWeekGrid
            days={days}
            slots={slots}
            batchRecipeId={item.recipeId}
            recipeNameOf={recipeNameOf}
            todayIso={todayIso}
            selection={selection}
            onSelect={setSelection}
          />

          {replacedName && (
            <div className="flex gap-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 p-3 text-xs text-amber-700 dark:text-amber-400">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>Ce repas remplacera « {replacedName} ».</span>
            </div>
          )}

          <p className="text-xs text-slate-400">Les portions du congélateur ne sont pas décomptées : utilise le « − » du batch après le repas.</p>
        </div>

        <div className="px-5 pb-6 pt-3 shrink-0 border-t border-slate-200">
          <button
            onClick={handleSave}
            disabled={!target || saving}
            className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black rounded-2xl transition-colors text-sm"
          >
            {saving ? "Enregistrement..." : saveLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
