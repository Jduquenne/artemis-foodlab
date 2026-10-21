import { X } from 'lucide-react';
import { RecipeFilter } from '../../../../core/domain/recipeFilter';
import { MACRO_DISPLAYS } from '../../../../core/domain/nutrition';
import { formatMacroCriterion, setFilterInSeason, setFilterType, setFilterMacro } from '../../../../core/logic/recipe/recipeFilterLogic';
import { MONTH_LABELS } from '../../../../core/logic/season/seasonLogic';
import { getFilterTypeLabel } from '../../../../core/logic/recipe/recipeFilterTypeLogic';
import { useTypeMedians } from '../../../../shared/hooks/useTypeMedians';
import { useInSeasonRecipes } from '../../../../shared/hooks/useInSeasonRecipes';

export interface ActiveFilterChipsProps {
  filter: RecipeFilter;
  onChange: (filter: RecipeFilter) => void;
  chipClassName?: string;
}

export const ActiveFilterChips = ({ filter, onChange, chipClassName = 'flex' }: ActiveFilterChipsProps) => {
  const medians = useTypeMedians();
  const { month } = useInSeasonRecipes();
  const { type } = filter;

  const seasonChips = filter.inSeason
    ? [{
      key: 'season',
      label: `De saison · ${MONTH_LABELS[month - 1]}`,
      remove: () => onChange(setFilterInSeason(filter, false)),
    }]
    : [];
  const typeChips = type === null ? [] : [
    {
      key: 'type',
      label: getFilterTypeLabel(type),
      remove: () => onChange(setFilterType(filter, null)),
    },
    ...MACRO_DISPLAYS.flatMap((display) => {
      const comparison = filter.macros[display.key];
      if (comparison === undefined) return [];
      return [{
        key: display.key,
        label: formatMacroCriterion(display, comparison, medians[type][display.key]),
        remove: () => onChange(setFilterMacro(filter, display.key, null)),
      }];
    }),
  ];
  const chips = [...seasonChips, ...typeChips];
  if (chips.length === 0) return null;

  return (
    <>
      {chips.map((chip) => (
        <span
          key={chip.key}
          className={`${chipClassName} items-center gap-1 pl-2.5 pr-1.5 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full whitespace-nowrap shrink-0`}
        >
          {chip.label}
          <button aria-label={`Retirer le filtre ${chip.label}`} onClick={chip.remove} className="hover:text-orange-900 transition-colors">
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
    </>
  );
};
