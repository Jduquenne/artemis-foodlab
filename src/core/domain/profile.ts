import { AccompanimentDefault } from "./accompaniment";
import { FoodGroupDefault } from "./foodGroup";
import { MacroTargets } from "./nutrition";

export interface Profile {
  id: string;
  name: string;
  color: string;
  position: number;
  kcalTarget: number;
  macroTargets: MacroTargets;
  foodGroupDefaults: FoodGroupDefault[];
  accompanimentDefaults: AccompanimentDefault[];
}
