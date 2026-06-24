import { useParams, useNavigate } from 'react-router-dom';
import { FlipCard } from '../FlipCard';
import { ArrowLeft, X } from 'lucide-react';
import { useMemo, useState, useEffect, useRef } from 'react';
import { CATEGORIES } from '../../../../core/domain/categories';
import { markScrolling } from '../../../../shared/utils/scrollGuard';
import { MacroFilterButton } from '../filter/MacroFilterButton';
import { PREDEFINED_FILTERS } from '../../../../core/domain/predefinedFilters';
import { isPlannable } from '../../../../core/domain/recipePredicates';
import { useMenuStore } from '../../../../shared/store/useMenuStore';
import { typedRecipesDb } from '../../../../core/typed-db/typedRecipesDb';
import { getCategoryRecipes, filterCategoryRecipesByMacros } from '../../../../core/logic/recipe/recipeLogic';
import { RecipePhotoCard } from '../../../../shared/components/ui/RecipePhotoCard';
import { FoodPhotoCard } from '../../../../shared/components/ui/FoodPhotoCard';
import { RecipeIngredientsCard } from '../../../../shared/components/ui/RecipeIngredientsCard';
import { LazyRender } from '../../../../shared/components/ui/LazyRender';

export const CategoryDetail = () => {
    const { categoryId } = useParams();
    const navigate = useNavigate();
    const { activeFilterIds, setActiveFilterIds } = useMenuStore();

    const categoryInfo = CATEGORIES.find(cat => cat.id === categoryId);
    const recipes = useMemo(() => getCategoryRecipes(categoryId ?? ''), [categoryId]);

    const filteredRecipes = useMemo(
        () => filterCategoryRecipesByMacros(recipes, activeFilterIds),
        [recipes, activeFilterIds],
    );

    const removeFilter = (id: string) => setActiveFilterIds(activeFilterIds.filter(f => f !== id));

    const BATCH_SIZE = 24;
    const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
    const [prevFiltered, setPrevFiltered] = useState(filteredRecipes);
    const sentinelRef = useRef<HTMLDivElement>(null);

    if (filteredRecipes !== prevFiltered) {
        setPrevFiltered(filteredRecipes);
        setVisibleCount(BATCH_SIZE);
    }

    useEffect(() => {
        const el = sentinelRef.current;
        if (!el) return;
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setVisibleCount(prev => Math.min(prev + BATCH_SIZE, filteredRecipes.length));
            }
        }, { threshold: 0.1 });
        observer.observe(el);
        return () => observer.disconnect();
    }, [filteredRecipes.length]);

    const visibleRecipes = useMemo(
        () => filteredRecipes.slice(0, visibleCount),
        [filteredRecipes, visibleCount],
    );

    return (
        <div className="h-full flex flex-col gap-4 overflow-hidden">

            <div className="flex items-center justify-between gap-3 shrink-0">
                <div className="flex items-baseline gap-3 min-w-0 shrink">
                    <button
                        aria-label="Retour aux recettes"
                        onClick={() => navigate('/recipes')}
                        className="p-2 rounded-xl text-slate-400 hover:text-orange-600 hover:bg-orange-50 transition-colors shrink-0 self-center"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-xl sm:text-2xl tablet:text-3xl font-black text-slate-900 truncate">
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
                                <button aria-label={`Retirer le filtre ${filter.label}`} onClick={() => removeFilter(id)} className="hover:text-orange-900 transition-colors">
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
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-3 pb-2">
                    {visibleRecipes.map((recipe, i) => (
                        <LazyRender key={recipe.id} className="aspect-[10/11] animate-fade-in-up" style={{ animationDelay: `${i * 25}ms` }}>
                            <FlipCard
                                name={recipe.name}
                                frontContent={
                                    recipe.isIngredientKind
                                        ? <FoodPhotoCard recipeId={recipe.id} recipe={typedRecipesDb[recipe.id]} fill />
                                        : <RecipePhotoCard recipeId={recipe.id} recipe={typedRecipesDb[recipe.id]} fill />
                                }
                                backContent={recipe.isIngredientKind ? undefined : <RecipeIngredientsCard recipeId={recipe.id} recipe={typedRecipesDb[recipe.id]} fill />}
                                recipeUrl={recipe.recipeUrl}
                                onClick={() => navigate(`/recipes/detail/${recipe.id}?category=${categoryId}`)}
                                onAddToPlanning={isPlannable(typedRecipesDb[recipe.id]) ? () => navigate(`/planning?addRecipe=${recipe.id}`) : undefined}
                            />
                        </LazyRender>
                    ))}
                </div>
                {visibleCount < filteredRecipes.length && (
                    <div ref={sentinelRef} className="flex justify-center items-center gap-2 py-6 text-slate-400">
                        <div className="w-4 h-4 rounded-full border-2 border-slate-300 border-t-orange-400 animate-spin" />
                        <span className="text-xs font-semibold uppercase tracking-widest">Chargement…</span>
                    </div>
                )}
                {visibleCount >= filteredRecipes.length && <div ref={sentinelRef} className="h-4" />}
            </div>
        </div>
    );
};
