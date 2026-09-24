import { Food, HouseholdItem, Profile } from "../domain/types";
import { Category } from "../domain/categories";
import { ApiOutdoorActivity, ApiRecipe } from "../logic/recipe/recipeApiMapper";
import { ApiShoppingPeriod } from "../logic/shopping/shoppingApiMapper";
import { apiFetchJson } from "./apiClient";
import { applyCatalogueData } from "./catalogueSyncService";
import { applyHouseholdFlags } from "./householdService";
import {
  ApiJournalOverride,
  JournalOverridesByProfile,
  mapJournalOverrides,
} from "./journalService";
import { ApiProfile, mapProfiles } from "./profileService";
import { CurrentPeriod, mapApiPeriod } from "./shoppingPeriodService";

interface ApiBootstrapHouseholdFlag {
  itemId: string;
  flaggedAt: string;
}

interface ApiBootstrap {
  recipes: ApiRecipe[];
  outdoorActivities: ApiOutdoorActivity[];
  foods: Food[];
  householdItems: HouseholdItem[];
  recipeCategories: Category[];
  householdShoppingFlags: ApiBootstrapHouseholdFlag[];
  profiles: ApiProfile[];
  journalOverrides: ApiJournalOverride[];
  currentShoppingPeriod: ApiShoppingPeriod | null;
}

export interface BootstrapResult {
  profiles: Profile[];
  journalOverrides: JournalOverridesByProfile;
  shoppingPeriod: CurrentPeriod | null;
}

export async function syncBootstrapFromApi(): Promise<BootstrapResult | null> {
  try {
    const data = await apiFetchJson<ApiBootstrap>("/bootstrap");

    await applyCatalogueData(
      data.recipes,
      data.outdoorActivities,
      data.foods,
      data.householdItems,
      data.recipeCategories,
    );

    await applyHouseholdFlags(
      data.householdShoppingFlags.map((f) => ({ id: f.itemId, lastCheckedAt: f.flaggedAt })),
    );

    return {
      profiles: mapProfiles(data.profiles),
      journalOverrides: mapJournalOverrides(data.journalOverrides),
      shoppingPeriod: await mapApiPeriod(data.currentShoppingPeriod),
    };
  } catch {
    return null;
  }
}
