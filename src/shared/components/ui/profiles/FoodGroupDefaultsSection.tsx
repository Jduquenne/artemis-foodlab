import { useMemo } from "react";
import { Shuffle } from "lucide-react";
import { Profile } from "../../../../core/domain/profile";
import { foodGroupsWithFoods } from "../../../../core/logic/foodGroup/foodChoiceLogic";
import { useFoodGroupsSnapshot, useFoodsSnapshot } from "../../../hooks/useCatalogueSnapshot";
import { FoodGroupDefaultSelect } from "./FoodGroupDefaultSelect";

export interface FoodGroupDefaultsSectionProps {
  profiles: Profile[];
}

export const FoodGroupDefaultsSection = ({ profiles }: FoodGroupDefaultsSectionProps) => {
  const groups = useFoodGroupsSnapshot();
  const foods = useFoodsSnapshot();
  const entries = useMemo(() => foodGroupsWithFoods(groups, foods), [groups, foods]);

  if (entries.length === 0 || profiles.length === 0) return null;

  return (
    <section className="pt-3 border-t border-slate-100 flex flex-col gap-3">
      <div>
        <p className="text-xs font-black text-orange-600 uppercase tracking-widest flex items-center gap-1.5">
          <Shuffle size={12} /> Préférences par famille
        </p>
        <p className="text-[11px] text-slate-500 mt-0.5">
          Utilisées pour les ingrédients au choix quand le repas planifié ne précise rien.
        </p>
      </div>
      {entries.map(({ group, foods: options }) => (
        <div key={group.id} className="flex flex-col gap-1.5">
          <p className="text-xs font-bold text-slate-500">{group.name}</p>
          {profiles.map((profile) => (
            <FoodGroupDefaultSelect key={profile.id} profile={profile} groupId={group.id} options={options} />
          ))}
        </div>
      ))}
    </section>
  );
};
