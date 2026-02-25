import { useParams, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../core/services/db';
import { FlipCard } from './components/FlipCard';
import { ArrowLeft, X } from 'lucide-react';
import { useMemo } from 'react';
import { CATEGORIES } from '../../core/domain/categories';
import { markScrolling } from '../../shared/utils/scrollGuard';
import { MacroFilterButton } from './components/MacroFilterButton';
import { PREDEFINED_FILTERS } from '../../core/domain/predefinedFilters';
import { toJsonKey } from '../../core/utils/shoppingLogic';
import { RecipeDetails } from '../../core/domain/types';
import { useMenuStore } from '../../shared/store/useMenuStore';
import recipesData from '../../core/domain/recipes-ingredients.json';

export const CategoryDetail = () => {
    const { categoryId } = useParams();
    const navigate = useNavigate();
    const { activeFilterIds, setActiveFilterIds } = useMenuStore();

    const categoryInfo = CATEGORIES.find(cat => cat.id === categoryId);

    const rawItems = useLiveQuery(
        () => db.recipes.where('categoryId').equals(categoryId || '').toArray(),
        [categoryId]
    );

    const recipes = useMemo(() => {
        if (!rawItems) return [];
        const map = new Map();
        rawItems.forEach(item => {
            if (!map.has(item.recipeId)) {
                map.set(item.recipeId, { id: item.recipeId, name: item.name, photoUrl: '', ingredientsUrl: '', recipeUrl: '' });
            }
            const entry = map.get(item.recipeId);
            if (item.type === 'photo') entry.photoUrl = item.url;
            if (item.type === 'ingredients') entry.ingredientsUrl = item.url;
            if (item.type === 'recipes') entry.recipeUrl = item.url;
        });
        return Array.from(map.values()).filter(r => r.photoUrl);
    }, [rawItems]);

    const filteredRecipes = useMemo(() => {
        if (activeFilterIds.length === 0) return recipes;
        const data = recipesData as unknown as Record<string, RecipeDetails>;
        const activeFilters = PREDEFINED_FILTERS.filter(f => activeFilterIds.includes(f.id));
        return recipes.filter((recipe) => {
            const jsonKey = toJsonKey(recipe.id);
            const macros = data[recipe.id]?.macronutriment ?? data[jsonKey]?.macronutriment;
            if (!macros) return false;
            return activeFilters.every(f => f.check(macros));
        });
    }, [recipes, activeFilterIds]);

    const removeFilter = (id: string) => setActiveFilterIds(activeFilterIds.filter(f => f !== id));

    return (
        <div className="h-full flex flex-col gap-4 overflow-hidden">

            <div className="flex items-center justify-between gap-3 shrink-0">
                <div className="flex items-baseline gap-3 min-w-0 shrink">
                    <button
                        onClick={() => navigate('/recipes')}
                        className="p-2 rounded-xl text-slate-400 hover:text-orange-600 hover:bg-orange-50 transition-colors shrink-0 self-center"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-3xl font-black text-slate-900 truncate">
                        {categoryInfo ? categoryInfo.name : categoryId}
                    </h1>
                    <span className="shrink-0 text-sm font-bold text-slate-400">
                        {activeFilterIds.length > 0
                            ? `${filteredRecipes.length} / ${recipes.length} recettes`
                            : `${recipes.length} recettes`}
                    </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    {activeFilterIds.map(id => {
                        const filter = PREDEFINED_FILTERS.find(f => f.id === id);
                        return filter ? (
                            <span key={id} className="flex items-center gap-1 pl-2.5 pr-1.5 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full whitespace-nowrap">
                                {filter.label}
                                <button onClick={() => removeFilter(id)} className="hover:text-orange-900 transition-colors">
                                    <X className="w-3 h-3" />
                                </button>
                            </span>
                        ) : null;
                    })}
                    <MacroFilterButton
                        activeFilterIds={activeFilterIds}
                        onApply={setActiveFilterIds}
                    />
                </div>
            </div>

            <div className="flex-1 justify-center min-h-0 overflow-y-auto" onScroll={markScrolling}>
                <div
                    className="grid gap-3 pb-2"
                    style={{ gridTemplateColumns: 'repeat(auto-fill, 5cm)', gridAutoRows: '5.5cm', justifyContent: 'center' }}
                >
                    {filteredRecipes.map(recipe => (
                        <FlipCard
                            key={recipe.id}
                            name={recipe.name}
                            frontImage={recipe.photoUrl}
                            backImage={recipe.ingredientsUrl}
                            recipeUrl={recipe.recipeUrl}
                            onClick={() => navigate(`/recipes/detail/${recipe.id}`)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};
