import { useMemo } from "react";
import { RecipeDetails } from "../../../core/domain/recipe";
import { calculateRecipeMacros } from "../../utils/macroUtils";
import { recipeToFoodCardData } from "../../utils/cards/cardAdapter";
import { buildFoodCardSvg } from "../../utils/cards/cardSvg";
import { useMediaSrc } from "../../hooks/useMediaSrc";
import { useFoodsSnapshot, useRecipesSnapshot } from "../../hooks/useCatalogueSnapshot";
import { createCardCache } from "../../utils/cards/cardCache";
import { SvgCard } from "./SvgCard";

const renderFoodSvg = createCardCache(buildFoodCardSvg);

export interface FoodPhotoCardProps {
  recipe: RecipeDetails;
  scale?: number;
  fill?: boolean;
  cover?: boolean;
}

export const FoodPhotoCard = ({ recipe, scale, fill, cover }: FoodPhotoCardProps) => {
  const imageHref = useMediaSrc(recipe.assets.mealPhoto) ?? "";
  const recipes = useRecipesSnapshot();
  const foods = useFoodsSnapshot();
  const svgContent = useMemo(() => {
    try {
      const macros = calculateRecipeMacros(recipe, recipes, foods);
      return renderFoodSvg(recipeToFoodCardData(recipe, macros, imageHref));
    } catch {
      return renderFoodSvg(recipeToFoodCardData(recipe, null, imageHref));
    }
  }, [recipe, recipes, foods, imageHref]);

  return <SvgCard svgContent={svgContent} width={189} height={208} scale={scale} fill={fill} cover={cover} />;
};
