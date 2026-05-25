import photoTemplate from "./templates/photo-card.svg?raw";
import ingredientsTemplate from "./templates/ingredients-card.svg?raw";
import recetteTemplate from "./templates/recette-card.svg?raw";
import {
  SmallCardData,
  IngredientsCardData,
  RecetteCardData,
  IngredientLineItem,
} from "./photoBuilderTypes";
import { CardColors } from "./photoBuilderColors";
import { escapeXml, makeMeasureCtx, wrapToLines, wrapLineAtMaxChars } from "../../../../core/utils/photoBuilderUtils";

const RECETTE_TEXT_Y = 110;
const RECETTE_LINE_H = 11;
const RECETTE_CAT_EXTRA_H = 3;
const RECETTE_LINE_MAX_CHARS = 38;
const BADGE_W = 14;

function buildRecipeNameText(
  name: string,
  cx: number,
  cy: number,
  maxWidth: number,
  fontSize: number,
  color: string,
): string {
  const fontFamily = "Alice, Georgia, serif";
  const ctx = makeMeasureCtx(`${fontSize}px ${fontFamily}`);
  const lines = wrapToLines(name, maxWidth, ctx);
  const lineH = fontSize * 0.95;
  const firstY = cy - ((lines.length - 1) * lineH) / 2;
  const tspans = lines
    .map(
      (line, i) =>
        `<tspan x="${cx}"${i > 0 ? ` dy="${lineH}"` : ""}>${escapeXml(line)}</tspan>`,
    )
    .join("");
  return `<text font-family="${fontFamily}" font-size="${fontSize}" fill="${color}" text-anchor="middle" dominant-baseline="middle" x="${cx}" y="${firstY}">${tspans}</text>`;
}

function buildInstructionText(
  instructions: string[],
  x: number,
  y: number,
  areaWidth: number,
  areaHeight: number,
): string {
  const fontSize = 7.5;
  const fontFamily = "'Proxima Nova', Helvetica, Arial, sans-serif";
  const lineH = fontSize * 1.4;
  const bulletX = x + 2;
  const textX = x + 10;
  const ctx = makeMeasureCtx(`${fontSize}px Proxima Nova, Helvetica, Arial, sans-serif`);
  const firstY = y + fontSize;
  const maxY = y + areaHeight;
  const parts: string[] = [];
  let curY = firstY;
  for (const step of instructions) {
    if (curY > maxY) break;
    const lines = wrapToLines(step, areaWidth - (textX - x), ctx);
    for (let li = 0; li < lines.length; li++) {
      if (curY > maxY) break;
      if (li === 0) {
        const dy = parts.length > 0 ? ` dy="${lineH}"` : "";
        parts.push(
          `<tspan x="${bulletX}"${dy}>•</tspan><tspan x="${textX}">${escapeXml(lines[0])}</tspan>`,
        );
      } else {
        parts.push(
          `<tspan x="${textX}" dy="${lineH}">${escapeXml(lines[li])}</tspan>`,
        );
      }
      curY += lineH;
    }
  }
  return `<text font-family="${fontFamily}" font-size="${fontSize}" fill="#000000" y="${firstY}">${parts.join("")}</text>`;
}

