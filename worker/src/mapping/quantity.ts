import { Unit } from "../types";

const UNIT_TEXT: Record<string, Unit> = {
  "": Unit.G,
  g: Unit.G,
  kg: Unit.KG,
  ml: Unit.ML,
  "pièce": Unit.PIECE,
  piece: Unit.PIECE,
  portion: Unit.PORTION,
  sachet: Unit.SACHET,
  tranche: Unit.TRANCHE,
  feuille: Unit.FEUILLE,
};

export function parseQuantityText(text: string): { quantity: number | null; unit: Unit } {
  const trimmed = text.trim();
  if (!trimmed) return { quantity: null, unit: Unit.NONE };

  const match = trimmed.match(/^(-?\d+(?:[.,]\d+)?)\s*(.*)$/);
  if (!match?.[1]) return { quantity: null, unit: Unit.NONE };

  const quantity = parseFloat(match[1].replace(",", "."));
  const unitText = (match[2] ?? "").trim().toLowerCase();
  const unit = UNIT_TEXT[unitText] ?? (unitText as Unit) ?? Unit.G;

  return { quantity: isNaN(quantity) ? null : quantity, unit };
}

export function formatQuantityText(quantity: number | null, unit: Unit): string {
  if (quantity == null) return "";
  if (!unit || unit === Unit.G) return String(quantity);
  return `${quantity} ${unit}`;
}
