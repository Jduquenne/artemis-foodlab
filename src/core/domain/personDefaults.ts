import { SlotType } from "./planning";

export const PERSON_DEFAULT_MIN = 1;
export const PERSON_DEFAULT_MAX = 20;

export interface PersonDefault {
  day: string;
  slot: SlotType;
  persons: number;
}
