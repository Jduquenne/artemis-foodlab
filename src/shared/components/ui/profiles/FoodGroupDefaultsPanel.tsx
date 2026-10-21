import { useMemo, useState } from "react";
import { ChevronLeft, X } from "lucide-react";
import { Profile } from "../../../../core/domain/profile";
import { foodGroupsWithFoods } from "../../../../core/logic/foodGroup/foodChoiceLogic";
import { definedFoodGroupIds, foodGroupDefaultSections } from "../../../../core/logic/foodGroup/foodGroupDefaultsLogic";
import { useFoodGroupsSnapshot, useFoodsSnapshot } from "../../../hooks/useCatalogueSnapshot";
import { useProfileStore } from "../../../store/useProfileStore";
import { SearchBar } from "../SearchBar";
import { FoodGroupDefaultsList } from "./FoodGroupDefaultsList";
import { ProfileDot } from "./ProfileDot";

export interface FoodGroupDefaultsPanelProps {
  profiles: Profile[];
  onBack: () => void;
  onClose: () => void;
}

export const FoodGroupDefaultsPanel = ({ profiles, onBack, onClose }: FoodGroupDefaultsPanelProps) => {
  const activeProfileId = useProfileStore((s) => s.activeProfileId);
  const groups = useFoodGroupsSnapshot();
  const foods = useFoodsSnapshot();
  const entries = useMemo(() => foodGroupsWithFoods(groups, foods), [groups, foods]);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(() => (
    profiles.some((p) => p.id === activeProfileId) ? activeProfileId : profiles[0]?.id ?? null
  ));
  const profile = profiles.find((p) => p.id === selectedId) ?? profiles[0];
  const [definedIds, setDefinedIds] = useState(() => definedFoodGroupIds(profile?.foodGroupDefaults ?? []));

  const sections = useMemo(() => foodGroupDefaultSections(entries, definedIds, query), [entries, definedIds, query]);

  const selectProfile = (next: Profile) => {
    setSelectedId(next.id);
    setDefinedIds(definedFoodGroupIds(next.foodGroupDefaults));
  };

  return (
    <>
      <div className="flex items-center gap-2 px-3 pt-4 pb-3 border-b border-slate-100 shrink-0">
        <button
          onClick={onBack}
          aria-label="Retour aux profils"
          className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-muted transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-black text-orange-600 uppercase tracking-widest">Préférences par famille</p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Pour les ingrédients au choix quand le repas planifié ne précise rien.
          </p>
        </div>
        <button
          onClick={onClose}
          aria-label="Fermer"
          className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-muted transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="px-5 pt-3 pb-3 flex flex-col gap-3 border-b border-slate-100 shrink-0">
        {profiles.length > 1 && (
          <div role="tablist" aria-label="Profil" className="flex gap-1.5 overflow-x-auto">
            {profiles.map((p) => {
              const selected = p.id === profile?.id;
              return (
                <button
                  key={p.id}
                  role="tab"
                  aria-selected={selected}
                  onClick={() => selectProfile(p)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-semibold whitespace-nowrap shrink-0 transition-colors ${
                    selected ? "bg-orange-500 border-orange-400 text-white" : "bg-surface border-slate-200 text-slate-600 hover:bg-muted"
                  }`}
                >
                  <ProfileDot color={p.color} />
                  {p.name}
                </button>
              );
            })}
          </div>
        )}
        <SearchBar value={query} onChange={setQuery} onClear={() => setQuery("")} placeholder="Famille ou aliment…" />
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4 flex flex-col gap-5">
        {profile && (
          <>
            <FoodGroupDefaultsList title="Définies" entries={sections.defined} profile={profile} />
            <FoodGroupDefaultsList title={sections.defined.length > 0 ? "Autres familles" : "Familles"} entries={sections.others} profile={profile} />
          </>
        )}
        {sections.defined.length === 0 && sections.others.length === 0 && (
          <p className="px-4 py-6 rounded-2xl border border-dashed border-slate-300 text-center text-sm text-slate-400">
            Aucune famille ne correspond à « {query.trim()} ».
          </p>
        )}
      </div>
    </>
  );
};
