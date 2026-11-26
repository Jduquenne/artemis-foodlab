import { MealSlot, SlotType } from "../../domain/planning";
import { PERSON_DEFAULT_MAX, PERSON_DEFAULT_MIN, PersonDefault } from "../../domain/personDefaults";

export function defaultPersonsFor(defaults: readonly PersonDefault[], day: string, slot: SlotType): number | undefined {
  return defaults.find((entry) => entry.day === day && entry.slot === slot)?.persons;
}

export function withDefaultPersons(slot: MealSlot, defaults: readonly PersonDefault[]): MealSlot {
  if (slot.persons !== undefined) return slot;
  const persons = defaultPersonsFor(defaults, slot.day, slot.slot);
  return persons === undefined ? slot : { ...slot, persons };
}

export function setPersonDefault(defaults: readonly PersonDefault[], day: string, slot: SlotType, persons: number | null): PersonDefault[] {
  const others = defaults.filter((entry) => !(entry.day === day && entry.slot === slot));
  return persons === null ? others : [...others, { day, slot, persons }];
}

export function isValidPersonDefault(persons: number): boolean {
  return Number.isInteger(persons) && persons >= PERSON_DEFAULT_MIN && persons <= PERSON_DEFAULT_MAX;
}
