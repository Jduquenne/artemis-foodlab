import { X, CheckCircle2, Circle } from 'lucide-react';
import { IngredientSource } from '../../../core/utils/shoppingLogic';
import { pluralizeUnit } from '../../../core/utils/unitUtils';

const DAY_LABELS: Record<string, string> = {
    monday: 'Lundi',
    tuesday: 'Mardi',
    wednesday: 'Mercredi',
    thursday: 'Jeudi',
    friday: 'Vendredi',
    saturday: 'Samedi',
    sunday: 'Dimanche',
};

const SLOT_LABELS: Record<string, string> = {
    breakfast: 'Petit déj.',
    lunch: 'Déjeuner',
    snack: 'Goûter',
    dinner: 'Dîner',
};

export interface SourcesModalProps {
    ingredientKey: string;
    sources: IngredientSource[];
    sourceChecked: Set<string>;
    onToggleSource: (ingredientKey: string, source: IngredientSource) => void;
    onClose: () => void;
}

export const SourcesModal = ({ ingredientKey, sources, sourceChecked, onToggleSource, onClose }: SourcesModalProps) => (
    <div
        className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
        onClick={onClose}
    >
        <div
            className="bg-white dark:bg-slate-200 rounded-2xl shadow-2xl w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
        >
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
                <p className="text-xs font-black text-orange-600 uppercase tracking-widest">Utilisé dans</p>
                <button
                    onClick={onClose}
                    className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-300 transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
            <div className="px-5 pb-5 space-y-1">
                {sources.map((src, i) => {
                    const srcKey = `${ingredientKey}::${src.recipeId}::${src.day}::${src.slot}`;
                    const isChecked = sourceChecked.has(srcKey);
                    return (
                        <div
                            key={i}
                            onClick={() => onToggleSource(ingredientKey, src)}
                            className={`flex items-start gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer select-none transition-all ${
                                isChecked
                                    ? 'opacity-40 bg-slate-50 dark:bg-slate-200/40'
                                    : 'hover:bg-slate-50 dark:hover:bg-slate-200/40'
                            }`}
                        >
                            <div className="mt-0.5 shrink-0">
                                {isChecked
                                    ? <CheckCircle2 className="w-4 h-4 text-green-500" />
                                    : <Circle className="w-4 h-4 text-slate-300" />
                                }
                            </div>
                            <div className="min-w-0">
                                <p className={`text-sm font-semibold text-slate-800 leading-tight ${isChecked ? 'line-through' : ''}`}>
                                    {src.recipeName}
                                </p>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    {DAY_LABELS[src.day] ?? src.day}
                                    <span className="mx-1 text-slate-300">·</span>
                                    {SLOT_LABELS[src.slot] ?? src.slot}
                                    <span className="mx-1 text-slate-300">·</span>
                                    <span className="text-orange-500 font-medium">
                                        {src.quantity === 0 ? '—' : `${parseFloat(src.quantity.toFixed(2))}\u00a0${pluralizeUnit(src.unit, src.quantity)}`}
                                    </span>
                                    {src.persons !== undefined && src.baseQuantity !== undefined && (
                                        <>
                                            <span className="mx-1 text-slate-300">·</span>
                                            <span className="text-slate-500 font-semibold">×{src.persons}</span>
                                            <span className="mx-1 text-slate-300">·</span>
                                            <span className="text-slate-400">
                                                base&nbsp;{src.baseQuantity === 0 ? '—' : `${parseFloat(src.baseQuantity.toFixed(2))}\u00a0${pluralizeUnit(src.unit, src.baseQuantity)}`}
                                            </span>
                                        </>
                                    )}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    </div>
);
