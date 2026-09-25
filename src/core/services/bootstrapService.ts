import { HouseholdItem } from "../domain/household";
import { Food } from "../domain/ingredient";
import { Profile } from "../domain/profile";
import { Category } from "../domain/recipe";
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

export interface SyncBootstrapOptions {
  silent?: boolean;
}

export async function syncBootstrapFromApi(options: SyncBootstrapOptions = {}): Promise<BootstrapResult | null> {
  try {
    const data = await apiFetchJson<ApiBootstrap>("/bootstrap", { suppressGlobalError: options.silent ?? false });

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
