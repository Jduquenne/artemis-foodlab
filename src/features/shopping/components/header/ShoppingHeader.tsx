import { Plus } from 'lucide-react';
import { ShoppingView } from '../../../../core/domain/shopping';
import { ActiveFilterPill, ActiveFilterPills } from './ActiveFilterPills';
import { EstimateBadge, EstimateBadgeProps } from './EstimateBadge';
import { ShoppingViewToggle } from './ShoppingViewToggle';
import { ShoppingOptionsMenu, ShoppingOptionsMenuProps } from './ShoppingOptionsMenu';
import { PageHeading } from '../../../../shared/components/layout/PageHeading';

export interface ShoppingHeaderProps {
    daysLabel: string | null;
    remainingCount: number | null;
    view: ShoppingView;
    onViewChange: (view: ShoppingView) => void;
    onAddExtra: (() => void) | null;
    options: ShoppingOptionsMenuProps;
    pills: ActiveFilterPill[];
    estimate: EstimateBadgeProps | null;
}

export const ShoppingHeader = ({ daysLabel, remainingCount, view, onViewChange, onAddExtra, options, pills, estimate }: ShoppingHeaderProps) => (
    <div className="shrink-0 flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center lg:gap-x-6 lg:gap-y-2">
        <div className="flex items-center justify-between gap-2 lg:contents">
            <PageHeading
                title="Liste de courses"
                subtitle={
                    <>
                        {daysLabel ?? <span className="italic text-slate-400">Aucune période sélectionnée</span>}
                        {remainingCount !== null && (
                            <span className="text-orange-600 font-medium before:content-['·'] before:mx-1.5">
                                {remainingCount} à acheter
                            </span>
                        )}
                        {estimate && <EstimateBadge {...estimate} />}
                    </>
                }
            />
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
            <ShoppingViewToggle view={view} onChange={onViewChange} />
        </div>
        {pills.length > 0 && (
            <div className="lg:order-3 lg:basis-full">
                <ActiveFilterPills pills={pills} />
            </div>
        )}
    </div>
);
