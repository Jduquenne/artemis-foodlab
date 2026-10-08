import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RecipeDetails } from "../../../../core/domain/recipe";
import { RECIPE_KIND_LABELS } from "../../../../core/domain/recipeLabels";
import {
  RECIPE_KIND_FILTERS,
  RecipeKindFilter,
  filterRecipes,
} from "../../../../core/logic/dashboard/recipeTableLogic";
import { recipeToBuilderState } from "../../../../core/logic/recipeBuilder/recipeBuilderMapper";
import { useCategoriesSnapshot } from "../../../../shared/hooks/useCatalogueSnapshot";
import { useRecipeBuilderStore } from "../../../../shared/store/useRecipeBuilderStore";
import { useCatalogueRecipes } from "../../../../shared/hooks/useCatalogueRecipes";
import { RecipeRow } from "./RecipeRow";
import { DataPanelShell } from "../common/DataPanelShell";
import { DataList } from "../common/DataList";
import { PillTabs } from "../common/PillTabs";
import { categoryLabel } from "../../../../core/logic/recipe/categoryLogic";
import { ConfirmActionModal } from "../../../../shared/components/ui/ConfirmActionModal";

export const RecipesTable = () => {
  const { recipes, remove } = useCatalogueRecipes();
  const categories = useCategoriesSnapshot();
  const navigate = useNavigate();
  const loadFromRecipe = useRecipeBuilderStore((s) => s.loadFromRecipe);
  const reset = useRecipeBuilderStore((s) => s.reset);
  const patch = useRecipeBuilderStore((s) => s.patch);

  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<RecipeKindFilter>("all");
  const [pendingDelete, setPendingDelete] = useState<RecipeDetails | null>(null);

  const filtered = useMemo(
    () => filterRecipes(recipes, categories, query, kind),
    [recipes, categories, query, kind],
  );

  const editInBuilder = (recipe: RecipeDetails) => {
    loadFromRecipe(recipeToBuilderState(recipe.code, recipe));
    navigate("/recipe-builder");
  };

  const createInBuilder = () => {
    reset();
    if (kind === "dessert") patch({ isDessert: true });
    else if (kind !== "all") patch({ kind });
    navigate("/recipe-builder");
  };

  return (
    <DataPanelShell
      title="Recettes"
      count={filtered.length}
      filters={<PillTabs tabs={RECIPE_KIND_FILTERS} value={kind} onChange={setKind} compact />}
      search={{ value: query, onChange: setQuery }}
      onAdd={createInBuilder}
    >
      <DataList isEmpty={filtered.length === 0} emptyMessage="Aucune recette ne correspond.">
        {filtered.map((recipe) => (
          <RecipeRow
            key={recipe.code}
            recipe={recipe}
            onEdit={editInBuilder}
            onAskDelete={setPendingDelete}
          />
        ))}
      </DataList>

      {pendingDelete && (
        <ConfirmActionModal
          title="Confirmer la suppression de la recette"
          recap={[
            { label: "Recette", value: pendingDelete.name },
            { label: "Catégorie", value: categoryLabel(categories, pendingDelete.categoryId) },
            { label: "Type", value: RECIPE_KIND_LABELS[pendingDelete.kind] },
          ]}
          consequence="La recette sera retirée du catalogue. Si un planning l'utilise encore, l'API refusera la suppression."
          confirmLabel="Supprimer"
          danger
          onConfirm={async () => {
            const ok = await remove(pendingDelete.code);
            if (ok) setPendingDelete(null);
            return ok;
          }}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </DataPanelShell>
  );
};
