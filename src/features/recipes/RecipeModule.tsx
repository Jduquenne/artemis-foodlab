import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchBar } from '../../shared/components/SearchBar';
import { CategoryCard } from '../../shared/components/CategoryCard';
import { FlipCard } from './components/FlipCard';
import { useSearch } from '../../shared/hooks/useSearch';
import { CATEGORIES } from '../../core/domain/categories';
import { markScrolling } from '../../shared/utils/scrollGuard';

export const RecipeModule = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState(() => {
        return sessionStorage.getItem('last_recipe_search') || '';
    });
    const excluded = ["Extérieur"];

    const searchResults = useSearch(searchQuery);

    const handleSearchChange = (val: string) => {
        setSearchQuery(val);
        sessionStorage.setItem('last_recipe_search', val);
    };

    return (
        <div className="h-full flex flex-col gap-4 overflow-hidden">

            <div className="flex items-center justify-between gap-6 shrink-0">
                <div className="shrink-0">
                    <h1 className="text-3xl font-black text-slate-900 leading-tight">Mes Recettes</h1>
                    <p className="text-sm text-slate-500">Que mangeons-nous aujourd'hui ?</p>
                </div>
                <div className="flex-1 min-w-0 max-w-sm">
                    <SearchBar
                        value={searchQuery}
                        onChange={handleSearchChange}
                        onClear={() => { setSearchQuery(''); sessionStorage.removeItem('last_recipe_search'); }}
                    />
                </div>
            </div>

            <div className="flex-1 min-h-0 overflow-hidden">
                {searchQuery.length >= 1 ? (
                    <div className="h-full overflow-y-auto space-y-4 pr-1" onScroll={markScrolling}>
                        <h2 className="text-xl font-bold text-slate-700">
                            Résultats ({searchResults.length})
                        </h2>
                        {searchResults.length === 0 ? (
                            <div className="text-center py-10 text-slate-400">
                                Aucune recette trouvée pour "{searchQuery}"
                            </div>
                        ) : (
                            <div className="grid gap-3 pb-4" style={{ gridTemplateColumns: 'repeat(auto-fill, 5cm)', gridAutoRows: '5.5cm', justifyContent: 'center' }}>
                                {searchResults.map((recipe) => (
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
