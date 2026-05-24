import { useMemo } from "react";
import photoTemplate from "./templates/photo-card.svg?raw";
import { SmallCardData } from "./photoBuilderTypes";

export interface PhotoCardProps extends SmallCardData {
  scale?: number;
}

function buildPhotoSvg(data: SmallCardData): string {
  return photoTemplate
    .replace('href="[[IMAGE_HREF]]"', `href="${data.imageHref}"`)
    .replace("[[RECIPE_NAME]]", data.recipeName)
    .replace("[[FIBRES]]", `${data.fibres}g`)
    .replace("[[GLUCIDES]]", `${data.glucides}g`)
    .replace("[[LIPIDES]]", `${data.lipides}g`)
    .replace("[[PROTEINES]]", `${data.proteines}g`)
    .replace("[[KCAL]]", String(data.kcal))
    .replace("[[RECIPE_NUMBER]]", String(data.recipeNumber))
    .replace('fill="[[COLOR_BG]]"', `fill="${data.colors.bg}"`)
    .split('fill="[[COLOR_BAND]]"').join(`fill="${data.colors.band}"`)
    .replace('fill="[[COLOR_CIRCLE]]"', `fill="${data.colors.circle}"`);
}

export const PhotoCard = ({
  scale = 1,
  imageHref,
  recipeName,
  recipeNumber,
  fibres,
  glucides,
  lipides,
  proteines,
  kcal,
  colors,
}: PhotoCardProps) => {
  const svgContent = useMemo(
    () => buildPhotoSvg({ imageHref, recipeName, recipeNumber, fibres, glucides, lipides, proteines, kcal, colors }),
    [imageHref, recipeName, recipeNumber, fibres, glucides, lipides, proteines, kcal, colors]
  );

  return (
    <div
      style={{ width: 189 * scale, height: 208 * scale, flexShrink: 0 }}
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );
};
