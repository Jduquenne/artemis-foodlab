import { X, CheckCircle2, Circle, Snowflake } from 'lucide-react';
import { IngredientSource } from '../../../core/utils/shoppingLogic';
import { pluralizeUnit } from '../../../core/utils/unitUtils';
import { SLOT_LABELS } from '../../../shared/utils/slotLabels';
import { SlotType } from '../../../core/domain/types';

const DAY_LABELS: Record<string, string> = {
    monday: 'Lundi', tuesday: 'Mardi', wednesday: 'Mercredi',
    thursday: 'Jeudi', friday: 'Vendredi', saturday: 'Samedi', sunday: 'Dimanche',
};

const DAY_SHORT: Record<string, string> = {
    monday: 'Lun', tuesday: 'Mar', wednesday: 'Mer',
    thursday: 'Jeu', friday: 'Ven', saturday: 'Sam', sunday: 'Dim',
};

const DAY_ORDER = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export interface SourcesModalProps {
    ingredientKey: string;
    sources: IngredientSource[];
    sourceChecked: Set<string>;
    onToggleSource: (ingredientKey: string, sources: IngredientSource[], checked: boolean) => void;
    onClose: () => void;
    freezerQty?: number;
    freezerUnit?: string;
    freezerUsed?: boolean;
    onUseFreezer?: (use: boolean) => void;
}

export const SourcesModal = ({ ingredientKey, sources, sourceChecked, onToggleSource, onClose, freezerQty, freezerUnit, freezerUsed, onUseFreezer }: SourcesModalProps) => {
    const groups: IngredientSource[][] = [];
    const seen = new Map<string, IngredientSource[]>();
    for (const src of sources) {
        const existing = seen.get(src.recipeId);
        if (existing) { existing.push(src); } else {
            const group = [src];
            seen.set(src.recipeId, group);
            groups.push(group);
        }
    }

    return (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-200 rounded-2xl shadow-2xl w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between px-5 pt-5 pb-3">
                    <p className="text-xs font-black text-orange-600 uppercase tracking-widest">Utilisé dans</p>
                    <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-300 transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>
                {freezerQty !== undefined && freezerQty > 0 && freezerUnit !== undefined && (
                    <div className="px-5 pb-3 border-b border-slate-100">
                        <p className="text-xs font-black text-cyan-600 uppercase tracking-widest mb-1.5">Congélateur</p>
                        <div
                            onClick={() => onUseFreezer?.(!freezerUsed)}
                            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer select-none transition-all ${
                                freezerUsed ? 'bg-cyan-50 dark:bg-cyan-900/20' : 'hover:bg-cyan-50 dark:hover:bg-cyan-900/20'
                            }`}
                        >
                            <div className="shrink-0">
                                {freezerUsed
                                    ? <CheckCircle2 className="w-4 h-4 text-cyan-500" />
                                    : <Circle className="w-4 h-4 text-slate-300" />
                                }
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-slate-800">
                                    {freezerQty % 1 === 0 ? freezerQty : parseFloat(freezerQty.toFixed(1))} {pluralizeUnit(freezerUnit, freezerQty)} disponibles
                                </p>
                                <p className="text-xs text-slate-400">
                                    {freezerUsed ? 'Quantité déduite de la liste' : 'Utiliser depuis le congélateur'}
                                </p>
                            </div>
                            <Snowflake className="w-4 h-4 text-cyan-400 shrink-0" />
                        </div>
                    </div>
                )}
                <div className="px-5 pb-5 space-y-1">
                    {groups.map((group, i) => {
                        const allChecked = group.every(s =>
                            sourceChecked.has(`${ingredientKey}::${s.recipeId}::${s.day}::${s.slot}`)
                        );

                        if (group.length > 1) {
                            const sorted = [...group].sort((a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day));
                            const totalQty = group.reduce((sum, s) => sum + s.quantity, 0);
                            const unit = group[0].unit;
                            const uniqueSlots = [...new Set(group.map(s => s.slot))];
                            const slotLabel = uniqueSlots.length === 1 ? (SLOT_LABELS[uniqueSlots[0] as SlotType] ?? uniqueSlots[0]) : null;

                            return (
                                <div
                                    key={i}
                                    onClick={() => onToggleSource(ingredientKey, group, !allChecked)}
                                    className={`flex items-start gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer select-none transition-all ${
                                        allChecked ? 'opacity-40 bg-slate-50 dark:bg-slate-200/40' : 'hover:bg-slate-50 dark:hover:bg-slate-200/40'
                                    }`}
                                >
                                    <div className="mt-0.5 shrink-0">
                                        {allChecked
                                            ? <CheckCircle2 className="w-4 h-4 text-green-500" />
                                            : <Circle className="w-4 h-4 text-slate-300" />
                                        }
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between gap-2">
                                            <p className={`text-sm font-semibold text-slate-800 leading-tight ${allChecked ? 'line-through' : ''}`}>
                                                {group[0].recipeName}
                                            </p>
                                            <span className="text-xs font-medium text-orange-500 shrink-0">
                                                {totalQty === 0 ? '—' : `${parseFloat(totalQty.toFixed(2))}\u00a0${pluralizeUnit(unit, totalQty)}`}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-400 mt-0.5">
                                            {sorted.map(s => DAY_SHORT[s.day] ?? s.day).join(',\u00a0')}
                                            {slotLabel && <><span className="mx-1 text-slate-300">·</span>{slotLabel}</>}
                                            <span className="mx-1 text-slate-300">·</span>
                                            <span className="font-medium text-slate-500">{group.length}×</span>
                                        </p>
                                    </div>
                                </div>
                            );
                        }

                        const src = group[0];
                        const isChecked = sourceChecked.has(`${ingredientKey}::${src.recipeId}::${src.day}::${src.slot}`);

                        return (
                            <div
                                key={i}
                                onClick={() => onToggleSource(ingredientKey, group, !isChecked)}
                                className={`flex items-start gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer select-none transition-all ${
                                    isChecked ? 'opacity-40 bg-slate-50 dark:bg-slate-200/40' : 'hover:bg-slate-50 dark:hover:bg-slate-200/40'
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
                                        {SLOT_LABELS[src.slot as SlotType] ?? src.slot}
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
};
