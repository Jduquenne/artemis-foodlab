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
import { SettingsSection } from "./SettingsSection";

export interface FoodsSettingsPanelProps {
  settings: MenuGeneratorSettings;
  disabled: boolean;
  onPatch: (update: Partial<MenuGeneratorSettings>) => void;
}

export const FoodsSettingsPanel = ({ settings, disabled, onPatch }: FoodsSettingsPanelProps) => (
  <div className="flex flex-col gap-4">
    <SettingsSection
      title="Aliments à utiliser"
      hint="Restes, produits à finir. « Bonus » : favorisé. « Au moins 1× » : utilisé au moins une fois sur la période."
    >
      <PreferredFoodsField
        foods={settings.preferredFoods}
        disabled={disabled}
        onToggle={(foodId) => onPatch(togglePreferredFood(settings, foodId))}
        onModeChange={(foodId, mode) => onPatch({ preferredFoods: setPreferredFoodMode(settings.preferredFoods, foodId, mode) })}
      />
    </SettingsSection>

    <SettingsSection title="Aliments à éviter" hint="Aucune recette proposée ne les contient.">
      <ExcludedFoodsField
        foodIds={settings.excludedFoodIds}
        disabled={disabled}
        onToggle={(foodId) => onPatch(toggleExcludedFood(settings, foodId))}
      />
    </SettingsSection>

    <SettingsSection
      title="Listes d'aliments"
      hint="Ex : « Poisson blanc » = cabillaud, colin, merlu. Utilisables comme cible dans les habitudes et les quotas ; un aliment peut être dans plusieurs listes."
    >
      <FoodListsField settings={settings} disabled={disabled} onPatch={onPatch} />
    </SettingsSection>

    <SettingsSection title="Recettes favorites" hint="Favorisées une fois sur un repas tiré au hasard de la période.">
      <RecipeListField
        codes={settings.favoriteRecipeCodes}
        tone="favorite"
        disabled={disabled}
        onToggle={(code) => onPatch(toggleFavoriteRecipe(settings, code))}
      />
    </SettingsSection>

    <SettingsSection title="Recettes interdites" hint="Jamais proposées.">
      <RecipeListField
        codes={settings.bannedRecipeCodes}
        tone="banned"
        disabled={disabled}
        onToggle={(code) => onPatch(toggleBannedRecipe(settings, code))}
      />
    </SettingsSection>
  </div>
);
