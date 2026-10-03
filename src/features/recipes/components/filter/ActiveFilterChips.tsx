import { X } from 'lucide-react';
import { RecipeFilter } from '../../../../core/domain/recipeFilter';
import { MACRO_DISPLAYS } from '../../../../core/domain/nutrition';
import { formatMacroCriterion, setFilterType, setFilterMacro } from '../../../../core/logic/recipe/recipeFilterLogic';
import { getFilterTypeLabel } from '../../../../core/logic/recipe/recipeFilterTypeLogic';
import { useTypeMedians } from '../../../../shared/hooks/useTypeMedians';

export interface ActiveFilterChipsProps {
  filter: RecipeFilter;
  onChange: (filter: RecipeFilter) => void;
  chipClassName?: string;
}

export const ActiveFilterChips = ({ filter, onChange, chipClassName = 'flex' }: ActiveFilterChipsProps) => {
  const medians = useTypeMedians();
  if (filter.type === null) return null;

  const typeMedians = medians[filter.type];
  const chips = [
    {
      key: 'type',
      label: getFilterTypeLabel(filter.type),
      remove: () => onChange(setFilterType(filter, null)),
    },
    ...MACRO_DISPLAYS.flatMap((display) => {
      const comparison = filter.macros[display.key];
      if (comparison === undefined) return [];
      return [{
        key: display.key,
        label: formatMacroCriterion(display, comparison, typeMedians[display.key]),
        remove: () => onChange(setFilterMacro(filter, display.key, null)),
      }];
    }),
  ];

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
