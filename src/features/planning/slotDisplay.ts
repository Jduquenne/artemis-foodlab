import { SlotType } from "../../core/domain/planning";

export interface SlotDisplay {
  label: string;
  icon: string;
  flex: number;
}

export const SLOT_DISPLAY: Record<SlotType, SlotDisplay> = {
  breakfast: { label: "Petit déj.", icon: "☕", flex: 2 },
  lunch: { label: "Déjeuner", icon: "🍴", flex: 3 },
  snack: { label: "Goûter", icon: "🍎", flex: 2 },
  dinner: { label: "Dîner", icon: "🌙", flex: 3 },
};
