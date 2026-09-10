import { useMemo } from "react";
import { RecipeDetails } from "../../../core/domain/types";
import { recipeToBookCardData } from "../../utils/cards/cardAdapter";
import { buildRecetteBookSvg } from "../../utils/cards/cardSvg";
import { useMediaSrc } from "../../hooks/useMediaSrc";
import { SvgCard } from "./SvgCard";

const cache = new Map<string, string>();

export interface RecipeBookCardProps {
  recipeId: string;
  recipe: RecipeDetails;
  scale?: number;
  fill?: boolean;
}

export const RecipeBookCard = ({ recipeId, recipe, scale, fill }: RecipeBookCardProps) => {
  const imageHref = useMediaSrc(recipe.assets.mealPhoto) ?? "";
  const bookImageHref = useMediaSrc(recipe.assets.bookPhoto) ?? "";
  const svgContent = useMemo(() => {
    const cacheKey = `${recipeId}|${imageHref}|${bookImageHref}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;
    const svg = buildRecetteBookSvg(recipeToBookCardData(recipeId, recipe, imageHref, bookImageHref));
    cache.set(cacheKey, svg);
    return svg;
  }, [recipeId, recipe, imageHref, bookImageHref]);

  return <SvgCard svgContent={svgContent} width={559} height={397} scale={scale} fill={fill} />;
};
