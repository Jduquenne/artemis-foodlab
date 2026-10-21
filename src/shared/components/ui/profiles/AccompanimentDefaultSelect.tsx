import { Loader2 } from "lucide-react";
import { Accompaniment } from "../../../../core/domain/accompaniment";
import { Profile } from "../../../../core/domain/profile";
import {
  ACCOMPANIMENT_DEFAULT_VALUE,
  ACCOMPANIMENT_NONE_VALUE,
  accompanimentDefaultValue,
  accompanimentOptionLabel,
} from "../../../../core/logic/accompaniment/accompanimentFormLogic";
import { findAccompanimentOption } from "../../../../core/logic/accompaniment/accompanimentLogic";
import { useFoodsSnapshot, useRecipesSnapshot } from "../../../hooks/useCatalogueSnapshot";
import { usePendingKey } from "../../../hooks/usePendingKey";
import { useProfileStore } from "../../../store/useProfileStore";
import { withPending } from "../../../utils/withPending";

export interface AccompanimentDefaultSelectProps {
  profile: Profile;
  accompaniment: Accompaniment;
}

export const AccompanimentDefaultSelect = ({ profile, accompaniment }: AccompanimentDefaultSelectProps) => {
  const recipes = useRecipesSnapshot();
  const foods = useFoodsSnapshot();
  const setAccompanimentDefault = useProfileStore((s) => s.setAccompanimentDefault);
  const clearAccompanimentDefault = useProfileStore((s) => s.clearAccompanimentDefault);
  const key = `profile-accompaniment-default:${profile.id}:${accompaniment.id}`;
  const pending = usePendingKey(key);
  const current = accompanimentDefaultValue(profile.accompanimentDefaults, accompaniment.id);
  const fallback = findAccompanimentOption(accompaniment, accompaniment.defaultOptionId);
  const fallbackLabel = fallback ? accompanimentOptionLabel(fallback, recipes, foods) : "sans";

  const change = async (value: string) => {
    if (value === current) return;
    const task = value === ACCOMPANIMENT_DEFAULT_VALUE
      ? () => clearAccompanimentDefault(profile.id, accompaniment.id)
      : () => setAccompanimentDefault(profile.id, accompaniment.id, value === ACCOMPANIMENT_NONE_VALUE ? null : value);
    await withPending(key, task).catch(() => undefined);
  };

  return (
    <label className="flex items-center gap-3">
      <span className="flex-1 min-w-0 text-sm font-semibold text-slate-700 truncate">{accompaniment.name}</span>
      <select
        value={current}
        disabled={pending}
        onChange={(e) => change(e.target.value)}
        className={`w-40 sm:w-48 shrink-0 px-2 py-1.5 bg-surface border rounded-lg text-sm focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 disabled:opacity-50 ${
          current !== ACCOMPANIMENT_DEFAULT_VALUE ? "border-orange-300 text-orange-700 font-semibold" : "border-slate-200 text-slate-500"
        }`}
      >
        <option value={ACCOMPANIMENT_DEFAULT_VALUE}>{`Par défaut (${fallbackLabel})`}</option>
        <option value={ACCOMPANIMENT_NONE_VALUE}>Sans accompagnement</option>
        {accompaniment.options.map((option) => (
          <option key={option.id} value={option.id}>{accompanimentOptionLabel(option, recipes, foods)}</option>
        ))}
      </select>
      <span className="w-4 shrink-0">{pending && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}</span>
    </label>
  );
};
