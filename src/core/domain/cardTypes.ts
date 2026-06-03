export interface CardColors {
  bg: string;
  band: string;
  circle: string;
}

export interface IngredientLineItem {
  text: string;
  isNewCategory: boolean;
  baseLabel?: string;
}

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

export interface FoodCardData {
  imageHref: string;
  foodLabel: string;
  fibres: number;
  glucides: number;
  lipides: number;
  proteines: number;
  kcal: number;
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
