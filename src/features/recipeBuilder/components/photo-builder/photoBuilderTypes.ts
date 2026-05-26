import { CardColors } from "../../../../core/utils/photoBuilderUtils";
import { IngredientLineItem } from "../../../../core/utils/recipeBuilderUtils";

export type { IngredientLineItem };

export interface SmallCardData {
  imageHref: string;
  recipeName: string;
  recipeNumber: number;
  fibres: number;
  glucides: number;
  lipides: number;
  proteines: number;
  kcal: number;
  colors: CardColors;
}

export interface IngredientsCardData {
  recipeNumber: number;
  portions: number;
  ingredientLines: IngredientLineItem[];
  colors: CardColors;
}

export interface RecetteCardData {
  imageHref: string;
  recipeName: string;
  recipeNumber: number;
  portions: number;
  ingredients: IngredientLineItem[];
  instructions: string[];
  colors: CardColors;
}

export interface RecetteBookCardData {
  imageHref: string;
  bookImageHref: string;
  recipeName: string;
  recipeNumber: number;
  portions: number;
  ingredients: IngredientLineItem[];
  pageNumber: number;
  colors: CardColors;
}
