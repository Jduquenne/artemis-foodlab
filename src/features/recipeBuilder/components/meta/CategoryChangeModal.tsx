import { useState } from "react";
import {
  buildCategoryChangeRecap,
  categoryChangeOptions,
  isDemoRecipeCode,
  planCategoryChange,
} from "../../../../core/logic/recipeBuilder/recipeCategoryChangeLogic";
import { useCategoriesSnapshot, useRecipesSnapshot } from "../../../../shared/hooks/useCatalogueSnapshot";
import { useRecipeCategoryChange } from "../../../../shared/hooks/useRecipeCategoryChange";
import { ConfirmActionModal } from "../../../../shared/components/ui/ConfirmActionModal";
import { FORM_INPUT_CLASS } from "../../../../shared/components/ui/formStyles";

export interface CategoryChangeModalProps {
  apiId: string;
  sourceCode: string;
  recipeName: string;
  currentCategoryId: string;
  onClose: () => void;
}

const BASE_CONSEQUENCE =
  "L'identifiant de la recette change. Le planning, le journal, les courses, le congélateur et les photos restent liés à la recette. Les modifications non enregistrées du brouillon ne sont pas envoyées.";
const DEMO_CONSEQUENCE = " Cette recette est utilisée par le mode démo : elle n'y apparaîtra plus.";

export const CategoryChangeModal = ({ apiId, sourceCode, recipeName, currentCategoryId, onClose }: CategoryChangeModalProps) => {
  const categories = useCategoriesSnapshot();
  const recipes = useRecipesSnapshot();
  const changeCategory = useRecipeCategoryChange();
  const [categoryId, setCategoryId] = useState("");
  const target = categoryId ? planCategoryChange(Object.keys(recipes), categoryId) : null;
  const consequence = isDemoRecipeCode(sourceCode) ? BASE_CONSEQUENCE + DEMO_CONSEQUENCE : BASE_CONSEQUENCE;

  const confirm = async () => {
    if (!target) return false;
    const ok = await changeCategory(apiId, target);
    if (ok) onClose();
    return ok;
  };

  return (
    <ConfirmActionModal
      title="Changer la catégorie"
      intro={`Recette « ${recipeName} ». Le N° devient le prochain libre de la nouvelle catégorie.`}
      recap={buildCategoryChangeRecap(categories, sourceCode, currentCategoryId, target)}
      consequence={consequence}
      confirmLabel="Confirmer"
      confirmDisabled={!target}
      onConfirm={confirm}
      onCancel={onClose}
    >
      <label className="flex flex-col gap-1">
        <span className="text-xs font-bold text-slate-500">Nouvelle catégorie</span>
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={FORM_INPUT_CLASS}>
          <option value="" disabled>
            À définir
          </option>
          {categoryChangeOptions(categories, currentCategoryId).map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>
    </ConfirmActionModal>
  );
};
