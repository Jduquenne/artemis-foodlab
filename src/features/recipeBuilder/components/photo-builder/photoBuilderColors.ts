export interface CardColors {
  bg: string;
  band: string;
  circle: string;
}

const CARD_COLORS: Record<string, CardColors> = {
  charcuterie:       { bg: "#cbc2d1", band: "#8238bd", circle: "#410d6b" },
  veggies:           { bg: "#dde4d2", band: "#536f21", circle: "#3a4b1b" },
  pastries:          { bg: "#e7e5e5", band: "#70737a", circle: "#000001" },
  "dairy-products":  { bg: "#dce6f5", band: "#384f6f", circle: "#9eb1cc" },
  "cereal-products": { bg: "#f6f3f2", band: "#7c634c", circle: "#c9a17e" },
  "plant-proteins":  { bg: "#d4c9c2", band: "#8d5029", circle: "#542c12" },
  "white-meat":      { bg: "#d4e3e6", band: "#2090a8", circle: "#0f4652" },
  "red-meat":        { bg: "#eddbd8", band: "#99392a", circle: "#702216" },
  bases:             { bg: "#fdf8ec", band: "#d0a333", circle: "#95691e" },
  fish:              { bg: "#d4e3f8", band: "#1a5aaf", circle: "#131e2e" },
};

const DEFAULT_COLORS: CardColors = { bg: "#f0f0f0", band: "#666666", circle: "#333333" };

export function getCardColors(categoryId: string): CardColors {
  return CARD_COLORS[categoryId] ?? DEFAULT_COLORS;
}
