import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Search } from 'lucide-react';
import { SearchBar } from '../../shared/components/ui/SearchBar';
import { CategoryCard } from '../../shared/components/ui/CategoryCard';
import { FlipCard } from './components/FlipCard';
import { useSearch } from '../../shared/hooks/useSearch';
import { CATEGORIES } from '../../core/domain/categories';
import { markScrolling } from '../../shared/utils/scrollGuard';
import { MacroFilterButton } from './components/MacroFilterButton';
import { PREDEFINED_FILTERS } from '../../core/domain/predefinedFilters';
import { RecipeDetails } from '../../core/domain/types';
import { useMenuStore } from '../../shared/store/useMenuStore';
import recipesDb from '../../core/data/recipes-db.json';

export const RecipeModule = () => {
    const navigate = useNavigate();
    const { activeFilterIds, setActiveFilterIds } = useMenuStore();
    const [searchQuery, setSearchQuery] = useState(() => sessionStorage.getItem('last_recipe_search') || '');
    const [isSearchOpen, setIsSearchOpen] = useState(() => (sessionStorage.getItem('last_recipe_search') || '').length > 0);
    const excluded = ["Extérieur"];

    const isSearchActive = isSearchOpen || searchQuery.length > 0;
    const showResults = searchQuery.length >= 1 || activeFilterIds.length > 0;
    const baseResults = useSearch(showResults ? searchQuery : null);

    const filteredResults = useMemo(() => {
        if (activeFilterIds.length === 0) return baseResults;
        const data = recipesDb as unknown as Record<string, RecipeDetails>;
        const activeFilters = PREDEFINED_FILTERS.filter(f => activeFilterIds.includes(f.id));
        return baseResults.filter((recipe) => {
            const macros = data[recipe.recipeId]?.macronutriment;
            if (!macros) return false;
            return activeFilters.every(f => f.check(macros));
        });
    }, [baseResults, activeFilterIds]);

    const removeFilter = (id: string) => setActiveFilterIds(activeFilterIds.filter(f => f !== id));

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
                        {activeFilterIds.map(id => {
                            const filter = PREDEFINED_FILTERS.find(f => f.id === id);
                            return filter ? (
                                <span key={id} className="hidden sm:flex items-center gap-1 pl-2.5 pr-1.5 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full whitespace-nowrap shrink-0">
                                    {filter.label}
                                    <button onClick={() => removeFilter(id)} className="hover:text-orange-900 transition-colors">
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ) : null;
                        })}
                        <MacroFilterButton activeFilterIds={activeFilterIds} onApply={setActiveFilterIds} />
                        <button
                            onClick={openSearch}
                            className="sm:hidden p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-200 hover:text-orange-500 transition-colors"
                        >
                            <Search className="w-5 h-5" />
                        </button>
                        <div className="hidden sm:block min-w-0 w-60 tablet:w-[70ch]">
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
                    <div className="h-full overflow-y-auto space-y-4 pr-1" onScroll={markScrolling}>
                        <h2 className="text-base sm:text-xl font-bold text-slate-700">
                            Résultats ({filteredResults.length})
                        </h2>
                        {filteredResults.length === 0 ? (
                            <div className="text-center py-10 text-slate-400">
                                {searchQuery.length >= 1
                                    ? `Aucune recette trouvée pour "${searchQuery}"`
                                    : 'Aucune recette ne correspond à ces filtres'}
                            </div>
                        ) : (
                            <div className="grid gap-3 pb-4" style={{ gridTemplateColumns: 'repeat(auto-fill, 5cm)', gridAutoRows: '5.5cm', justifyContent: 'center' }}>
                                {filteredResults.map((recipe) => (
                                    <FlipCard
                                        key={recipe.id}
                                        name={recipe.name}
                                        frontImage={recipe.photoUrl || ''}
                                        backImage={recipe.ingredientsUrl}
                                        recipeUrl={recipe.recipeUrl}
                                        onClick={() => navigate(`/recipes/detail/${recipe.recipeId || recipe.id}`)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="h-full grid grid-cols-2 tablet:grid-cols-3 lg:grid-cols-6 auto-rows-fr gap-3">
                        {CATEGORIES
                            .filter(cat => !excluded.includes(cat.name))
                            .map((cat: any) => (
                                <CategoryCard
                                    key={cat.id}
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
