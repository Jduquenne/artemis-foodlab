import { AccompanimentDefault } from "../../domain/accompaniment";
import { FoodGroupDefault } from "../../domain/foodGroup";
import { Profile } from "../../domain/profile";
import { sortProfilesByPosition } from "./profileLogic";

export interface ApiProfile {
  id: string;
  name: string;
  color: string;
  position: number;
  kcalTarget: number;
  proteinsTarget: number;
  lipidsTarget: number;
  carbohydratesTarget: number;
  fibersTarget: number;
  foodGroupDefaults?: FoodGroupDefault[];
  accompanimentDefaults?: AccompanimentDefault[];
}

export function mapProfile(api: ApiProfile): Profile {
  return {
    id: api.id,
    name: api.name,
    color: api.color,
    position: api.position,
    kcalTarget: api.kcalTarget,
    macroTargets: {
      proteins: api.proteinsTarget,
      lipids: api.lipidsTarget,
      carbohydrates: api.carbohydratesTarget,
      fibers: api.fibersTarget,
    },
    foodGroupDefaults: api.foodGroupDefaults ?? [],
    accompanimentDefaults: api.accompanimentDefaults ?? [],
  };
}

export function mapProfiles(api: ApiProfile[]): Profile[] {
  return sortProfilesByPosition(api.map(mapProfile));
}
