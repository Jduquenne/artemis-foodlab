import { PREDEFINED_FILTER_DEFINITIONS, PredefinedFilterDefinition } from "../../domain/predefinedFilters";
import { Macronutrients } from "../../domain/nutrition";
import { PredefinedFilter } from "../../domain/recipe";

export function matchesFilterDefinition(definition: PredefinedFilterDefinition, macros: Macronutrients): boolean {
  const value = macros[definition.macro];
  return definition.comparison === "below" ? value < definition.threshold : value > definition.threshold;
}

export function formatFilterLabel(definition: PredefinedFilterDefinition): string {
  const symbol = definition.comparison === "below" ? "<" : ">";
  if (definition.macro === "kcal") {
    const wording = definition.comparison === "below" ? "Moins de" : "Plus de";
    return `${wording} ${definition.threshold} kcal`;
  }
  return `${definition.title} (${symbol} ${definition.threshold}g)`;
}

export function buildPredefinedFilter(definition: PredefinedFilterDefinition): PredefinedFilter {
  return {
    id: definition.id,
    label: formatFilterLabel(definition),
    check: (macros) => matchesFilterDefinition(definition, macros),
  };
}

export const PREDEFINED_FILTERS: PredefinedFilter[] = PREDEFINED_FILTER_DEFINITIONS.map(buildPredefinedFilter);
