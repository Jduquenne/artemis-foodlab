import { Profile } from "../../../../core/domain/profile";
import { FoodGroupWithFoods } from "../../../../core/logic/foodGroup/foodChoiceLogic";
import { FoodGroupDefaultSelect } from "./FoodGroupDefaultSelect";

export interface FoodGroupDefaultsListProps {
  title: string;
  entries: FoodGroupWithFoods[];
  profile: Profile;
}

export const FoodGroupDefaultsList = ({ title, entries, profile }: FoodGroupDefaultsListProps) => {
  if (entries.length === 0) return null;
  return (
    <div className="flex flex-col gap-2">
      <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
      {entries.map(({ group, foods }) => (
        <FoodGroupDefaultSelect key={group.id} profile={profile} groupId={group.id} label={group.name} options={foods} />
      ))}
    </div>
  );
};
