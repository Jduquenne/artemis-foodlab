import { ChevronRight } from 'lucide-react';
import { Macronutrients, MacroTargets, NUTRIENT_DEFINITIONS } from '../../../core/domain/nutrition';

export interface TodayNutritionCardProps {
    profileName: string | null;
    macros: Macronutrients;
    kcalTarget: number;
    macroTargets: MacroTargets;
    onOpen: () => void;
}

const ratio = (value: number, target: number) => (target > 0 ? Math.min(value / target, 1) : 0);

export const TodayNutritionCard = ({ profileName, macros, kcalTarget, macroTargets, onOpen }: TodayNutritionCardProps) => (
    <button
        type="button"
        onClick={onOpen}
        className="bg-surface border border-slate-200 rounded-2xl shadow-sm p-4 flex flex-col gap-3 text-left hover:border-orange-300 transition-colors md:flex-1 md:min-h-0"
    >
        <span className="flex items-center justify-between gap-2">
            <span className="text-xs font-black uppercase tracking-widest text-orange-600">Journal du jour{profileName ? ` · ${profileName}` : ''}</span>
            <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />
        </span>
        <span className="text-2xl font-black text-slate-900 tabular-nums">
            {Math.round(macros.kcal)} <span className="text-sm font-bold text-slate-400">/ {kcalTarget} kcal prévues</span>
        </span>
        <span className="hidden md:flex flex-col gap-2">
            {NUTRIENT_DEFINITIONS.map(({ key, label, unit }) => (
                <span key={key} className="flex flex-col gap-1">
                    <span className="flex justify-between text-xs font-bold text-slate-500">
                        <span>{label}</span>
                        <span className="tabular-nums">{Math.round(macros[key])} / {macroTargets[key]} {unit}</span>
                    </span>
                    <span className="h-1.5 rounded-full bg-strong overflow-hidden">
                        <span className="block h-full w-full origin-left rounded-full bg-orange-500" style={{ transform: `scaleX(${ratio(macros[key], macroTargets[key])})` }} />
                    </span>
                </span>
            ))}
        </span>
    </button>
);
