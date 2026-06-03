import { useMemo } from "react";
import { RecipeDetails } from "../../../core/domain/types";
import { recipeToRecetteCardData } from "../../utils/cards/cardAdapter";
import { buildRecetteSvg } from "../../utils/cards/cardSvg";
import { SvgCard } from "./SvgCard";

const cache = new Map<string, string>();

export interface RecipeRecetteCardProps {
  recipeId: string;
  recipe: RecipeDetails;
  scale?: number;
  fill?: boolean;
}

export const RecipeRecetteCard = ({ recipeId, recipe, scale, fill }: RecipeRecetteCardProps) => {
  const svgContent = useMemo(() => {
    const cached = cache.get(recipeId);
    if (cached) return cached;
    const svg = buildRecetteSvg(recipeToRecetteCardData(recipeId, recipe));
    cache.set(recipeId, svg);
    return svg;
  }, [recipeId, recipe]);

  return <SvgCard svgContent={svgContent} width={559} height={397} scale={scale} fill={fill} />;
};
