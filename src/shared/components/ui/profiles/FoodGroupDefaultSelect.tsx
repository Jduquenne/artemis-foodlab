import { Loader2 } from "lucide-react";
import { Food } from "../../../../core/domain/ingredient";
import { Profile } from "../../../../core/domain/profile";
import { findFoodGroupDefault } from "../../../../core/logic/foodGroup/foodChoiceLogic";
import { usePendingKey } from "../../../hooks/usePendingKey";
import { useProfileStore } from "../../../store/useProfileStore";
import { withPending } from "../../../utils/withPending";
import { ProfileDot } from "./ProfileDot";

export interface FoodGroupDefaultSelectProps {
  profile: Profile;
  groupId: string;
  options: Food[];
}

export const FoodGroupDefaultSelect = ({ profile, groupId, options }: FoodGroupDefaultSelectProps) => {
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
    <label className="flex items-center gap-2">
      <ProfileDot color={profile.color} />
      <span className="w-20 shrink-0 text-sm text-slate-700 truncate">{profile.name}</span>
      <select
        value={current ?? ""}
        disabled={pending}
        onChange={(e) => change(e.target.value)}
        className="flex-1 min-w-0 px-2 py-1.5 bg-surface border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 disabled:opacity-50"
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
