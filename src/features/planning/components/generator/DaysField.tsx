import { useState } from "react";
import { DAYS } from "../../../../core/domain/planningConfig";
import { habitDayRange, toggleHabitDay } from "../../../../core/logic/menuGenerator/habitLogic";
import { ChoicePills } from "./ChoicePills";

export interface DaysFieldProps {
  days: string[];
  disabled: boolean;
  onChange: (days: string[]) => void;
}

const DAY_OPTIONS = DAYS.map((day) => ({ id: day, label: day.slice(0, 3) }));

const SELECT_CLASS =
  "flex-1 min-w-0 px-2 py-1.5 bg-surface border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-orange-400 disabled:opacity-50";

export const DaysField = ({ days, disabled, onChange }: DaysFieldProps) => {
  const [rangeFrom, setRangeFrom] = useState<string>(DAYS[0]);
  const [rangeTo, setRangeTo] = useState<string>(DAYS[3]);

  return (
    <div className="flex flex-col gap-1.5">
      <ChoicePills options={DAY_OPTIONS} isActive={(day) => days.includes(day)} onToggle={(day) => onChange(toggleHabitDay(days, day))} disabled={disabled} />
      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        <span>Du</span>
        <select value={rangeFrom} disabled={disabled} onChange={(e) => setRangeFrom(e.target.value)} className={SELECT_CLASS} aria-label="Premier jour">
          {DAYS.map((day) => <option key={day} value={day}>{day}</option>)}
        </select>
        <span>au</span>
        <select value={rangeTo} disabled={disabled} onChange={(e) => setRangeTo(e.target.value)} className={SELECT_CLASS} aria-label="Dernier jour">
          {DAYS.map((day) => <option key={day} value={day}>{day}</option>)}
        </select>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange(habitDayRange(rangeFrom, rangeTo))}
          className="px-2 py-1.5 rounded-lg border border-slate-200 font-bold text-slate-600 hover:bg-muted disabled:opacity-50"
        >
          Appliquer
        </button>
      </div>
    </div>
  );
};
