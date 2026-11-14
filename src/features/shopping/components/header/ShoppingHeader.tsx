import { Plus } from 'lucide-react';
import { ShoppingMode } from '../../../../core/domain/shopping';
import { ActiveFilterPill, ActiveFilterPills } from './ActiveFilterPills';
import { ShoppingModeToggle } from './ShoppingModeToggle';
import { ShoppingOptionsMenu, ShoppingOptionsMenuProps } from './ShoppingOptionsMenu';

export interface ShoppingHeaderProps {
    daysLabel: string | null;
    remainingCount: number | null;
    mode: ShoppingMode;
    onModeChange: (mode: ShoppingMode) => void;
    onAddExtra: (() => void) | null;
    options: ShoppingOptionsMenuProps;
    pills: ActiveFilterPill[];
}

export const ShoppingHeader = ({ daysLabel, remainingCount, mode, onModeChange, onAddExtra, options, pills }: ShoppingHeaderProps) => (
    <div className="shrink-0 flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center lg:gap-x-6 lg:gap-y-2">
        <div className="flex items-start justify-between gap-2 lg:contents">
            <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl tablet:text-3xl font-black text-slate-900">Liste de courses</h1>
                <p className="text-slate-500 text-sm mt-0.5">
                    {daysLabel ?? <span className="italic text-slate-400">Aucune période sélectionnée</span>}
                    {remainingCount !== null && (
                        <span className="text-orange-600 font-medium before:content-['·'] before:mx-1.5">
                            {remainingCount} {mode === 'store' ? `restant${remainingCount !== 1 ? 's' : ''}` : 'à acheter'}
                        </span>
                    )}
                </p>
            </div>
            <div className="flex gap-2 shrink-0 lg:order-2 lg:ml-auto">
                {onAddExtra && (
                    <button
                        type="button"
                        onClick={onAddExtra}
                        className="flex items-center gap-1 h-10 pl-2.5 pr-3.5 rounded-xl bg-orange-500 text-white text-sm font-bold shadow-sm hover:bg-orange-600 transition-colors lg:h-9 lg:text-[13px]"
                    >
                        <Plus className="w-4 h-4" />
                        Article
                    </button>
                )}
                <ShoppingOptionsMenu {...options} />
            </div>
        </div>
        <div className="lg:order-1">
            <ShoppingModeToggle mode={mode} onChange={onModeChange} />
        </div>
        {pills.length > 0 && (
            <div className="lg:order-3 lg:basis-full">
                <ActiveFilterPills pills={pills} />
            </div>
        )}
    </div>
);
