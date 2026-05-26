import { IngredientLineItem } from "./recipeBuilderUtils";

export interface CardColors {
  bg: string;
  band: string;
  circle: string;
}

const MIN_CARD_SCALE = 0.05;

const RECIPE_NAME_FONT = "Alice, Georgia, serif";

const INSTRUCTION_FONT_SIZE = 7.5;
const INSTRUCTION_FONT_FAMILY = "'Proxima Nova', Helvetica, Arial, sans-serif";
const INSTRUCTION_LINE_HEIGHT_RATIO = 1.2;
const INSTRUCTION_BULLET_OFFSET = 2;
const INSTRUCTION_TEXT_INDENT = 10;

const SMALL_CARD_TEXT_X = 71;
const SMALL_CARD_ITEM_DY = 6.5;
const SMALL_CARD_CAT_DY = 10;
const SMALL_CARD_BASE_FONT = 6;
const SMALL_CARD_MD_THRESHOLD = 12;
const SMALL_CARD_SM_THRESHOLD = 16;
const SMALL_CARD_MD_FONT = 5.5;
const SMALL_CARD_SM_FONT = 5;

const RECETTE_TEXT_Y = 110;
const RECETTE_TEXT_X = 29.5;
const RECETTE_LINE_H = 11;
const RECETTE_CAT_EXTRA_H = 3;
const RECETTE_LINE_MAX_CHARS = 38;
const RECETTE_BADGE_W = 14;
const RECETTE_BADGE_H = 8;
const RECETTE_BADGE_GAP = 3;
const RECETTE_BADGE_OFFSET_Y = 7;
const RECETTE_BADGE_FONT_SIZE = 5.5;
const RECETTE_BASE_FONT = 8;
const RECETTE_MD_THRESHOLD = 12;
const RECETTE_SM_THRESHOLD = 18;
const RECETTE_MD_FONT = 7;
const RECETTE_SM_FONT = 6;

export function computeSmallCardFontSize(count: number): number {
  if (count > SMALL_CARD_SM_THRESHOLD) return SMALL_CARD_SM_FONT;
  if (count > SMALL_CARD_MD_THRESHOLD) return SMALL_CARD_MD_FONT;
  return SMALL_CARD_BASE_FONT;
}

export function computeRecetteFontSize(count: number): number {
  if (count > RECETTE_SM_THRESHOLD) return RECETTE_SM_FONT;
  if (count > RECETTE_MD_THRESHOLD) return RECETTE_MD_FONT;
  return RECETTE_BASE_FONT;
}

export function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function makeMeasureCtx(font: string): CanvasRenderingContext2D {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  ctx.font = font;
  return ctx;
}

