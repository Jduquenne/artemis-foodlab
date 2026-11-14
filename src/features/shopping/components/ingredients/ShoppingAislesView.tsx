import { useMemo } from 'react';
import { FreezerBag } from '../../../../core/domain/freezer';
import { HouseholdItem } from '../../../../core/domain/household';
import { IngredientGroup, ShoppingMode } from '../../../../core/domain/shopping';
import { assignIngredientColumns } from '../../../../core/logic/shopping/shoppingGrouping';
import { HouseholdShoppingCard } from '../HouseholdShoppingCard';
import { ShoppingCategoryCard } from './ShoppingCategoryCard';

export interface ShoppingAislesViewProps {
    allGroups: IngredientGroup[];
    groups: IngredientGroup[];
    colCount: number;
    mode: ShoppingMode;
    coveredByGroup: Record<string, number>;
    checked: Set<string>;
    stocks: Record<string, number>;
    sourceChecked: Set<string>;
    placeName: string | null;
    atPlace: Set<string>;
    foodBags: Map<string, FreezerBag[]>;
    householdItems: HouseholdItem[];
    onToggle: (key: string) => void;
    onOpenStock: (key: string) => void;
    onOpenDetail: (key: string) => void;
    onManageHousehold: () => void;
}

export const ShoppingAislesView = ({
    allGroups,
    groups,
    colCount,
    mode,
    coveredByGroup,
    checked,
    stocks,
    sourceChecked,
    placeName,
    atPlace,
    foodBags,
    householdItems,
    onToggle,
    onOpenStock,
    onOpenDetail,
    onManageHousehold,
}: ShoppingAislesViewProps) => {
    const columns = useMemo(
        () => assignIngredientColumns(allGroups, groups, colCount),
        [allGroups, groups, colCount]
    );

    const householdCard = householdItems.length > 0 && (
        <HouseholdShoppingCard items={householdItems} checked={checked} onToggle={onToggle} onManage={onManageHousehold} />
    );

    if (groups.length === 0) return <div className="pb-4">{householdCard}</div>;

    return (
        <div className="grid gap-4 pb-4 items-start" style={{ gridTemplateColumns: `repeat(${colCount}, 1fr)` }}>
            {columns.map((col, ci) => (
                <div key={ci} className="flex flex-col gap-4">
                    {col.map((group, i) => (
                        <div key={group.key} className="animate-fade-in-up" style={{ animationDelay: `${(ci + i) * 60}ms` }}>
                            <ShoppingCategoryCard
                                label={group.label}
                                items={group.list}
                                mode={mode}
                                coveredCount={coveredByGroup[group.key] ?? 0}
                                checked={checked}
                                stocks={stocks}
                                sourceChecked={sourceChecked}
                                placeName={placeName}
                                atPlace={atPlace}
                                foodBags={foodBags}
                                onToggle={onToggle}
                                onOpenStock={onOpenStock}
                                onOpenDetail={onOpenDetail}
                            />
                        </div>
                    ))}
                    {ci === columns.length - 1 && householdCard}
                </div>
            ))}
        </div>
    );
};
