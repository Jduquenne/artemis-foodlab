import { useState } from "react";
import { BatchFreezerItem } from "../../../../core/domain/freezer";
import { formatBatchQuantity, isValidBatchQuantity } from "../../../../core/logic/freezer/batchQuantityLogic";
import { updateBatchQuantity } from "../../../../core/services/freezerService";
import { DecimalInput } from "../../../../shared/components/ui/DecimalInput";
import { Sheet } from "../../../../shared/components/ui/Sheet";
import { usePendingKey } from "../../../../shared/hooks/usePendingKey";
import { withPending } from "../../../../shared/utils/withPending";

export interface BatchGramsSheetProps {
  item: BatchFreezerItem;
  categoryId: string;
  onClose: () => void;
}

export const BatchGramsSheet = ({ item, categoryId, onClose }: BatchGramsSheetProps) => {
  const pendingKey = `freezer-batch-quantity:${item.id}`;
  const pending = usePendingKey(pendingKey);
  const [draft, setDraft] = useState<number | null>(item.quantity > 0 ? item.quantity : null);
  const [error, setError] = useState(false);

  const save = () => {
    if (pending) return;
    if (draft === null || !isValidBatchQuantity("g", draft)) {
      setError(true);
      return;
    }
    withPending(pendingKey, () => updateBatchQuantity(categoryId, item.id, draft)).then(onClose, () => undefined);
  };

  return (
    <Sheet
      title={item.recipeName}
      subtitle={<>Au congélateur : <b className="text-slate-900">{formatBatchQuantity("g", item.quantity)}</b>. Quelle quantité reste-t-il ?</>}
      onClose={onClose}
    >
      <div className="flex items-center gap-3">
        <DecimalInput
          value={draft}
          onValueChange={(value) => { setDraft(value); setError(false); }}
          onKeyDown={(e) => { if (e.key === "Enter") save(); }}
          placeholder="0"
          aria-label={`Quantité restante en grammes — ${item.recipeName}`}
          autoFocus
          className="flex-1 min-w-0 text-3xl font-bold text-center tabular-nums bg-subtle border-2 border-slate-200 focus:border-orange-500 focus:outline-none rounded-2xl px-3 py-3 text-slate-900"
        />
        <span className="text-base font-semibold text-slate-500 min-w-10">g</span>
      </div>
      {error && (
        <p className="text-sm text-center text-red-500">Saisis une quantité supérieure à 0 (3 décimales au maximum). Pour vider le lot, supprime-le.</p>
      )}
      <button
        type="button"
        disabled={pending}
        onClick={save}
        className={`py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold transition-colors disabled:opacity-60 ${pending ? "animate-pulse" : ""}`}
      >
        Valider
      </button>
    </Sheet>
  );
};
