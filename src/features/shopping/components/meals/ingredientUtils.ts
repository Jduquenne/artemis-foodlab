import { IngredientSource } from '../../../../core/utils/shoppingLogic';

export interface RecipeCardIngredient {
    ingredientKey: string;
    name: string;
    quantity: number;
    unit: string;
    sources: IngredientSource[];
}

export function isIngChecked(ing: RecipeCardIngredient, sourceChecked: Set<string>): boolean {
    return ing.sources.length > 0 && ing.sources.every(
        s => sourceChecked.has(`${ing.ingredientKey}::${s.recipeId}::${s.day}::${s.slot}`)
    );
}
