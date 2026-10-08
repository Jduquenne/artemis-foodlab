import { ShoppingCart, X, Check, RotateCcw, Loader2 } from 'lucide-react';
import { MAX_SHOPPING_DAYS } from '../../../../core/domain/planningConfig';

export interface ShoppingSelectionBarProps {
    count: number;
    pending?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    onReset: () => void;
}

export const ShoppingSelectionBar = ({ count, pending, onConfirm, onCancel, onReset }: ShoppingSelectionBarProps) => {
    const atMax = count >= MAX_SHOPPING_DAYS;

    return (
        <div className="shrink-0 flex items-center justify-between gap-3 bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800/50 rounded-2xl px-4 py-2.5">
            <div className="flex items-center gap-2 min-w-0">
                <ShoppingCart className="w-4 h-4 text-orange-500 shrink-0" />
                <span className="text-sm font-semibold text-slate-700">
                    {count === 0
                        ? 'Sélectionne les jours de courses'
                        : `${count} / ${MAX_SHOPPING_DAYS} jour${count > 1 ? 's' : ''} sélectionné${count > 1 ? 's' : ''}`}
                </span>
                {atMax && (
                    <span className="text-xs font-bold text-orange-600 bg-orange-100 dark:bg-orange-900/50 px-2 py-0.5 rounded-full shrink-0">
                        max
                    </span>
                )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
                <button
                    onClick={onCancel}
                    disabled={pending}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold text-slate-500 hover:bg-muted transition-colors disabled:opacity-50"
                >
                    <X className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Annuler</span>
                </button>
                {count > 0 && (
                    <button
                        onClick={onReset}
                        disabled={pending}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold text-slate-500 hover:bg-muted transition-colors disabled:opacity-50"
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Réinitialiser</span>
                    </button>
                )}
                <button
                    onClick={onConfirm}
                    disabled={pending}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-sm font-bold bg-orange-500 hover:bg-orange-600 text-white transition-colors disabled:opacity-60"
                >
                    {pending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    <span className="hidden sm:inline">Confirmer</span>
                </button>
            </div>
        </div>
    );
};
