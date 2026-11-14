import { useMemo } from 'react';
import { IngredientSource, RecipeCard } from '../../../../core/domain/shopping';
import { distributeToColumns } from '../../../../core/utils/columnUtils';
import { sumBy } from '../../../../core/utils/collectionUtils';
import { ShoppingEmptyState } from '../ShoppingEmptyState';
import { RecipeShoppingCard } from './RecipeShoppingCard';

export interface ShoppingMealsViewProps {
    cards: RecipeCard[];
    colCount: number;
    sourceChecked: Set<string>;
    checkableKeys: ReadonlySet<string>;
    placeName: string | null;
    atPlace: Set<string>;
    onToggleAllAtPlace: (keys: string[], value: boolean) => void;
    onToggleSource: (ingredientKey: string, sources: IngredientSource[], checked: boolean) => void;
    onToggleBatch: (batch: Array<{ ingredientKey: string; sources: IngredientSource[] }>, checked: boolean) => void;
    onOpenDetail: (key: string) => void;
}

export const ShoppingMealsView = ({ cards, colCount, ...cardProps }: ShoppingMealsViewProps) => {
    const columns = useMemo(
        () => distributeToColumns(cards, c => c.directIngredients.length + sumBy(c.baseGroups, b => b.ingredients.length), colCount),
        [cards, colCount]
    );

    if (cards.length === 0) {
        return <ShoppingEmptyState title="Aucun repas planifié sur cette période" hint="Planifie des repas pour générer la liste" />;
    }

    return (
        <div className="grid gap-4 pb-4 items-start" style={{ gridTemplateColumns: `repeat(${colCount}, 1fr)` }}>
            {columns.map((col, ci) => (
                <div key={ci} className="flex flex-col gap-4">
                    {col.map((card, i) => (
                        <div key={card.recipeId} className="animate-fade-in-up" style={{ animationDelay: `${(ci + i) * 60}ms` }}>
                            <RecipeShoppingCard
                                recipeName={card.recipeName}
                                directIngredients={card.directIngredients}
                                baseGroups={card.baseGroups}
                                {...cardProps}
                            />
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
};
