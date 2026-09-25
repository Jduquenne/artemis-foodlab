import { Unit } from "../../domain/ingredient";

const KNOWN_UNITS: readonly string[] = Object.values(Unit);

export function isUnit(value: string | null | undefined): value is Unit {
  return value != null && KNOWN_UNITS.includes(value);
}

export function parseUnit(value: string | null | undefined): Unit {
  return isUnit(value) ? value : Unit.NONE;
}
