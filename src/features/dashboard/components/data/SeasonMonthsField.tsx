import {
  ALL_MONTHS,
  ALL_YEAR_LABEL,
  MONTH_INITIALS,
  MONTH_SHORT_LABELS,
  checkedMonths,
  formatMonths,
  hasSeason,
  toggleMonth,
} from "../../../../core/logic/season/seasonLogic";
import { FormField } from "../common/FormField";

export interface SeasonMonthsFieldProps {
  months: number[];
  onChange: (months: number[]) => void;
}

export const SeasonMonthsField = ({ months, onChange }: SeasonMonthsFieldProps) => {
  const checked = checkedMonths(months);
  return (
    <FormField label="Saison" hint={formatMonths(months)}>
      <div className="flex flex-wrap items-center gap-1">
        {ALL_MONTHS.map((month) => {
          const active = checked.includes(month);
          return (
            <button
              key={month}
              type="button"
              onClick={() => onChange(toggleMonth(months, month))}
              aria-pressed={active}
              aria-label={MONTH_SHORT_LABELS[month - 1]}
              title={MONTH_SHORT_LABELS[month - 1]}
              className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors ${
                active ? "bg-green-500 text-white" : "bg-muted text-slate-500 hover:text-green-600"
              }`}
            >
              {MONTH_INITIALS[month - 1]}
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => onChange([])}
          disabled={!hasSeason(months)}
          className="ml-1 px-2 h-7 rounded-lg text-xs font-bold text-slate-500 hover:text-orange-500 hover:bg-muted disabled:opacity-40"
        >
          {ALL_YEAR_LABEL}
        </button>
      </div>
    </FormField>
  );
};
