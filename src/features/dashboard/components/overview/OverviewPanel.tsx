import { useMemo } from "react";
import { CATEGORIES } from "../../../../core/domain/categories";
import { typedRecipesDb } from "../../../../core/typed-db/typedRecipesDb";
import { typedFoodDb } from "../../../../core/typed-db/typedFoodDb";
import { typedOutdoorDb } from "../../../../core/typed-db/typedOutdoorDb";
import { RECIPE_MACROS } from "../../../../shared/utils/macroUtils";
import {
  getCatalogueCounts,
  getCatalogueHealth,
  getCatalogueIssues,
  getCategoryBreakdown,
} from "../../../../core/logic/dashboard/dashboardStats";
import { HealthVerdictCard } from "./HealthVerdictCard";
import { StatTile } from "./StatTile";
import { CatalogueIssueList } from "./CatalogueIssueList";
import { CategoryBreakdown } from "./CategoryBreakdown";

export const OverviewPanel = () => {
  const counts = useMemo(
    () => getCatalogueCounts(typedRecipesDb, typedOutdoorDb, typedFoodDb, CATEGORIES),
    [],
  );
  const issues = useMemo(() => getCatalogueIssues(typedRecipesDb, typedFoodDb, RECIPE_MACROS), []);
  const health = useMemo(() => getCatalogueHealth(issues), [issues]);
  const breakdown = useMemo(() => getCategoryBreakdown(typedRecipesDb, CATEGORIES), []);

  return (
    <div className="h-full grid gap-3 grid-cols-1 auto-rows-min overflow-y-auto lg:overflow-hidden lg:grid-cols-3 lg:grid-rows-[auto_minmax(0,1fr)]">
      <HealthVerdictCard
        issueCount={health.issueCount}
        flaggedItems={health.flaggedItems}
        recipes={counts.recipes}
        foods={counts.foods}
      />

      <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatTile
          label="Recettes"
          value={counts.recipes}
          breakdown={[
            { label: "Plats", value: counts.dishes },
            { label: "Ingrédients", value: counts.ingredients },
            { label: "Bases", value: counts.bases },
          ]}
        />
        <StatTile label="Aliments" value={counts.foods} />
        <StatTile label="Catégories" value={counts.categories} />
        <StatTile label="Desserts" value={counts.desserts} />
        <StatTile label="Activités extérieures" value={counts.outdoorActivities} />
      </div>

      <div className="lg:col-span-2 min-h-64 lg:min-h-0">
        <CatalogueIssueList issues={issues} />
      </div>

      <div className="min-h-64 lg:min-h-0">
        <CategoryBreakdown rows={breakdown} />
      </div>
    </div>
  );
};
