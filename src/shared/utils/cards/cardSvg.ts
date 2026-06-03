import photoTemplate from "./templates/photo-card.svg?raw";
import ingredientsTemplate from "./templates/ingredients-card.svg?raw";
import recetteTemplate from "./templates/recette-card.svg?raw";
import recetteBookTemplate from "./templates/recette-book-card.svg?raw";
import foodCardTemplate from "./templates/food-card.svg?raw";
import {
  SmallCardData,
  IngredientsCardData,
  RecetteCardData,
  RecetteBookCardData,
  FoodCardData,
} from "../../../core/domain/cardTypes";
import {
  buildRecipeNameText,
  buildInstructionText,
  buildSmallIngredientTspans,
  buildRecetteIngredients,
  computeSmallCardFontSize,
  computeRecetteFontSize,
  buildFoodLabelBg,
} from "./cardUtils";

export function buildPhotoSvg(data: SmallCardData): string {
  return photoTemplate
    .replace('href="[[IMAGE_HREF]]"', `href="${data.imageHref}"`)
    .replace(
      "[[RECIPE_NAME_TEXT]]",
      buildRecipeNameText(data.recipeName, 71.875, 15.5, 121.75, 11.1, "#ffffff"),
    )
    .replace("[[FIBRES]]", `${data.fibres}g`)
    .replace("[[GLUCIDES]]", `${data.glucides}g`)
    .replace("[[LIPIDES]]", `${data.lipides}g`)
    .replace("[[PROTEINES]]", `${data.proteines}g`)
    .replace("[[KCAL]]", String(data.kcal))
    .replace("[[RECIPE_NUMBER]]", String(data.recipeNumber))
    .replace('fill="[[COLOR_BG]]"', `fill="${data.colors.bg}"`)
    .split('fill="[[COLOR_BAND]]"')
    .join(`fill="${data.colors.band}"`)
    .replace('fill="[[COLOR_CIRCLE]]"', `fill="${data.colors.circle}"`);
}

export function buildIngredientsSvg(data: IngredientsCardData): string {
  const fontSize = computeSmallCardFontSize(data.ingredientLines.length);
  return ingredientsTemplate
    .replace("[[PORTIONS]]", String(data.portions))
    .replace("[[INGREDIENT_FONT_SIZE]]", String(fontSize))
    .replace("[[INGREDIENT_TSPANS]]", buildSmallIngredientTspans(data.ingredientLines, fontSize))
    .replace("[[RECIPE_NUMBER]]", String(data.recipeNumber))
    .replace('fill="[[COLOR_BG]]"', `fill="${data.colors.bg}"`)
    .replace('fill="[[COLOR_BAND]]"', `fill="${data.colors.band}"`);
}

export function buildRecetteBookSvg(data: RecetteBookCardData): string {
  const fontSize = computeRecetteFontSize(data.ingredients.length);
  const { tspans, rects } = buildRecetteIngredients(data.ingredients, data.colors, fontSize, 195.5, 120);
  return recetteBookTemplate
    .replace('href="[[IMAGE_HREF]]"', `href="${data.imageHref}"`)
    .replace('href="[[BOOK_IMAGE_HREF]]"', `href="${data.bookImageHref}"`)
    .replace("[[RECIPE_NAME_TEXT]]", buildRecipeNameText(data.recipeName, 140, 23, 250, 17.9, "#ffffff"))
    .replace("[[PORTIONS]]", String(data.portions))
    .replace("[[INGREDIENT_FONT_SIZE]]", String(fontSize))
    .replace("[[INGREDIENT_TSPANS]]", tspans)
    .replace("[[BASE_RECTS]]", rects)
    .replace("[[PAGE_NUMBER]]", String(data.pageNumber))
    .replace("[[RECIPE_NUMBER]]", String(data.recipeNumber))
    .replace('fill="[[COLOR_BG]]"', `fill="${data.colors.bg}"`)
    .split('fill="[[COLOR_BAND]]"')
    .join(`fill="${data.colors.band}"`)
    .replace('fill="[[COLOR_CIRCLE]]"', `fill="${data.colors.circle}"`);
}

export function buildFoodCardSvg(data: FoodCardData): string {
  return foodCardTemplate
    .replace('href="[[IMAGE_HREF]]"', `href="${data.imageHref}"`)
    .replace("[[FOOD_LABEL_BG]]", buildFoodLabelBg(data.foodLabel))
    .replace("[[FOOD_LABEL]]", data.foodLabel)
    .replace("[[FIBRES]]", `${data.fibres}g`)
    .replace("[[GLUCIDES]]", `${data.glucides}g`)
    .replace("[[LIPIDES]]", `${data.lipides}g`)
    .replace("[[PROTEINES]]", `${data.proteines}g`)
    .replace("[[KCAL]]", String(data.kcal))
    .replace('fill="[[COLOR_BG]]"', `fill="${data.colors.bg}"`)
    .replace('fill="[[COLOR_CIRCLE]]"', `fill="${data.colors.circle}"`);
}

export function buildRecetteSvg(data: RecetteCardData): string {
  const fontSize = computeRecetteFontSize(data.ingredients.length);
  const { tspans, rects } = buildRecetteIngredients(data.ingredients, data.colors, fontSize);
  return recetteTemplate
    .replace('href="[[IMAGE_HREF]]"', `href="${data.imageHref}"`)
    .replace("[[RECIPE_NAME_TEXT]]", buildRecipeNameText(data.recipeName, 140, 23, 250, 17.9, "#ffffff"))
    .replace("[[PORTIONS]]", String(data.portions))
    .replace("[[INGREDIENT_FONT_SIZE]]", String(fontSize))
    .replace("[[INGREDIENT_TSPANS]]", tspans)
    .replace("[[BASE_RECTS]]", rects)
    .replace("[[INSTRUCTION_TEXT]]", buildInstructionText(data.instructions, 160, 110, 247, 175))
    .replace("[[RECIPE_NUMBER]]", String(data.recipeNumber))
    .replace('fill="[[COLOR_BG]]"', `fill="${data.colors.bg}"`)
    .split('fill="[[COLOR_BAND]]"')
    .join(`fill="${data.colors.band}"`)
    .replace('fill="[[COLOR_CIRCLE]]"', `fill="${data.colors.circle}"`);
}
