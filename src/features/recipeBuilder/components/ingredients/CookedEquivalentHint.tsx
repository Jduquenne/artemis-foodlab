import { Flame } from "lucide-react";
import { COOKING_METHOD_LABELS } from "../../../../core/domain/cooking";
import { CookedEquivalent } from "../../../../core/logic/cooking/recipeCookingLogic";

export interface CookedEquivalentHintProps {
  equivalents: CookedEquivalent[];
}

export const CookedEquivalentHint = ({ equivalents }: CookedEquivalentHintProps) => (
  <p className="flex items-center gap-1.5 pb-1.5 sm:pl-18 text-[11px] text-slate-400 tabular-nums">
    <Flame className="w-3 h-3 text-orange-400 shrink-0" />
    <span className="truncate">
      {equivalents
        .map(({ method, grams }) => `≈ ${Math.round(grams).toLocaleString("fr-FR")} g cuits (${COOKING_METHOD_LABELS[method].toLowerCase()})`)
        .join(" · ")}
    </span>
  </p>
);
