import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Search, Plus } from 'lucide-react';
import { useIsAdmin } from '../../shared/hooks/useIsAdmin';
import { useRecipeBuilderStore } from '../../shared/store/useRecipeBuilderStore';
import { SearchBar } from '../../shared/components/ui/SearchBar';
import { CategoryCard } from '../../shared/components/ui/CategoryCard';
import { useSearchRecipes } from '../../shared/hooks/useSearch';
import { useCategoriesSnapshot, useRecipeMetricsSnapshot, useRecipesSnapshot } from '../../shared/hooks/useCatalogueSnapshot';
import { isBrowsableCategory } from '../../core/domain/recipePredicates';
import { RecipeFilterButton } from './components/filter/RecipeFilterButton';
import { ActiveFilterChips } from './components/filter/ActiveFilterChips';
import { useTypeMedians } from '../../shared/hooks/useTypeMedians';
import { useMenuStore } from '../../shared/store/useMenuStore';
import { filterRecipesByFilter, isRecipeFilterActive } from '../../core/logic/recipe/recipeFilterLogic';
import { RecipeSearchResults } from './components/RecipeSearchResults';

export const RecipeModule = () => {
    const navigate = useNavigate();
    const isAdmin = useIsAdmin();
    const resetBuilder = useRecipeBuilderStore((s) => s.reset);
    const { recipeFilter, setRecipeFilter } = useMenuStore();
    const [searchQuery, setSearchQuery] = useState(() => sessionStorage.getItem('last_recipe_search') || '');
    const [isSearchOpen, setIsSearchOpen] = useState(() => (sessionStorage.getItem('last_recipe_search') || '').length > 0);

    const isSearchActive = isSearchOpen || searchQuery.length > 0;
    const showResults = searchQuery.length >= 3 || isRecipeFilterActive(recipeFilter);
    const baseResults = useSearchRecipes(showResults ? searchQuery : '');
    const { macros: recipeMacros } = useRecipeMetricsSnapshot();
    const medians = useTypeMedians();
    const recipes = useRecipesSnapshot();
    const categories = useCategoriesSnapshot();

    const filteredResults = useMemo(
        () => filterRecipesByFilter(baseResults, recipes, recipeMacros, recipeFilter, medians),
        [baseResults, recipes, recipeMacros, recipeFilter, medians],
    );

    const handleSearchChange = (val: string) => {
        setSearchQuery(val);
        sessionStorage.setItem('last_recipe_search', val);
    };

    const openSearch = () => setIsSearchOpen(true);

    const closeSearch = () => {
        setIsSearchOpen(false);
        setSearchQuery('');
        sessionStorage.removeItem('last_recipe_search');
    };

    return (
        <div className="h-full flex flex-col gap-4 overflow-hidden">

            <div className="flex items-center gap-3 shrink-0">
                {isSearchActive && (
                    <>
                        <div className="flex-1 min-w-0 sm:hidden">
                            <SearchBar
                                value={searchQuery}
                                onChange={handleSearchChange}
                                onClear={() => handleSearchChange('')}
                            />
                        </div>
                        <button
                            aria-label="Rechercher"
                            onClick={closeSearch}
                            className="sm:hidden p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-200 hover:text-slate-600 transition-colors shrink-0"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </>
                )}

                <div className={`${isSearchActive ? 'hidden sm:flex' : 'flex'} flex-1 items-center justify-between gap-3 min-w-0`}>
                    <div className="shrink-0">
                        <h1 className="text-xl sm:text-2xl tablet:text-3xl font-black text-slate-900 leading-tight">Mes Recettes</h1>
                        <p className="text-xs sm:text-sm text-slate-500">Que mangeons-nous aujourd'hui ?</p>
                    </div>
                    <div className="flex items-center gap-2 min-w-0">
                        <div className="hidden sm:flex items-center gap-2 min-w-0 overflow-x-auto">
                            <ActiveFilterChips filter={recipeFilter} onChange={setRecipeFilter} />
                        </div>
                        {isAdmin && (
                            <button
                                onClick={() => { resetBuilder(); navigate('/recipe-builder'); }}
                                title="Nouvelle recette"
                                className="shrink-0 flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-orange-500 text-white text-sm font-bold hover:bg-orange-600 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                <span className="hidden sm:inline">Recette</span>
                            </button>
                        )}
                        <RecipeFilterButton filter={recipeFilter} candidates={baseResults} onApply={setRecipeFilter} />
                        <button
                            onClick={openSearch}
                            className="sm:hidden p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-200 hover:text-orange-500 transition-colors"
                        >
                            <Search className="w-5 h-5" />
                        </button>
                        <div className="hidden sm:block min-w-0 w-60 tablet:w-72">
                            <SearchBar
                                value={searchQuery}
                                onChange={handleSearchChange}
                                onClear={() => handleSearchChange('')}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 min-h-0 overflow-hidden">
                {showResults ? (
                    <RecipeSearchResults
                        results={filteredResults}
                        searchQuery={searchQuery}
                        scrollKey={`search:${searchQuery}:${JSON.stringify(recipeFilter)}`}
                    />
                ) : (
                    <div className="h-full grid grid-cols-2 tablet:grid-cols-3 lg:grid-cols-6 auto-rows-fr gap-3">
                        {categories
                            .filter(isBrowsableCategory)
                            .map((cat) => (
                                <CategoryCard
                                    key={cat.id}
                                    id={cat.id}
                                    name={cat.name}
                                    onClick={() => navigate(`/recipes/category/${cat.id}`)}
                                />
                            ))}
                    </div>
                )}
            </div>
        </div>
    );
};
