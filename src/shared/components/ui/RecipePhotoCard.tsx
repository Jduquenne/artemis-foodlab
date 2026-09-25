import { useMemo } from "react";
import { RecipeDetails } from "../../../core/domain/recipe";
import { calculateRecipeMacros } from "../../utils/macroUtils";
import { recipeToPhotoCardData } from "../../utils/cards/cardAdapter";
import { buildPhotoSvg } from "../../utils/cards/cardSvg";
import { useMediaSrc } from "../../hooks/useMediaSrc";
import { useFoodsSnapshot, useRecipesSnapshot } from "../../hooks/useCatalogueSnapshot";
import { createCardCache } from "../../utils/cards/cardCache";
import { SvgCard } from "./SvgCard";

const renderPhotoSvg = createCardCache(buildPhotoSvg);

export interface RecipePhotoCardProps {
  recipeId: string;
  recipe: RecipeDetails;
  scale?: number;
  fill?: boolean;
  cover?: boolean;
}

export const RecipePhotoCard = ({ recipeId, recipe, scale, fill, cover }: RecipePhotoCardProps) => {
  const imageHref = useMediaSrc(recipe.assets.mealPhoto) ?? "";
  const recipes = useRecipesSnapshot();
  const foods = useFoodsSnapshot();
  const svgContent = useMemo(() => {
    try {
      const macros = calculateRecipeMacros(recipe, recipes, foods);
      return renderPhotoSvg(recipeToPhotoCardData(recipeId, recipe, macros, imageHref));
    } catch {
      return renderPhotoSvg(recipeToPhotoCardData(recipeId, recipe, null, imageHref));
    }
  }, [recipeId, recipe, recipes, foods, imageHref]);

  return <SvgCard svgContent={svgContent} width={189} height={208} scale={scale} fill={fill} cover={cover} />;
};
