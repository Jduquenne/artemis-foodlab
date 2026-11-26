import { useState } from 'react';
import { MealTimeRange, MealTimes, DEFAULT_MEAL_TIMES } from '../../../core/domain/mealTimes';
import { MEAL_SLOTS } from '../../../core/domain/planningConfig';
import { SLOT_LABELS } from '../../../core/domain/slotLabels';
import { mealTimesErrors, withMealTime } from '../../../core/logic/planning/mealTimeLogic';
import { Sheet } from '../../../shared/components/ui/Sheet';

export interface MealTimesSheetProps {
    times: MealTimes;
    onSave: (times: MealTimes) => void;
    onClose: () => void;
}

const FIELDS: readonly (keyof MealTimeRange)[] = ['start', 'end'];
const INPUT = 'w-24 px-2 py-1.5 bg-surface border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 scheme-light dark:scheme-dark';

export const MealTimesSheet = ({ times, onSave, onClose }: MealTimesSheetProps) => {
    const [draft, setDraft] = useState(times);
    const errors = mealTimesErrors(draft);

    return (
        <Sheet title="Horaires des repas" subtitle="Un repas passe en gris une fois son heure de fin passée. Enregistré sur cet appareil." onClose={onClose}>
            <div className="flex flex-col gap-2">
                {MEAL_SLOTS.map((def) => (
                    <div key={def.id} className="flex items-center justify-between gap-3">
                        <span className="text-sm font-bold text-slate-700">{SLOT_LABELS[def.id]}</span>
                        <span className="flex items-center gap-1.5">
                            {FIELDS.map((field, index) => (
                                <span key={field} className="flex items-center gap-1.5">
                                    {index > 0 && <span className="text-slate-400">–</span>}
                                    <input
                                        type="time"
                                        value={draft[def.id][field]}
                                        aria-label={`${SLOT_LABELS[def.id]} · ${field === 'start' ? 'début' : 'fin'}`}
                                        onChange={(e) => setDraft(withMealTime(draft, def.id, field, e.target.value))}
                                        className={INPUT}
                                    />
                                </span>
                            ))}
                        </span>
                    </div>
                ))}
            </div>
            {errors.length > 0 && (
                <ul className="text-xs text-red-600 flex flex-col gap-0.5">
                    {errors.map((error) => <li key={error}>{error}</li>)}
                </ul>
            )}
            <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setDraft(DEFAULT_MEAL_TIMES)} className="py-3 rounded-2xl border border-slate-200 bg-surface text-slate-600 font-bold">
                    Par défaut
                </button>
                <button
                    type="button"
                    disabled={errors.length > 0}
                    onClick={() => { onSave(draft); onClose(); }}
                    className="py-3 rounded-2xl bg-orange-500 text-white font-bold disabled:opacity-50"
                >
                    Enregistrer
                </button>
            </div>
        </Sheet>
    );
};
