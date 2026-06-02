import { useMemo } from "react";
import { RecipeDetails } from "../../../core/domain/types";
import { recipeToIngredientsCardData } from "../../../core/utils/photoBuilderAdapter";
import { buildIngredientsSvg } from "../../../core/utils/photoBuilderSvg";
import { SvgCard } from "./SvgCard";

const cache = new Map<string, string>();

export interface RecipeIngredientsCardProps {
  recipeId: string;
  recipe: RecipeDetails;
  scale?: number;
  fill?: boolean;
}

export const RecipeIngredientsCard = ({ recipeId, recipe, scale, fill }: RecipeIngredientsCardProps) => {
  const svgContent = useMemo(() => {
    const cached = cache.get(recipeId);
    if (cached) return cached;
    const svg = buildIngredientsSvg(recipeToIngredientsCardData(recipeId, recipe));
    cache.set(recipeId, svg);
    return svg;
  }, [recipeId, recipe]);

  return <SvgCard svgContent={svgContent} width={189} height={208} scale={scale} fill={fill} />;
};
