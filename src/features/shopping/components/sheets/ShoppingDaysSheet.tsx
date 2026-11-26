import { useMemo } from 'react';
import { CalendarDays, ChevronRight, Loader2 } from 'lucide-react';
import { Sheet } from '../../../../shared/components/ui/Sheet';
import { ShoppingDay } from '../../../../core/domain/planning';
import { formatDateShort } from '../../../../core/utils/weekUtils';
import {
    SHOPPING_DAYS_PRESETS,
    SHOPPING_DAYS_PRESET_LABELS,
    ShoppingDaysPreset,
    presetShoppingDays,
} from '../../../../core/logic/shopping/shoppingDaysPresetLogic';
import { usePendingKey } from '../../../../shared/hooks/usePendingKey';

export const SHOPPING_DAYS_PENDING_KEY = 'shopping-days-preset';

export interface ShoppingDaysSheetProps {
    hasPeriod: boolean;
    onPick: (days: ShoppingDay[]) => void;
    onOpenPlanning: () => void;
    onClose: () => void;
}

export const ShoppingDaysSheet = ({ hasPeriod, onPick, onOpenPlanning, onClose }: ShoppingDaysSheetProps) => {
    const pending = usePendingKey(SHOPPING_DAYS_PENDING_KEY);
    const ranges = useMemo(() => {
        const today = new Date();
        return SHOPPING_DAYS_PRESETS.map((preset: ShoppingDaysPreset) => ({ preset, ...presetShoppingDays(preset, today) }));
    }, []);

    return (
        <Sheet
            title="Jours de courses"
            subtitle={hasPeriod ? 'Les coches, les stocks et les articles ajoutés de la période actuelle seront effacés.' : 'Pour quels jours fais-tu les courses ?'}
            onClose={onClose}
            dismissable={!pending}
        >
            <div className="flex flex-col gap-2">
                {ranges.map(({ preset, first, last, days }) => (
                    <button
                        key={preset}
                        type="button"
                        disabled={pending}
                        onClick={() => onPick(days)}
                        className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-slate-200 bg-surface hover:border-orange-300 hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-colors disabled:opacity-50 text-left"
                    >
                        <span className="min-w-0">
                            <span className="block text-sm font-bold text-slate-800">{SHOPPING_DAYS_PRESET_LABELS[preset]}</span>
                            <span className="block text-xs text-slate-400">
                                {formatDateShort(first)} → {formatDateShort(last)} · {days.length} jour{days.length > 1 ? 's' : ''}
                            </span>
                        </span>
                        {pending ? <Loader2 className="w-4 h-4 animate-spin text-orange-500 shrink-0" /> : <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />}
                    </button>
                ))}
                <button
                    type="button"
                    disabled={pending}
                    onClick={onOpenPlanning}
                    className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-bold text-slate-500 hover:text-orange-600 transition-colors disabled:opacity-50"
                >
                    <CalendarDays className="w-4 h-4" />
                    Choisir dans le planning
                </button>
            </div>
        </Sheet>
    );
};
