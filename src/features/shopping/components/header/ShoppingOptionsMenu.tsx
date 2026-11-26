import { useCallback, useRef, useState } from 'react';
import { CalendarDays, Clipboard, House, ListOrdered, Scale, Share2, SlidersHorizontal, Store } from 'lucide-react';
import { FloatingMenu } from '../../../../shared/components/ui/FloatingMenu';
import { OptionsMenuSection } from './OptionsMenuSection';
import { OptionsToolRow } from './OptionsToolRow';

export interface ShoppingOptionsMenuProps {
    onOpenPriceSettings: (() => void) | null;
    onOpenHousehold: () => void;
    onOpenAisleOrder: () => void;
    onOpenPriceCalc: () => void;
    onCopy: (() => void) | null;
    onShare: (() => void) | null;
    onChangeDays: () => void;
}

const ICON = 'w-4 h-4';

export const ShoppingOptionsMenu = ({
    onOpenPriceSettings,
    onOpenHousehold,
    onOpenAisleOrder,
    onOpenPriceCalc,
    onCopy,
    onShare,
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
                Outils
            </button>
            <FloatingMenu open={open} anchorRef={anchorRef} onClose={close} className="w-64 max-w-[calc(100vw-16px)] p-1.5">
                <div role="menu" aria-label="Outils de la liste" className="max-h-[75dvh] overflow-y-auto">
                    <OptionsMenuSection title="Liste">
                        <OptionsToolRow icon={<CalendarDays className={ICON} />} label="Changer les jours" onSelect={run(onChangeDays)} />
                        {onShare && <OptionsToolRow icon={<Share2 className={ICON} />} label="Partager" onSelect={run(onShare)} />}
                        {onCopy && <OptionsToolRow icon={<Clipboard className={ICON} />} label="Copier" onSelect={run(onCopy)} />}
                    </OptionsMenuSection>
                    <OptionsMenuSection title="Rangement">
                        <OptionsToolRow icon={<ListOrdered className={ICON} />} label="Ordre des rayons" onSelect={run(onOpenAisleOrder)} />
                        <OptionsToolRow icon={<House className={ICON} />} label="Articles du quotidien" onSelect={run(onOpenHousehold)} />
                    </OptionsMenuSection>
                    <OptionsMenuSection title="Prix">
                        {onOpenPriceSettings && <OptionsToolRow icon={<Store className={ICON} />} label="Magasin des prix" onSelect={run(onOpenPriceSettings)} />}
                        <OptionsToolRow icon={<Scale className={ICON} />} label="Prix au kilo" onSelect={run(onOpenPriceCalc)} />
                    </OptionsMenuSection>
                </div>
            </FloatingMenu>
        </>
    );
};
