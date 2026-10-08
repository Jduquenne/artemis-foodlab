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
} from "./cardTypes";
import {
  buildRecipeNameText,
  buildInstructionText,
  buildSmallIngredientTspans,
  buildRecetteIngredients,
  computeSmallCardFontSize,
  computeRecetteFontSize,
  buildFoodLabelBg,
  escapeXml,
} from "./cardUtils";

function fillTemplate(template: string, values: Record<string, string>): string {
  return Object.entries(values).reduce((svg, [placeholder, value]) => svg.split(placeholder).join(value), template);
}

const imageHref = (url: string): string => `href="${escapeXml(url)}"`;

export function buildPhotoSvg(data: SmallCardData): string {
  return fillTemplate(photoTemplate, {
    'href="[[IMAGE_HREF]]"': imageHref(data.imageHref),
    "[[RECIPE_NAME_TEXT]]": buildRecipeNameText(data.recipeName, 71.875, 15.5, 121.75, 11.1, "#ffffff"),
    "[[FIBRES]]": `${data.fibers}g`,
    "[[GLUCIDES]]": `${data.carbohydrates}g`,
    "[[LIPIDES]]": `${data.lipids}g`,
    "[[PROTEINES]]": `${data.proteins}g`,
    "[[KCAL]]": String(data.kcal),
    "[[RECIPE_NUMBER]]": String(data.recipeNumber),
    'fill="[[COLOR_BG]]"': `fill="${data.colors.bg}"`,
    'fill="[[COLOR_BAND]]"': `fill="${data.colors.band}"`,
    'fill="[[COLOR_CIRCLE]]"': `fill="${data.colors.circle}"`,
  });
}

export function buildIngredientsSvg(data: IngredientsCardData): string {
  const fontSize = computeSmallCardFontSize(data.ingredientLines.length);
  return fillTemplate(ingredientsTemplate, {
    "[[PORTIONS]]": String(data.portions),
    "[[INGREDIENT_FONT_SIZE]]": String(fontSize),
    "[[INGREDIENT_TSPANS]]": buildSmallIngredientTspans(data.ingredientLines, fontSize),
    "[[RECIPE_NUMBER]]": String(data.recipeNumber),
    'fill="[[COLOR_BG]]"': `fill="${data.colors.bg}"`,
    'fill="[[COLOR_BAND]]"': `fill="${data.colors.band}"`,
  });
}

export function buildRecetteBookSvg(data: RecetteBookCardData): string {
  const fontSize = computeRecetteFontSize(data.ingredients.length);
  const { tspans, rects } = buildRecetteIngredients(data.ingredients, data.colors, fontSize, 195.5, 120);
  return fillTemplate(recetteBookTemplate, {
    'href="[[IMAGE_HREF]]"': imageHref(data.imageHref),
    'href="[[BOOK_IMAGE_HREF]]"': imageHref(data.bookImageHref),
    "[[RECIPE_NAME_TEXT]]": buildRecipeNameText(data.recipeName, 140, 23, 250, 17.9, "#ffffff"),
    "[[PORTIONS]]": String(data.portions),
    "[[INGREDIENT_FONT_SIZE]]": String(fontSize),
    "[[INGREDIENT_TSPANS]]": tspans,
    "[[BASE_RECTS]]": rects,
    "[[PAGE_NUMBER]]": String(data.pageNumber),
    "[[RECIPE_NUMBER]]": String(data.recipeNumber),
    'fill="[[COLOR_BG]]"': `fill="${data.colors.bg}"`,
    'fill="[[COLOR_BAND]]"': `fill="${data.colors.band}"`,
    'fill="[[COLOR_CIRCLE]]"': `fill="${data.colors.circle}"`,
  });
}

export function buildFoodCardSvg(data: FoodCardData): string {
  return fillTemplate(foodCardTemplate, {
    'href="[[IMAGE_HREF]]"': imageHref(data.imageHref),
    "[[FOOD_LABEL_BG]]": buildFoodLabelBg(data.foodLabel),
    "[[FOOD_LABEL]]": escapeXml(data.foodLabel),
    "[[FIBRES]]": `${data.fibers}g`,
    "[[GLUCIDES]]": `${data.carbohydrates}g`,
    "[[LIPIDES]]": `${data.lipids}g`,
    "[[PROTEINES]]": `${data.proteins}g`,
    "[[KCAL]]": String(data.kcal),
    'fill="[[COLOR_BG]]"': `fill="${data.colors.bg}"`,
    'fill="[[COLOR_CIRCLE]]"': `fill="${data.colors.circle}"`,
  });
}

export function buildRecetteSvg(data: RecetteCardData): string {
  const fontSize = computeRecetteFontSize(data.ingredients.length);
  const { tspans, rects } = buildRecetteIngredients(data.ingredients, data.colors, fontSize);
  return fillTemplate(recetteTemplate, {
    'href="[[IMAGE_HREF]]"': imageHref(data.imageHref),
    "[[RECIPE_NAME_TEXT]]": buildRecipeNameText(data.recipeName, 140, 23, 250, 17.9, "#ffffff"),
    "[[PORTIONS]]": String(data.portions),
    "[[INGREDIENT_FONT_SIZE]]": String(fontSize),
    "[[INGREDIENT_TSPANS]]": tspans,
    "[[BASE_RECTS]]": rects,
    "[[INSTRUCTION_TEXT]]": buildInstructionText(data.instructions, 160, 110, 247, 175),
    "[[RECIPE_NUMBER]]": String(data.recipeNumber),
    'fill="[[COLOR_BG]]"': `fill="${data.colors.bg}"`,
    'fill="[[COLOR_BAND]]"': `fill="${data.colors.band}"`,
    'fill="[[COLOR_CIRCLE]]"': `fill="${data.colors.circle}"`,
  });
}
