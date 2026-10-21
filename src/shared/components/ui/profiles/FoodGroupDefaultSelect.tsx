import { Loader2 } from "lucide-react";
import { Food } from "../../../../core/domain/ingredient";
import { Profile } from "../../../../core/domain/profile";
import { findFoodGroupDefault } from "../../../../core/logic/foodGroup/foodChoiceLogic";
import { usePendingKey } from "../../../hooks/usePendingKey";
import { useProfileStore } from "../../../store/useProfileStore";
import { withPending } from "../../../utils/withPending";

export interface FoodGroupDefaultSelectProps {
  profile: Profile;
  groupId: string;
  label: string;
  options: Food[];
}

export const FoodGroupDefaultSelect = ({ profile, groupId, label, options }: FoodGroupDefaultSelectProps) => {
  const setFoodGroupDefault = useProfileStore((s) => s.setFoodGroupDefault);
  const key = `profile-food-group-default:${profile.id}:${groupId}`;
  const pending = usePendingKey(key);
  const current = findFoodGroupDefault(profile.foodGroupDefaults, groupId);

  const change = async (value: string) => {
    const foodId = value || null;
    if (foodId === current) return;
    await withPending(key, () => setFoodGroupDefault(profile.id, groupId, foodId)).catch(() => undefined);
  };

  return (
    <label className="flex items-center gap-3">
      <span className="flex-1 min-w-0 text-sm font-semibold text-slate-700 truncate">{label}</span>
      <select
        value={current ?? ""}
        disabled={pending}
        onChange={(e) => change(e.target.value)}
        className={`w-40 sm:w-48 shrink-0 px-2 py-1.5 bg-surface border rounded-lg text-sm focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 disabled:opacity-50 ${
          current ? "border-orange-300 text-orange-700 font-semibold" : "border-slate-200 text-slate-500"
        }`}
      >
        <option value="">Défaut de la recette</option>
        {options.map((food) => (
          <option key={food.id} value={food.id}>{food.name}</option>
        ))}
      </select>
      <span className="w-4 shrink-0">{pending && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}</span>
    </label>
  );
};
