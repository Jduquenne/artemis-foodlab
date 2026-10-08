import { SlotType } from "../../core/domain/planning";
import { SLOT_SHORT_LABELS } from "../../core/domain/slotLabels";

export interface SlotDisplay {
  label: string;
  icon: string;
  flex: number;
}

export const SLOT_DISPLAY: Record<SlotType, SlotDisplay> = {
  breakfast: { label: SLOT_SHORT_LABELS.breakfast, icon: "☕", flex: 2 },
  lunch: { label: SLOT_SHORT_LABELS.lunch, icon: "🍴", flex: 3 },
  snack: { label: SLOT_SHORT_LABELS.snack, icon: "🍎", flex: 2 },
  dinner: { label: SLOT_SHORT_LABELS.dinner, icon: "🌙", flex: 3 },
};
