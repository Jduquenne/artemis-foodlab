import { useMemo } from "react";
import ingredientsTemplate from "./templates/ingredients-card.svg?raw";
import { IngredientsCardData, IngredientLineItem } from "./photoBuilderTypes";

export interface IngredientsCardProps extends IngredientsCardData {
  scale?: number;
}

function buildIngredientTspans(lines: IngredientLineItem[]): string {
  return lines
    .map((item, i) => {
      const dy = i === 0 ? "0" : item.isNewCategory ? "12" : "7";
      const content = item.baseLabel
        ? `<tspan font-weight="bold">${item.baseLabel}</tspan> ${item.text}`
        : item.text;
      return `  <tspan x="71" dy="${dy}">${content}</tspan>`;
    })
    .join("\n");
}

function buildIngredientsSvg(data: IngredientsCardData): string {
  return ingredientsTemplate
    .replace("[[PORTIONS]]", String(data.portions))
    .replace("[[INGREDIENT_TSPANS]]", buildIngredientTspans(data.ingredientLines))
    .replace("[[RECIPE_NUMBER]]", String(data.recipeNumber))
    .replace('fill="[[COLOR_BG]]"', `fill="${data.colors.bg}"`)
    .replace('fill="[[COLOR_BAND]]"', `fill="${data.colors.band}"`);
}

export const IngredientsCard = ({
  scale = 1,
  recipeNumber,
  portions,
  ingredientLines,
  colors,
}: IngredientsCardProps) => {
  const svgContent = useMemo(
    () => buildIngredientsSvg({ recipeNumber, portions, ingredientLines, colors }),
    [recipeNumber, portions, ingredientLines, colors]
  );

  return (
    <div
      style={{ width: 189 * scale, height: 208 * scale, flexShrink: 0 }}
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );
};
