import {
  ALL_YEAR_LABEL,
  MONTH_COUNT,
  MONTH_INITIALS,
  MONTH_SHORT_LABELS,
  formatMonths,
  toggleMonth,
} from "../../../../core/logic/season/seasonLogic";
import { FormField } from "../common/FormField";

export interface SeasonMonthsFieldProps {
  months: number[];
  onChange: (months: number[]) => void;
}

const MONTHS = Array.from({ length: MONTH_COUNT }, (_, index) => index + 1);

export const SeasonMonthsField = ({ months, onChange }: SeasonMonthsFieldProps) => (
  <FormField label="Saison" hint={`${formatMonths(months)} · aucun mois coché = toute l'année.`}>
    <div className="flex flex-wrap items-center gap-1">
      {MONTHS.map((month) => {
        const active = months.includes(month);
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
        disabled={months.length === 0}
        className="ml-1 px-2 h-7 rounded-lg text-xs font-bold text-slate-500 hover:text-orange-500 hover:bg-muted disabled:opacity-40"
      >
        {ALL_YEAR_LABEL}
      </button>
    </div>
  </FormField>
);
