import { useState } from 'react';
import { X, Snowflake, ChevronDown, ChevronUp } from 'lucide-react';
import { IngredientSource } from '../../../core/domain/shopping';
import { groupAndSortSources } from '../../../core/logic/shopping/shoppingRecipeCards';
import { FreezerBag } from '../../../core/domain/freezer';
import { pluralizeUnit, formatQty } from '../../../shared/utils/unitUtils';
import { FreezerBagRow } from './FreezerBagRow';
import { SourceGroupRow } from './SourceGroupRow';
import { totalBagQuantity } from '../../../core/logic/freezer/freezerLogic';

export interface SourcesModalProps {
    ingredientKey: string;
    sources: IngredientSource[];
    sourceChecked: Set<string>;
    onToggleSource: (ingredientKey: string, sources: IngredientSource[], checked: boolean) => void;
    onClose: () => void;
    freezerBags?: FreezerBag[];
    selectedBagIds?: string[];
    onToggleBag?: (bagId: string) => void;
}

const COLLAPSE_THRESHOLD = 3;

export const SourcesModal = ({ ingredientKey, sources, sourceChecked, onToggleSource, onClose, freezerBags, selectedBagIds = [], onToggleBag }: SourcesModalProps) => {
    const [bagsExpanded, setBagsExpanded] = useState(false);
    const groups = groupAndSortSources(sources);

    return (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-200 rounded-2xl shadow-2xl w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between px-5 pt-5 pb-3">
                    <p className="text-xs font-black text-orange-600 uppercase tracking-widest">Utilisé dans</p>
                    <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-300 transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>
                {freezerBags && freezerBags.length > 0 && (
                    <div className="px-5 pb-3 border-b border-slate-100">
                        <div className="flex items-center justify-between mb-1.5">
                            <p className="text-xs font-black text-cyan-600 uppercase tracking-widest flex items-center gap-1.5">
                                <Snowflake className="w-3 h-3" />
                                Congélateur
                            </p>
                            {freezerBags.length > COLLAPSE_THRESHOLD && (
                                <button
                                    onClick={() => setBagsExpanded(e => !e)}
                                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-cyan-500 transition-colors"
                                >
                                    {bagsExpanded ? 'Réduire' : `${freezerBags.length} sacs`}
                                    {bagsExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                </button>
                            )}
                        </div>
                        <div className="space-y-0.5">
                            {(freezerBags.length <= COLLAPSE_THRESHOLD || bagsExpanded
                                ? freezerBags
                                : freezerBags.filter(b => selectedBagIds.includes(b.id))
                            ).map(bag => (
                                <FreezerBagRow
                                    key={bag.id}
                                    bag={bag}
                                    isSelected={selectedBagIds.includes(bag.id)}
                                    onToggleBag={onToggleBag}
                                />
                            ))}
                            {freezerBags.length > COLLAPSE_THRESHOLD && !bagsExpanded && freezerBags.filter(b => !selectedBagIds.includes(b.id)).length > 0 && (
                                <button
                                    onClick={() => setBagsExpanded(true)}
                                    className="w-full text-xs text-slate-400 hover:text-cyan-500 py-1.5 transition-colors"
                                >
                                    + {freezerBags.filter(b => !selectedBagIds.includes(b.id)).length} sac(s) non sélectionné(s)
                                </button>
                            )}
                        </div>
                        {selectedBagIds.length > 0 && (
                            <p className="text-xs text-cyan-600 font-semibold mt-2 px-3">
                                {formatQty(totalBagQuantity(freezerBags.filter(b => selectedBagIds.includes(b.id))))} {pluralizeUnit(freezerBags.find(b => selectedBagIds.includes(b.id))?.unit ?? '', 0)} déduits de la liste
                            </p>
                        )}
                    </div>
                )}
                <div className="px-5 pb-5 space-y-1">
                    {groups.map((group, i) => (
                        <SourceGroupRow
                            key={i}
                            ingredientKey={ingredientKey}
                            group={group}
                            sourceChecked={sourceChecked}
                            onToggleSource={onToggleSource}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};
