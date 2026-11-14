import { useCallback, useRef, useState } from 'react';
import { CalendarDays, Clipboard, Globe, House, LayoutList, ListOrdered, MapPin, MapPinOff, Scale, SlidersHorizontal, UtensilsCrossed } from 'lucide-react';
import { ShoppingLayout } from '../../../../core/domain/shopping';
import { PlaceFilter } from '../../../../core/logic/shopping/shoppingPlaceLogic';
import { FloatingMenu } from '../../../../shared/components/ui/FloatingMenu';
import { OptionsMenuSection } from './OptionsMenuSection';
import { OptionsRadioRow } from './OptionsRadioRow';
import { OptionsToolRow } from './OptionsToolRow';

export interface ShoppingOptionsMenuProps {
    placeName: string | null;
    placeFilter: PlaceFilter;
    onPlaceFilterChange: (value: PlaceFilter) => void;
    layout: ShoppingLayout;
    onLayoutChange: (value: ShoppingLayout) => void;
    hasActiveFilter: boolean;
    onOpenHousehold: () => void;
    onOpenAisleOrder: () => void;
    onOpenPriceCalc: () => void;
    onCopy: (() => void) | null;
    onChangeDays: () => void;
}

const ICON = 'w-4 h-4';

export const ShoppingOptionsMenu = ({
    placeName,
    placeFilter,
    onPlaceFilterChange,
    layout,
    onLayoutChange,
    hasActiveFilter,
    onOpenHousehold,
    onOpenAisleOrder,
    onOpenPriceCalc,
    onCopy,
    onChangeDays,
}: ShoppingOptionsMenuProps) => {
    const [open, setOpen] = useState(false);
    const anchorRef = useRef<HTMLButtonElement>(null);
    const close = useCallback(() => setOpen(false), []);
    const run = (action: () => void) => () => {
        setOpen(false);
        action();
    };

    return (
        <>
            <button
                ref={anchorRef}
                type="button"
                aria-haspopup="menu"
                aria-expanded={open}
                onClick={() => setOpen((o) => !o)}
                className={`relative shrink-0 flex items-center gap-1.5 h-10 px-3 rounded-xl border text-sm font-bold shadow-sm transition-colors lg:h-9 lg:text-[13px] ${open
                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-600'
                    : 'border-slate-200 bg-surface text-slate-900 hover:border-orange-300 hover:text-orange-600'
                    }`}
            >
                <SlidersHorizontal className="w-4 h-4" />
                Options
                {hasActiveFilter && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-orange-500 ring-2 ring-surface" />
                )}
            </button>
            <FloatingMenu open={open} anchorRef={anchorRef} onClose={close} className="w-80 max-w-[calc(100vw-16px)] p-1.5">
                <div role="menu" aria-label="Options de la liste" className="max-h-[75dvh] overflow-y-auto">
                    {placeName && (
                        <OptionsMenuSection title="Où j'achète">
                            <OptionsRadioRow icon={<Globe className={ICON} />} label="Tout" hint="Toute la liste" checked={placeFilter === 'all'} onSelect={run(() => onPlaceFilterChange('all'))} />
                            <OptionsRadioRow icon={<MapPin className={ICON} />} label={`Seulement ${placeName}`} hint={`Les articles marqués ${placeName}`} checked={placeFilter === 'place'} onSelect={run(() => onPlaceFilterChange('place'))} />
                            <OptionsRadioRow icon={<MapPinOff className={ICON} />} label="Ailleurs" hint={`Tout sauf ${placeName}`} checked={placeFilter === 'elsewhere'} onSelect={run(() => onPlaceFilterChange('elsewhere'))} />
                        </OptionsMenuSection>
                    )}
                    <OptionsMenuSection title="Affichage">
                        <OptionsRadioRow icon={<LayoutList className={ICON} />} label="Par rayon" hint="Dans l'ordre de ton parcours" checked={layout === 'aisles'} onSelect={run(() => onLayoutChange('aisles'))} />
                        <OptionsRadioRow icon={<UtensilsCrossed className={ICON} />} label="Par repas" hint="Recette par recette" checked={layout === 'meals'} onSelect={run(() => onLayoutChange('meals'))} />
                    </OptionsMenuSection>
                    <OptionsMenuSection title="Outils">
                        <OptionsToolRow icon={<House className={ICON} />} label="Articles du quotidien" hint="Papier toilette, lessive…" onSelect={run(onOpenHousehold)} />
                        <OptionsToolRow icon={<ListOrdered className={ICON} />} label="Ordre des rayons" hint="Ton parcours en magasin" onSelect={run(onOpenAisleOrder)} />
                        <OptionsToolRow icon={<Scale className={ICON} />} label="Prix au kilo" hint="Calculette" onSelect={run(onOpenPriceCalc)} />
                        {onCopy && <OptionsToolRow icon={<Clipboard className={ICON} />} label="Copier la liste" hint="Ce qui reste à acheter" onSelect={run(onCopy)} />}
                        <OptionsToolRow icon={<CalendarDays className={ICON} />} label="Changer les jours" hint="Ouvre le planning" onSelect={run(onChangeDays)} />
                    </OptionsMenuSection>
                </div>
            </FloatingMenu>
        </>
    );
};
