import { useMemo } from "react";
import { useCategoriesSnapshot, useFoodsSnapshot, useRecipeMetricsSnapshot, useRecipesSnapshot } from "../../../../shared/hooks/useCatalogueSnapshot";
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
  const recipes = useRecipesSnapshot();
  const foods = useFoodsSnapshot();
  const categories = useCategoriesSnapshot();
  const metrics = useRecipeMetricsSnapshot();
  const counts = useMemo(() => getCatalogueCounts(recipes), [recipes]);
  const foodStats = useMemo(() => getFoodStats(recipes, foods), [recipes, foods]);
  const issues = useMemo(() => getCatalogueIssues(recipes, foods, metrics.macros), [recipes, foods, metrics]);
  const breakdown = useMemo(() => getCategoryBreakdown(recipes, categories), [recipes, categories]);

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
