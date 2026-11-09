import { useMemo, useState } from "react";
import { Snowflake, X } from "lucide-react";
import { FreezerItem } from "../../../../core/domain/freezer";
import { freezerItemLabel, freezerMoveTargets } from "../../../../core/logic/freezer/freezerMoveLogic";
import { formatFreezerCategoryCount, summarizeFreezerCategory } from "../../../../core/logic/freezer/freezerStockLogic";
import { moveItemToCategory } from "../../../../core/services/freezerService";
import { useFreezerCategories } from "../../../../shared/hooks/useFreezerCategories";
import { usePendingKey } from "../../../../shared/hooks/usePendingKey";
import { useNotificationStore } from "../../../../shared/store/useNotificationStore";
import { withPending } from "../../../../shared/utils/withPending";
import { getFreezerCategoryAccent } from "../../freezerAccents";

export interface MoveFreezerItemModalProps {
  item: FreezerItem;
  categoryId: string;
  onClose: () => void;
}

export const MoveFreezerItemModal = ({ item, categoryId, onClose }: MoveFreezerItemModalProps) => {
  const categories = useFreezerCategories();
  const pushNotification = useNotificationStore((s) => s.push);
  const [isClosing, setIsClosing] = useState(false);
  const pendingKey = `freezer-item-move:${item.id}`;
  const moving = usePendingKey(pendingKey);
  const label = freezerItemLabel(item);
  const targets = useMemo(() => freezerMoveTargets(categories, categoryId, item), [categories, categoryId, item]);

  const handleClose = () => { setIsClosing(true); setTimeout(onClose, 300); };

  const handleMove = async (targetId: string, targetName: string) => {
    const done = await withPending(pendingKey, async () => {
      await moveItemToCategory(categoryId, item.id, targetId);
      return true;
    }).catch(() => false);
    if (!done) return;
    pushNotification({ message: `« ${label} » déplacé vers « ${targetName} ».`, duration: 5000, variant: "info" });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-0 sm:px-4">
      <div className={`w-full sm:max-w-md bg-slate-50 rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col max-h-[90dvh] ${isClosing ? "modal-exit sm:modal-center-exit" : "modal-enter sm:modal-center-enter"}`}>
        <div className="flex items-center justify-between gap-3 px-5 pt-5 pb-3 shrink-0">
          <div className="min-w-0">
            <h2 className="text-base font-black text-slate-900">Déplacer vers…</h2>
            <p className="text-xs text-slate-500 truncate">{label}</p>
          </div>
          <button aria-label="Fermer" onClick={handleClose} disabled={moving} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-muted transition-colors disabled:opacity-40">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-5 pb-5 flex flex-col gap-2">
          {targets.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-400">Crée d&apos;abord une autre catégorie pour y déplacer cet article.</p>
          ) : (
            targets.map(({ category, blockedReason }) => {
              const accent = getFreezerCategoryAccent(category);
              return (
                <button
                  key={category.id}
                  onClick={() => handleMove(category.id, category.name)}
                  disabled={blockedReason !== null || moving}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-2xl border border-slate-200 bg-surface text-left hover:bg-muted disabled:opacity-50 disabled:hover:bg-surface disabled:cursor-not-allowed transition-colors"
                >
                  <span className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center ${accent.badge}`}>
                    <Snowflake className="w-4 h-4" />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-semibold text-slate-800 truncate">{category.name}</span>
                    <span className="block text-[11px] text-slate-400">{formatFreezerCategoryCount(summarizeFreezerCategory(category))}</span>
                  </span>
                  {blockedReason && <span className="shrink-0 text-[11px] font-bold text-amber-600">{blockedReason}</span>}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
