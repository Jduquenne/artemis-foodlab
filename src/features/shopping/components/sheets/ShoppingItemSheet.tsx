import { ReactNode } from 'react';
import { Loader2, Pencil, Trash2 } from 'lucide-react';
import { FreezerBag } from '../../../../core/domain/freezer';
import { ConsolidatedIngredient, IngredientSource } from '../../../../core/domain/shopping';
import { groupAndSortSources } from '../../../../core/logic/shopping/shoppingRecipeCards';
import { shoppingItemSummary } from '../../../../core/logic/shopping/shoppingRowLabel';
import { usePendingKey } from '../../../../shared/hooks/usePendingKey';
import { SourceGroupRow } from '../SourceGroupRow';
import { FreezerBagsSection } from './FreezerBagsSection';
import { PlaceToggleRow } from './PlaceToggleRow';
import { ShoppingSheet } from './ShoppingSheet';

export interface ShoppingItemSheetProps {
    item: ConsolidatedIngredient;
    stock: number;
    sourceChecked: Set<string>;
    placeName: string | null;
    atPlace: boolean;
    freezerBags: FreezerBag[];
    selectedBagIds: string[];
    priceSection?: ReactNode;
    onToggleAtPlace: (key: string) => void;
    onToggleSource: (ingredientKey: string, sources: IngredientSource[], checked: boolean) => void;
    onToggleBag: (bagId: string) => void;
    onEditExtra: (extraId: string) => void;
    onDeleteExtra: (extraId: string) => Promise<boolean>;
    onClose: () => void;
}

export const ShoppingItemSheet = ({
    item,
    stock,
    sourceChecked,
    placeName,
    atPlace,
    freezerBags,
    selectedBagIds,
    priceSection,
    onToggleAtPlace,
    onToggleSource,
    onToggleBag,
    onEditExtra,
    onDeleteExtra,
    onClose,
}: ShoppingItemSheetProps) => {
    const deletePending = usePendingKey(`shopping-extra-delete:${item.extraId ?? ''}`);
    const groups = groupAndSortSources(item.sources);
    const canFlagPlace = !!placeName && (!!item.foodId || !!item.isExtra);

    return (
        <ShoppingSheet title={item.name} subtitle={shoppingItemSummary(item, stock, sourceChecked)} onClose={onClose}>
            {item.toSpecify && (
                <p className="text-sm text-amber-600 bg-amber-50 dark:bg-amber-900/20 rounded-2xl px-3.5 py-2.5">
                    À préciser : l'aliment n'a pas été choisi pour ce repas.
                </p>
            )}
            {freezerBags.length > 0 && (
                <FreezerBagsSection bags={freezerBags} selectedBagIds={selectedBagIds} onToggleBag={onToggleBag} />
            )}
            {groups.length > 0 && (
                <section className="flex flex-col gap-1">
                    <h3 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">Pour quels repas · coche ce qui est déjà pris</h3>
                    {groups.map((group) => (
                        <SourceGroupRow
                            key={group[0].recipeId}
                            ingredientKey={item.key}
                            group={group}
                            sourceChecked={sourceChecked}
                            onToggleSource={onToggleSource}
                        />
                    ))}
                </section>
            )}
            {priceSection}
            {canFlagPlace && placeName && (
                <PlaceToggleRow itemKey={item.key} placeName={placeName} flagged={atPlace} onToggle={onToggleAtPlace} />
            )}
            {item.isExtra && item.extraId && (
                <div className="grid grid-cols-2 gap-2">
                    <button
                        type="button"
                        onClick={() => item.extraId && onEditExtra(item.extraId)}
                        className="flex items-center justify-center gap-2 py-3 rounded-2xl border border-slate-200 bg-surface text-slate-700 font-bold"
                    >
                        <Pencil className="w-4 h-4" />
                        Modifier
                    </button>
                    <button
                        type="button"
                        disabled={deletePending}
                        onClick={() => item.extraId && onDeleteExtra(item.extraId).then((deleted) => { if (deleted) onClose(); }, () => undefined)}
                        className="flex items-center justify-center gap-2 py-3 rounded-2xl border border-slate-200 bg-surface text-red-600 font-bold disabled:opacity-60"
                    >
                        {deletePending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        Supprimer
                    </button>
                </div>
            )}
        </ShoppingSheet>
    );
};
