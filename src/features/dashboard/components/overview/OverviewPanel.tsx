import { useMemo } from "react";
import { CATEGORIES } from "../../../../core/domain/categories";
import { typedRecipesDb } from "../../../../core/typed-db/typedRecipesDb";
import { typedFoodDb } from "../../../../core/typed-db/typedFoodDb";
import { RECIPE_MACROS } from "../../../../shared/utils/macroUtils";
import {
  getCatalogueCounts,
  getCatalogueIssues,
  getCategoryBreakdown,
  getFoodStats,
} from "../../../../core/logic/dashboard/dashboardStats";
import { HealthBanner } from "./HealthBanner";
import { StatTile } from "./StatTile";
import { CategoryBreakdown } from "./CategoryBreakdown";
import { PlanningUsageCard } from "./PlanningUsageCard";

export const OverviewPanel = () => {
  const counts = useMemo(() => getCatalogueCounts(typedRecipesDb), []);
  const foodStats = useMemo(() => getFoodStats(typedRecipesDb, typedFoodDb), []);
  const issues = useMemo(() => getCatalogueIssues(typedRecipesDb, typedFoodDb, RECIPE_MACROS), []);
  const breakdown = useMemo(() => getCategoryBreakdown(typedRecipesDb, CATEGORIES), []);

  return (
    <div className="h-full flex flex-col gap-3 overflow-y-auto">
      <HealthBanner issues={issues} />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:items-start">
        <StatTile
          label="Recettes"
          value={counts.recipes}
          breakdown={[
            { label: "Plats", value: counts.dishes },
            { label: "Ingrédients", value: counts.ingredients },
            { label: "Bases", value: counts.bases },
            { label: "Desserts", value: counts.desserts },
          ]}
        />
        <StatTile
          label="Aliments"
          value={foodStats.total}
          breakdown={[
            { label: "Sans valeurs nutri.", value: foodStats.total - foodStats.withMacros },
            { label: "Jamais utilisés", value: foodStats.unused },
          ]}
        />
        <CategoryBreakdown rows={breakdown} />
      </div>

      <PlanningUsageCard />
    </div>
  );
};
