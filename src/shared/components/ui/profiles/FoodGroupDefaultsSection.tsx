import { useMemo } from "react";
import { ChevronRight, Shuffle } from "lucide-react";
import { Profile } from "../../../../core/domain/profile";
import { foodGroupsWithFoods } from "../../../../core/logic/foodGroup/foodChoiceLogic";
import { countFoodGroupDefaults } from "../../../../core/logic/foodGroup/foodGroupDefaultsLogic";
import { useFoodGroupsSnapshot, useFoodsSnapshot } from "../../../hooks/useCatalogueSnapshot";
import { countAccompanimentDefaults } from "../../../../core/logic/accompaniment/accompanimentFormLogic";
import { useAccompanimentStore } from "../../../store/useAccompanimentStore";

export interface FoodGroupDefaultsSectionProps {
  profiles: Profile[];
  onOpen: () => void;
}

export const FoodGroupDefaultsSection = ({ profiles, onOpen }: FoodGroupDefaultsSectionProps) => {
  const groups = useFoodGroupsSnapshot();
  const foods = useFoodsSnapshot();
  const entries = useMemo(() => foodGroupsWithFoods(groups, foods), [groups, foods]);
  const accompaniments = useAccompanimentStore((s) => s.accompaniments);

  if ((entries.length === 0 && accompaniments.length === 0) || profiles.length === 0) return null;

  const definedCount = profiles.reduce(
    (sum, profile) => sum
      + countFoodGroupDefaults(entries, profile.foodGroupDefaults)
      + countAccompanimentDefaults(accompaniments, profile.accompanimentDefaults),
    0,
  );
  const scope = [
    accompaniments.length > 0 ? `${accompaniments.length} accompagnement${accompaniments.length > 1 ? "s" : ""}` : "",
    entries.length > 0 ? `${entries.length} familles` : "",
  ].filter(Boolean).join(" · ");

  return (
    <section className="pt-3 border-t border-slate-100">
      <button
        onClick={onOpen}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border border-slate-200 text-left hover:bg-muted transition-colors"
      >
        <Shuffle size={14} className="text-orange-500 shrink-0" />
        <span className="flex-1 min-w-0">
          <span className="block text-sm font-bold text-slate-700">Préférences</span>
          <span className="block text-[11px] text-slate-500">
            {definedCount === 0
              ? `Aucune préférence · ${scope}`
              : `${definedCount} préférence${definedCount > 1 ? "s" : ""} · ${scope}`}
          </span>
        </span>
        <ChevronRight size={16} className="text-slate-400 shrink-0" />
      </button>
    </section>
  );
};