export function wrapToLines(
  text: string,
  maxWidth: number,
  ctx: CanvasRenderingContext2D,
): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export function wrapLineAtMaxChars(text: string, maxChars: number): string[] {
  if (text.length <= maxChars) return [text];
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export function calculateCardScale(
  cardW: number,
  cardH: number,
  availableH: number,
  availableW: number,
): number {
  return Math.max(
    Math.min(availableH / cardH, availableW / cardW),
    MIN_CARD_SCALE,
  );
}

export function buildRecipeNameText(
  name: string,
  cx: number,
  cy: number,
  maxWidth: number,
  fontSize: number,
  color: string,
): string {
  const ctx = makeMeasureCtx(`${fontSize}px ${RECIPE_NAME_FONT}`);
  const lines = wrapToLines(name, maxWidth, ctx);
  const lineH = fontSize * 0.95;
  const firstY = cy - ((lines.length - 1) * lineH) / 2;
  const tspans = lines
    .map(
      (line, i) =>
        `<tspan x="${cx}"${i > 0 ? ` dy="${lineH}"` : ""}>${escapeXml(line)}</tspan>`,
    )
    .join("");
  return `<text font-family="${RECIPE_NAME_FONT}" font-size="${fontSize}" fill="${color}" text-anchor="middle" dominant-baseline="middle" x="${cx}" y="${firstY}">${tspans}</text>`;
}

export function buildInstructionText(
  instructions: string[],
  x: number,
  y: number,
  areaWidth: number,
  areaHeight: number,
): string {
  const lineH = INSTRUCTION_FONT_SIZE * INSTRUCTION_LINE_HEIGHT_RATIO;
  const bulletX = x + INSTRUCTION_BULLET_OFFSET;
  const textX = x + INSTRUCTION_TEXT_INDENT;
  const ctx = makeMeasureCtx(
    `${INSTRUCTION_FONT_SIZE}px Proxima Nova, Helvetica, Arial, sans-serif`,
  );
  const firstY = y + INSTRUCTION_FONT_SIZE;
  const maxY = y + areaHeight;
  const parts: string[] = [];
  let curY = firstY;
  for (const step of instructions) {
    if (curY > maxY) break;
    const lines = wrapToLines(step, areaWidth - INSTRUCTION_TEXT_INDENT, ctx);
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
  return `<text font-family="${INSTRUCTION_FONT_FAMILY}" font-size="${INSTRUCTION_FONT_SIZE}" fill="#000000" y="${firstY}">${parts.join("")}</text>`;
}

export function buildSmallIngredientTspans(
  lines: IngredientLineItem[],
  fontSize: number = SMALL_CARD_BASE_FONT,
): string {
  const scale = fontSize / SMALL_CARD_BASE_FONT;
  const itemDy = SMALL_CARD_ITEM_DY * scale;
  const catDy = SMALL_CARD_CAT_DY * scale;
  return lines
    .map((item, i) => {
      const dy = i === 0 ? "0" : item.isNewCategory ? catDy : itemDy;
      const content = item.baseLabel
        ? `<tspan font-weight="bold">${item.baseLabel}</tspan> ${item.text}`
        : item.text;
      return `  <tspan x="${SMALL_CARD_TEXT_X}" dy="${dy}">${content}</tspan>`;
    })
    .join("\n");
}

export function buildRecetteIngredients(
  ingredients: IngredientLineItem[],
  colors: CardColors,
  fontSize: number = RECETTE_BASE_FONT,
  xStart: number = RECETTE_TEXT_X,
  yStart: number = RECETTE_TEXT_Y,
): { tspans: string; rects: string } {
  const scale = fontSize / RECETTE_BASE_FONT;
  const lineH = RECETTE_LINE_H * scale;
  const catExtraH = RECETTE_CAT_EXTRA_H * scale;
  const lineMaxChars = Math.round(RECETTE_LINE_MAX_CHARS / scale);
  const badgeW = RECETTE_BADGE_W * scale;
  const badgeH = RECETTE_BADGE_H * scale;
  const badgeOffsetY = RECETTE_BADGE_OFFSET_Y * scale;
  const badgeFontSize = RECETTE_BADGE_FONT_SIZE * scale;

  const tspanParts: string[] = [];
  const rectParts: string[] = [];
  let cumY = yStart;
  const ctx = makeMeasureCtx(`${fontSize}px Oswald, Arial Narrow, sans-serif`);

  for (let i = 0; i < ingredients.length; i++) {
    const item = ingredients[i];
    const subLines = wrapLineAtMaxChars(item.text, lineMaxChars);

    for (let si = 0; si < subLines.length; si++) {
      const isVeryFirst = i === 0 && si === 0;

      if (isVeryFirst) {
        tspanParts.push(
          `  <tspan x="${xStart}" dy="0">${escapeXml(subLines[si])}</tspan>`,
        );
      } else if (si === 0) {
        const dy = item.isNewCategory ? lineH + catExtraH : lineH;
        cumY += dy;
        tspanParts.push(
          `  <tspan x="${xStart}" dy="${dy.toFixed(2)}">${escapeXml(subLines[si])}</tspan>`,
        );
      } else {
        cumY += lineH;
        tspanParts.push(
          `  <tspan x="${xStart}" dy="${lineH.toFixed(2)}">${escapeXml(subLines[si])}</tspan>`,
        );
      }

      if (si === 0 && item.baseLabel) {
        const textWidth = ctx.measureText(subLines[0]).width;
        const badgeX = xStart + textWidth + RECETTE_BADGE_GAP;
        rectParts.push(
          `<rect x="${badgeX.toFixed(1)}" y="${(cumY - badgeOffsetY).toFixed(1)}" width="${badgeW.toFixed(1)}" height="${badgeH.toFixed(1)}" rx="1.5" fill="${colors.band}" />`,
          `<text x="${(badgeX + badgeW / 2).toFixed(1)}" y="${(cumY - 0.5 * scale).toFixed(1)}" font-size="${badgeFontSize.toFixed(1)}" fill="white" font-weight="bold" text-anchor="middle" font-family="Oswald, sans-serif">${item.baseLabel}</text>`,
        );
      }
    }
  }

  return { tspans: tspanParts.join("\n"), rects: rectParts.join("\n") };
}
