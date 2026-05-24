import { useMemo } from "react";
import recetteTemplate from "./templates/recette-card.svg?raw";
import { RecetteCardData, IngredientLineItem } from "./photoBuilderTypes";
import { CardColors } from "./photoBuilderColors";

export interface RecetteCardProps extends RecetteCardData {
  scale?: number;
}

const RECETTE_TEXT_Y = 110;
const RECETTE_LINE_H = 11;
const BADGE_W = 14;

function buildIngredientTspans(ingredients: IngredientLineItem[]): string {
  return ingredients
    .map((item, i) => {
      const x = item.baseLabel ? "46" : "29.5";
      return `  <tspan x="${x}" dy="${i === 0 ? "0" : RECETTE_LINE_H}">${item.text}</tspan>`;
    })
    .join("\n");
}

function buildBaseRects(ingredients: IngredientLineItem[], colors: CardColors): string {
  return ingredients
    .flatMap((item, i) => {
      if (!item.baseLabel) return [];
      const y = RECETTE_TEXT_Y + i * RECETTE_LINE_H;
      return [
        `<rect x="29.5" y="${y - 7}" width="${BADGE_W}" height="8" rx="1.5" fill="${colors.band}" />`,
        `<text x="${29.5 + BADGE_W / 2}" y="${y - 0.5}" font-size="5.5" fill="white" font-weight="bold" text-anchor="middle" font-family="Oswald, sans-serif">${item.baseLabel}</text>`,
      ];
    })
    .join("\n");
}

function buildInstructionItems(instructions: string[]): string {
  return instructions.map((step) => `      <li>${step}</li>`).join("\n") + "\n";
}

function buildRecetteSvg(data: RecetteCardData): string {
  return recetteTemplate
    .replace('href="[[IMAGE_HREF]]"', `href="${data.imageHref}"`)
    .replace("[[RECIPE_NAME]]", data.recipeName)
    .replace("[[PORTIONS]]", String(data.portions))
    .replace("[[INGREDIENT_TSPANS]]", buildIngredientTspans(data.ingredients))
    .replace("[[BASE_RECTS]]", buildBaseRects(data.ingredients, data.colors))
    .replace("[[INSTRUCTION_ITEMS]]", buildInstructionItems(data.instructions))
    .replace("[[RECIPE_NUMBER]]", String(data.recipeNumber))
    .replace('fill="[[COLOR_BG]]"', `fill="${data.colors.bg}"`)
    .split('fill="[[COLOR_BAND]]"').join(`fill="${data.colors.band}"`)
    .replace('fill="[[COLOR_CIRCLE]]"', `fill="${data.colors.circle}"`);
}

export const RecetteCard = ({
  scale = 1,
  imageHref,
  recipeName,
  recipeNumber,
  portions,
  ingredients,
  instructions,
  colors,
}: RecetteCardProps) => {
  const svgContent = useMemo(
    () =>
      buildRecetteSvg({
        imageHref,
        recipeName,
        recipeNumber,
        portions,
        ingredients,
        instructions,
        colors,
      }),
    [imageHref, recipeName, recipeNumber, portions, ingredients, instructions, colors]
  );

  return (
    <div
      style={{ width: 559 * scale, height: 397 * scale, flexShrink: 0 }}
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );
};
