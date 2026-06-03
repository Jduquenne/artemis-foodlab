import { useMemo } from "react";
import { RecipeDetails } from "../../../core/domain/types";
import { calculateRecipeMacros } from "../../../core/utils/macroUtils";
import { recipeToFoodCardData } from "../../../core/utils/photoBuilderAdapter";
import { buildFoodCardSvg } from "../../../core/utils/photoBuilderSvg";
import { typedRecipesDb } from "../../../core/typed-db/typedRecipesDb";
import { typedFoodDb } from "../../../core/typed-db/typedFoodDb";
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
  const svgContent = useMemo(() => {
    const cached = cache.get(recipeId);
    if (cached) return cached;
    try {
      const macros = calculateRecipeMacros(recipe, typedRecipesDb, typedFoodDb);
      const svg = buildFoodCardSvg(recipeToFoodCardData(recipe, macros));
      cache.set(recipeId, svg);
      return svg;
    } catch {
      const svg = buildFoodCardSvg(recipeToFoodCardData(recipe, null));
      cache.set(recipeId, svg);
      return svg;
    }
  }, [recipeId, recipe]);

  return <SvgCard svgContent={svgContent} width={189} height={208} scale={scale} fill={fill} cover={cover} />;
};
