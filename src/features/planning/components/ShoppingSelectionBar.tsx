import { ShoppingCart, X, Check } from 'lucide-react';

export interface ShoppingSelectionBarProps {
    count: number;
    onConfirm: () => void;
    onCancel: () => void;
}

export const ShoppingSelectionBar = ({ count, onConfirm, onCancel }: ShoppingSelectionBarProps) => {
    const atMax = count >= 10;

    return (
        <div className="shrink-0 flex items-center justify-between gap-3 bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800/50 rounded-2xl px-4 py-2.5">
            <div className="flex items-center gap-2 min-w-0">
                <ShoppingCart className="w-4 h-4 text-orange-500 shrink-0" />
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    {count === 0
                        ? 'Sélectionne les jours de courses'
                        : `${count} / 10 jour${count > 1 ? 's' : ''} sélectionné${count > 1 ? 's' : ''}`}
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
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
                >
                    <X className="w-3.5 h-3.5" />
                    Annuler
                </button>
                <button
                    onClick={onConfirm}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-sm font-bold bg-orange-500 hover:bg-orange-600 text-white transition-colors"
                >
                    <Check className="w-3.5 h-3.5" />
                    Confirmer
                </button>
            </div>
        </div>
    );
};
