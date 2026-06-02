import { useMemo } from "react";
import { RecipeDetails } from "../../../core/domain/types";
import { recipeToBookCardData } from "../../../core/utils/photoBuilderAdapter";
import { buildRecetteBookSvg } from "../../../core/utils/photoBuilderSvg";
import { SvgCard } from "./SvgCard";

const cache = new Map<string, string>();

export interface RecipeBookCardProps {
  recipeId: string;
  recipe: RecipeDetails;
  scale?: number;
  fill?: boolean;
}

export const RecipeBookCard = ({ recipeId, recipe, scale, fill }: RecipeBookCardProps) => {
  const svgContent = useMemo(() => {
    const cached = cache.get(recipeId);
    if (cached) return cached;
    const svg = buildRecetteBookSvg(recipeToBookCardData(recipeId, recipe));
    cache.set(recipeId, svg);
    return svg;
  }, [recipeId, recipe]);

  return <SvgCard svgContent={svgContent} width={559} height={397} scale={scale} fill={fill} />;
};
