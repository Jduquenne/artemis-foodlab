import { Ban, CircleSlash, Heart, ListChecks, Recycle } from "lucide-react";
import { MenuGeneratorSettings } from "../../../../core/domain/menuGenerator";
import {
  setPreferredFoodMode,
  toggleBannedRecipe,
  toggleExcludedFood,
  toggleFavoriteRecipe,
  togglePreferredFood,
} from "../../../../core/logic/menuGenerator/generatorSettingsLogic";
import { ExcludedFoodsField } from "./ExcludedFoodsField";
import { FoodListsField } from "./FoodListsField";
import { PreferredFoodsField } from "./PreferredFoodsField";
import { RecipeListField } from "./RecipeListField";
import { SettingsCard } from "./SettingsCard";

export interface FoodsSettingsPanelProps {
  settings: MenuGeneratorSettings;
  disabled: boolean;
  onPatch: (update: Partial<MenuGeneratorSettings>) => void;
}

export const FoodsSettingsPanel = ({ settings, disabled, onPatch }: FoodsSettingsPanelProps) => (
  <div className="flex flex-col gap-3">
    <SettingsCard icon={Recycle} title="Aliments à utiliser" description="Restes, produits à finir. « Bonus » : favorisé. « Au moins 1× » : utilisé au moins une fois.">
      <PreferredFoodsField
        foods={settings.preferredFoods}
        disabled={disabled}
        onToggle={(foodId) => onPatch(togglePreferredFood(settings, foodId))}
        onModeChange={(foodId, mode) => onPatch({ preferredFoods: setPreferredFoodMode(settings.preferredFoods, foodId, mode) })}
      />
    </SettingsCard>

    <SettingsCard icon={Ban} title="Aliments à éviter" description="Aucune recette proposée ne les contient.">
      <ExcludedFoodsField foodIds={settings.excludedFoodIds} disabled={disabled} onToggle={(foodId) => onPatch(toggleExcludedFood(settings, foodId))} />
    </SettingsCard>

    <SettingsCard icon={ListChecks} title="Listes d'aliments" description="Ex : « Poisson blanc » = cabillaud, colin, merlu. À utiliser comme cible des habitudes, quotas et desserts.">
      <FoodListsField settings={settings} disabled={disabled} onPatch={onPatch} />
    </SettingsCard>

    <SettingsCard icon={Heart} title="Recettes favorites" description="Favorisées une fois, sur un repas tiré au hasard.">
      <RecipeListField codes={settings.favoriteRecipeCodes} tone="favorite" disabled={disabled} onToggle={(code) => onPatch(toggleFavoriteRecipe(settings, code))} />
    </SettingsCard>

    <SettingsCard icon={CircleSlash} title="Recettes interdites" description="Jamais proposées.">
      <RecipeListField codes={settings.bannedRecipeCodes} tone="banned" disabled={disabled} onToggle={(code) => onPatch(toggleBannedRecipe(settings, code))} />
    </SettingsCard>
  </div>
);