export function buildPhotoSvg(data: SmallCardData): string {
  return photoTemplate
    .replace('href="[[IMAGE_HREF]]"', `href="${data.imageHref}"`)
    .replace("[[RECIPE_NAME_TEXT]]", buildRecipeNameText(data.recipeName, 71.875, 15.5, 121.75, 11.1, "#ffffff"))
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

function buildSmallIngredientTspans(lines: IngredientLineItem[]): string {
  return lines
    .map((item, i) => {
      const dy = i === 0 ? "0" : item.isNewCategory ? "12" : "7";
      const content = item.baseLabel
        ? `<tspan font-weight="bold">${item.baseLabel}</tspan> ${item.text}`
        : item.text;
      return `  <tspan x="71" dy="${dy}">${content}</tspan>`;
    })
    .join("\n");
}

export function buildIngredientsSvg(data: IngredientsCardData): string {
  return ingredientsTemplate
    .replace("[[PORTIONS]]", String(data.portions))
    .replace("[[INGREDIENT_TSPANS]]", buildSmallIngredientTspans(data.ingredientLines))
    .replace("[[RECIPE_NUMBER]]", String(data.recipeNumber))
    .replace('fill="[[COLOR_BG]]"', `fill="${data.colors.bg}"`)
    .replace('fill="[[COLOR_BAND]]"', `fill="${data.colors.band}"`);
}

function buildRecetteIngredients(
  ingredients: IngredientLineItem[],
  colors: CardColors,
): { tspans: string; rects: string } {
  const tspanParts: string[] = [];
  const rectParts: string[] = [];
  let cumY = RECETTE_TEXT_Y;
  const ctx = makeMeasureCtx("8px Oswald, Arial Narrow, sans-serif");

  for (let i = 0; i < ingredients.length; i++) {
    const item = ingredients[i];
    const subLines = wrapLineAtMaxChars(item.text, RECETTE_LINE_MAX_CHARS);

    for (let si = 0; si < subLines.length; si++) {
      const isVeryFirst = i === 0 && si === 0;

      if (isVeryFirst) {
        tspanParts.push(`  <tspan x="29.5" dy="0">${escapeXml(subLines[si])}</tspan>`);
      } else if (si === 0) {
        const dy = item.isNewCategory ? RECETTE_LINE_H + RECETTE_CAT_EXTRA_H : RECETTE_LINE_H;
        cumY += dy;
        tspanParts.push(`  <tspan x="29.5" dy="${dy}">${escapeXml(subLines[si])}</tspan>`);
      } else {
        cumY += RECETTE_LINE_H;
        tspanParts.push(`  <tspan x="29.5" dy="${RECETTE_LINE_H}">${escapeXml(subLines[si])}</tspan>`);
      }

      if (si === 0 && item.baseLabel) {
        const textWidth = ctx.measureText(subLines[0]).width;
        const badgeX = 29.5 + textWidth + 3;
        rectParts.push(
          `<rect x="${badgeX.toFixed(1)}" y="${cumY - 7}" width="${BADGE_W}" height="8" rx="1.5" fill="${colors.band}" />`,
          `<text x="${(badgeX + BADGE_W / 2).toFixed(1)}" y="${cumY - 0.5}" font-size="5.5" fill="white" font-weight="bold" text-anchor="middle" font-family="Oswald, sans-serif">${item.baseLabel}</text>`,
        );
      }
    }
  }

  return { tspans: tspanParts.join("\n"), rects: rectParts.join("\n") };
}

export function buildRecetteSvg(data: RecetteCardData): string {
  const { tspans, rects } = buildRecetteIngredients(data.ingredients, data.colors);
  return recetteTemplate
    .replace('href="[[IMAGE_HREF]]"', `href="${data.imageHref}"`)
    .replace("[[RECIPE_NAME_TEXT]]", buildRecipeNameText(data.recipeName, 140, 23, 250, 17.9, "#ffffff"))
    .replace("[[PORTIONS]]", String(data.portions))
    .replace("[[INGREDIENT_TSPANS]]", tspans)
    .replace("[[BASE_RECTS]]", rects)
    .replace("[[INSTRUCTION_TEXT]]", buildInstructionText(data.instructions, 160, 112, 247, 175))
    .replace("[[RECIPE_NUMBER]]", String(data.recipeNumber))
    .replace('fill="[[COLOR_BG]]"', `fill="${data.colors.bg}"`)
    .split('fill="[[COLOR_BAND]]"').join(`fill="${data.colors.band}"`)
    .replace('fill="[[COLOR_CIRCLE]]"', `fill="${data.colors.circle}"`);
}
