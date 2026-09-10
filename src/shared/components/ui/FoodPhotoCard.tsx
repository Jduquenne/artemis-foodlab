import { useMemo } from "react";
import { RecipeDetails } from "../../../core/domain/types";
import { calculateRecipeMacros } from "../../utils/macroUtils";
import { recipeToFoodCardData } from "../../utils/cards/cardAdapter";
import { buildFoodCardSvg } from "../../utils/cards/cardSvg";
import { typedRecipesDb } from "../../../core/typed-db/typedRecipesDb";
import { typedFoodDb } from "../../../core/typed-db/typedFoodDb";
import { useMediaSrc } from "../../hooks/useMediaSrc";
import { SvgCard } from "./SvgCard";

const cache = new Map<string, string>();

export interface FoodPhotoCardProps {
  recipeId: string;
  recipe: RecipeDetails;
  scale?: number;
  fill?: boolean;
  cover?: boolean;
}

export const FoodPhotoCard = ({ recipeId, recipe, scale, fill, cover }: FoodPhotoCardProps) => {
  const imageHref = useMediaSrc(recipe.assets.mealPhoto) ?? "";
  const svgContent = useMemo(() => {
    const cacheKey = `${recipeId}|${imageHref}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;
    try {
      const macros = calculateRecipeMacros(recipe, typedRecipesDb, typedFoodDb);
      const svg = buildFoodCardSvg(recipeToFoodCardData(recipe, macros, imageHref));
      cache.set(cacheKey, svg);
      return svg;
    } catch {
      const svg = buildFoodCardSvg(recipeToFoodCardData(recipe, null, imageHref));
      cache.set(cacheKey, svg);
      return svg;
    }
  }, [recipeId, recipe, imageHref]);

  return <SvgCard svgContent={svgContent} width={189} height={208} scale={scale} fill={fill} cover={cover} />;
};
