import { Plus } from 'lucide-react';
import { ShoppingLayout, ShoppingView } from '../../../../core/domain/shopping';
import { PlaceFilter } from '../../../../core/logic/shopping/shoppingPlaceLogic';
import { ShoppingLayoutToggle } from './ShoppingLayoutToggle';
import { ShoppingPlaceSelect } from './ShoppingPlaceSelect';
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
    layout: ShoppingLayout;
    onLayoutChange: (layout: ShoppingLayout) => void;
    placeName: string | null;
    placeFilter: PlaceFilter;
    onPlaceFilterChange: (value: PlaceFilter) => void;
    options: ShoppingOptionsMenuProps;
    estimate: EstimateBadgeProps | null;
}

export const ShoppingHeader = ({ daysLabel, remainingCount, view, onViewChange, layout, onLayoutChange, placeName, placeFilter, onPlaceFilterChange, onAddExtra, options, estimate }: ShoppingHeaderProps) => (
    <div className="shrink-0 flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-4">
        <div className="flex items-center justify-between gap-2 min-w-0 lg:contents">
            <div className="min-w-0 lg:order-1 lg:shrink">
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
            </div>
            <div className="flex gap-2 shrink-0 lg:order-3 lg:ml-auto">
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
        <div className="flex items-center gap-2 min-w-0 lg:order-2">
            <ShoppingViewToggle view={view} onChange={onViewChange} />
            <ShoppingLayoutToggle layout={layout} onChange={onLayoutChange} />
            {placeName && <ShoppingPlaceSelect placeName={placeName} value={placeFilter} onChange={onPlaceFilterChange} />}
        </div>
    </div>
);
