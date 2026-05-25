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
const INSTRUCTION_LINE_HEIGHT_RATIO = 1.4;
const INSTRUCTION_BULLET_OFFSET = 2;
const INSTRUCTION_TEXT_INDENT = 10;

const SMALL_CARD_TEXT_X = 71;
const SMALL_CARD_ITEM_DY = 7;
const SMALL_CARD_CAT_DY = 12;

const RECETTE_TEXT_Y = 110;
const RECETTE_TEXT_X = 29.5;
const RECETTE_LINE_H = 11;
const RECETTE_CAT_EXTRA_H = 3;
const RECETTE_LINE_MAX_CHARS = 38;
const RECETTE_BADGE_W = 14;
const RECETTE_BADGE_GAP = 3;
const RECETTE_BADGE_OFFSET_Y = 7;
const RECETTE_BADGE_FONT_SIZE = 5.5;

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
  return Math.max(Math.min(availableH / cardH, availableW / cardW), MIN_CARD_SCALE);
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
  const ctx = makeMeasureCtx(`${INSTRUCTION_FONT_SIZE}px Proxima Nova, Helvetica, Arial, sans-serif`);
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

export function buildSmallIngredientTspans(lines: IngredientLineItem[]): string {
  return lines
    .map((item, i) => {
      const dy = i === 0 ? "0" : item.isNewCategory ? SMALL_CARD_CAT_DY : SMALL_CARD_ITEM_DY;
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
        tspanParts.push(`  <tspan x="${RECETTE_TEXT_X}" dy="0">${escapeXml(subLines[si])}</tspan>`);
      } else if (si === 0) {
        const dy = item.isNewCategory ? RECETTE_LINE_H + RECETTE_CAT_EXTRA_H : RECETTE_LINE_H;
        cumY += dy;
        tspanParts.push(`  <tspan x="${RECETTE_TEXT_X}" dy="${dy}">${escapeXml(subLines[si])}</tspan>`);
      } else {
        cumY += RECETTE_LINE_H;
        tspanParts.push(`  <tspan x="${RECETTE_TEXT_X}" dy="${RECETTE_LINE_H}">${escapeXml(subLines[si])}</tspan>`);
      }

      if (si === 0 && item.baseLabel) {
        const textWidth = ctx.measureText(subLines[0]).width;
        const badgeX = RECETTE_TEXT_X + textWidth + RECETTE_BADGE_GAP;
        rectParts.push(
          `<rect x="${badgeX.toFixed(1)}" y="${cumY - RECETTE_BADGE_OFFSET_Y}" width="${RECETTE_BADGE_W}" height="8" rx="1.5" fill="${colors.band}" />`,
          `<text x="${(badgeX + RECETTE_BADGE_W / 2).toFixed(1)}" y="${cumY - 0.5}" font-size="${RECETTE_BADGE_FONT_SIZE}" fill="white" font-weight="bold" text-anchor="middle" font-family="Oswald, sans-serif">${item.baseLabel}</text>`,
        );
      }
    }
  }

  return { tspans: tspanParts.join("\n"), rects: rectParts.join("\n") };
}
