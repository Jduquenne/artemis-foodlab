import { MacroTargets } from "./nutrition";

export interface Profile {
  id: string;
  name: string;
  color: string;
  position: number;
  kcalTarget: number;
  macroTargets: MacroTargets;
}
