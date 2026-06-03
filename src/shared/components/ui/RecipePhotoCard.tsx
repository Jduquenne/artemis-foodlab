import { useMemo } from "react";
import { RecipeDetails } from "../../../core/domain/types";
import { calculateRecipeMacros } from "../../utils/macroUtils";
import { recipeToPhotoCardData } from "../../utils/cards/cardAdapter";
import { buildPhotoSvg } from "../../utils/cards/cardSvg";
import { typedRecipesDb } from "../../../core/typed-db/typedRecipesDb";
import { typedFoodDb } from "../../../core/typed-db/typedFoodDb";
import { SvgCard } from "./SvgCard";

const cache = new Map<string, string>();

export interface RecipePhotoCardProps {
  recipeId: string;
  recipe: RecipeDetails;
  scale?: number;
  fill?: boolean;
  cover?: boolean;
}

export const RecipePhotoCard = ({ recipeId, recipe, scale, fill, cover }: RecipePhotoCardProps) => {
  const svgContent = useMemo(() => {
    const cached = cache.get(recipeId);
    if (cached) return cached;
    try {
      const macros = calculateRecipeMacros(recipe, typedRecipesDb, typedFoodDb);
      const svg = buildPhotoSvg(recipeToPhotoCardData(recipeId, recipe, macros));
      cache.set(recipeId, svg);
      return svg;
    } catch {
      const svg = buildPhotoSvg(recipeToPhotoCardData(recipeId, recipe, null));
      cache.set(recipeId, svg);
      return svg;
    }
  }, [recipeId, recipe]);

  return <SvgCard svgContent={svgContent} width={189} height={208} scale={scale} fill={fill} cover={cover} />;
};
