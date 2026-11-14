import { useState } from 'react';
import { ChevronDown, ChevronUp, Snowflake } from 'lucide-react';
import { FreezerBag } from '../../../../core/domain/freezer';
import { totalBagQuantity } from '../../../../core/logic/freezer/freezerStockLogic';
import { formatQty, pluralizeUnit } from '../../../../core/logic/unit/unitFormatLogic';
import { FreezerBagRow } from '../FreezerBagRow';

export interface FreezerBagsSectionProps {
    bags: FreezerBag[];
    selectedBagIds: string[];
    onToggleBag: (bagId: string) => void;
}

const COLLAPSE_THRESHOLD = 3;

export const FreezerBagsSection = ({ bags, selectedBagIds, onToggleBag }: FreezerBagsSectionProps) => {
    const [expanded, setExpanded] = useState(false);
    const selected = bags.filter((b) => selectedBagIds.includes(b.id));
    const unselectedCount = bags.length - selected.length;
    const collapsible = bags.length > COLLAPSE_THRESHOLD;
    const shown = !collapsible || expanded ? bags : selected;

    return (
        <section className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
                <h3 className="text-[11px] font-extrabold text-cyan-600 uppercase tracking-widest flex items-center gap-1.5">
                    <Snowflake className="w-3 h-3" />
                    Au congélateur · coche un sac à utiliser
                </h3>
                {collapsible && (
                    <button
                        type="button"
                        onClick={() => setExpanded((e) => !e)}
                        className="flex items-center gap-1 text-xs text-slate-400 hover:text-cyan-500 transition-colors"
                    >
                        {expanded ? 'Réduire' : `${bags.length} sacs`}
                        {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                )}
            </div>
            {shown.map((bag) => (
                <FreezerBagRow key={bag.id} bag={bag} isSelected={selectedBagIds.includes(bag.id)} onToggleBag={onToggleBag} />
            ))}
            {collapsible && !expanded && unselectedCount > 0 && (
                <button
                    type="button"
                    onClick={() => setExpanded(true)}
                    className="w-full text-xs text-slate-400 hover:text-cyan-500 py-1.5 transition-colors"
                >
                    + {unselectedCount} sac(s) non sélectionné(s)
                </button>
            )}
            {selected.length > 0 && (
                <p className="text-xs text-cyan-600 font-semibold px-3">
                    {formatQty(totalBagQuantity(selected))} {pluralizeUnit(selected[0].unit, 0)} déduits de la liste
                </p>
            )}
        </section>
    );
};
