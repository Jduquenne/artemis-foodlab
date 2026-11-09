import { Carrot, X } from 'lucide-react';

export interface RecipeFoodFilterBannerProps {
    foodName: string;
    onClear: () => void;
}

export const RecipeFoodFilterBanner = ({ foodName, onClear }: RecipeFoodFilterBannerProps) => (
    <div className="shrink-0 flex items-center gap-2 rounded-2xl bg-orange-50 dark:bg-orange-900/20 px-3 py-2 text-sm">
        <Carrot className="w-4 h-4 shrink-0 text-orange-500" />
        <span className="flex-1 min-w-0 truncate text-slate-700">
            Recettes avec : <span className="font-bold text-slate-900">{foodName}</span>
        </span>
        <button
            aria-label="Retirer le filtre aliment"
            onClick={onClear}
            className="shrink-0 p-1.5 rounded-lg text-slate-400 hover:text-orange-600 hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
        >
            <X className="w-4 h-4" />
        </button>
    </div>
);
