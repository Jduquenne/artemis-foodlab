import { useMemo } from "react";
import { RecipeDetails } from "../../../core/domain/recipe";
import { recipeToIngredientsCardData } from "../../utils/cards/cardAdapter";
import { buildIngredientsSvg } from "../../utils/cards/cardSvg";
import { createCardCache } from "../../utils/cards/cardCache";
import { SvgCard } from "./SvgCard";

const renderIngredientsSvg = createCardCache(buildIngredientsSvg);

export interface RecipeIngredientsCardProps {
  recipeId: string;
  recipe: RecipeDetails;
  scale?: number;
  fill?: boolean;
}

export const RecipeIngredientsCard = ({ recipeId, recipe, scale, fill }: RecipeIngredientsCardProps) => {
  const svgContent = useMemo(
    () => renderIngredientsSvg(recipeToIngredientsCardData(recipeId, recipe)),
    [recipeId, recipe],
  );

  return <SvgCard svgContent={svgContent} width={189} height={208} scale={scale} fill={fill} />;
};
