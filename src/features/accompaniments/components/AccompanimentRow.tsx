import { ChevronRight } from "lucide-react";
import { Accompaniment } from "../../../core/domain/accompaniment";
import { accompanimentOptionLabel, accompanimentSummary } from "../../../core/logic/accompaniment/accompanimentFormLogic";
import { findAccompanimentOption } from "../../../core/logic/accompaniment/accompanimentLogic";
import { useFoodsSnapshot, useRecipesSnapshot } from "../../../shared/hooks/useCatalogueSnapshot";

export interface AccompanimentRowProps {
  accompaniment: Accompaniment;
  onOpen: () => void;
}

export const AccompanimentRow = ({ accompaniment, onOpen }: AccompanimentRowProps) => {
  const recipes = useRecipesSnapshot();
  const foods = useFoodsSnapshot();
  const defaultOption = findAccompanimentOption(accompaniment, accompaniment.defaultOptionId);
  const defaultLabel = defaultOption ? accompanimentOptionLabel(defaultOption, recipes, foods) : "Sans accompagnement";

  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border border-slate-200 text-left hover:bg-muted transition-colors"
    >
      <span className="flex-1 min-w-0">
        <span className="block text-sm font-bold text-slate-700 truncate">{accompaniment.name}</span>
        <span className="block text-[11px] text-slate-500 truncate">
          {accompanimentSummary(accompaniment)} · par défaut : {defaultLabel}
        </span>
      </span>
      <ChevronRight size={16} className="text-slate-400 shrink-0" />
    </button>
  );
};
