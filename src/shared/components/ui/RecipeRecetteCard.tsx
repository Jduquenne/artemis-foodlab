import { useMemo } from "react";
import { RecipeDetails } from "../../../core/domain/types";
import { recipeToRecetteCardData } from "../../utils/cards/cardAdapter";
import { buildRecetteSvg } from "../../utils/cards/cardSvg";
import { useMediaSrc } from "../../hooks/useMediaSrc";
import { SvgCard } from "./SvgCard";

const cache = new Map<string, string>();

export interface RecipeRecetteCardProps {
  recipeId: string;
  recipe: RecipeDetails;
  scale?: number;
  fill?: boolean;
}

export const RecipeRecetteCard = ({ recipeId, recipe, scale, fill }: RecipeRecetteCardProps) => {
  const imageHref = useMediaSrc(recipe.assets.mealPhoto) ?? "";
  const svgContent = useMemo(() => {
    const cacheKey = `${recipeId}|${imageHref}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;
    const svg = buildRecetteSvg(recipeToRecetteCardData(recipeId, recipe, imageHref));
    cache.set(cacheKey, svg);
    return svg;
  }, [recipeId, recipe, imageHref]);

  return <SvgCard svgContent={svgContent} width={559} height={397} scale={scale} fill={fill} />;
};
