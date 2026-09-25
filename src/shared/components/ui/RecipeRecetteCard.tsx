import { useMemo } from "react";
import { RecipeDetails } from "../../../core/domain/recipe";
import { recipeToRecetteCardData } from "../../utils/cards/cardAdapter";
import { buildRecetteSvg } from "../../utils/cards/cardSvg";
import { useMediaSrc } from "../../hooks/useMediaSrc";
import { createCardCache } from "../../utils/cards/cardCache";
import { SvgCard } from "./SvgCard";

const renderRecetteSvg = createCardCache(buildRecetteSvg);

export interface RecipeRecetteCardProps {
  recipeId: string;
  recipe: RecipeDetails;
  scale?: number;
  fill?: boolean;
}

export const RecipeRecetteCard = ({ recipeId, recipe, scale, fill }: RecipeRecetteCardProps) => {
  const imageHref = useMediaSrc(recipe.assets.mealPhoto) ?? "";
  const svgContent = useMemo(
    () => renderRecetteSvg(recipeToRecetteCardData(recipeId, recipe, imageHref)),
    [recipeId, recipe, imageHref],
  );

  return <SvgCard svgContent={svgContent} width={559} height={397} scale={scale} fill={fill} />;
};
