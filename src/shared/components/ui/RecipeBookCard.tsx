import { useMemo } from "react";
import { RecipeDetails } from "../../../core/domain/recipe";
import { recipeToBookCardData } from "../../utils/cards/cardAdapter";
import { buildRecetteBookSvg } from "../../utils/cards/cardSvg";
import { useMediaSrc } from "../../hooks/useMediaSrc";
import { createCardCache } from "../../utils/cards/cardCache";
import { SvgCard } from "./SvgCard";

const renderBookSvg = createCardCache(buildRecetteBookSvg);

export interface RecipeBookCardProps {
  recipeId: string;
  recipe: RecipeDetails;
  scale?: number;
  fill?: boolean;
}

export const RecipeBookCard = ({ recipeId, recipe, scale, fill }: RecipeBookCardProps) => {
  const imageHref = useMediaSrc(recipe.assets.mealPhoto) ?? "";
  const bookImageHref = useMediaSrc(recipe.assets.bookPhoto) ?? "";
  const svgContent = useMemo(
    () => renderBookSvg(recipeToBookCardData(recipeId, recipe, imageHref, bookImageHref)),
    [recipeId, recipe, imageHref, bookImageHref],
  );

  return <SvgCard svgContent={svgContent} width={559} height={397} scale={scale} fill={fill} />;
};
