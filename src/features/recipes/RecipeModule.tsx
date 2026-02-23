import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchBar } from '../../shared/components/SearchBar';
import { CategoryCard } from '../../shared/components/CategoryCard';
import { FlipCard } from './components/FlipCard'; // Réutilisation de ta superbe carte
import { useSearch } from '../../shared/hooks/useSearch';
import { CATEGORIES } from '../../core/domain/categories';

export const RecipeModule = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState(() => {
        return sessionStorage.getItem('last_recipe_search') || '';
    });
    const excluded = ["Extérieur"];

    // Utilisation du hook
    const searchResults = useSearch(searchQuery);

    const handleSearchChange = (val: string) => {
        setSearchQuery(val);
        sessionStorage.setItem('last_recipe_search', val); // On mémorise
    };

    return (
        <div className="space-y-8 pb-20">
            <div className="flex flex-col gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900">Mes Recettes</h1>
                    <p className="text-slate-500">Que mangeons-nous aujourd'hui ?</p>
                </div>

                {/* Barre de recherche */}
                <SearchBar
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onClear={() => setSearchQuery('')}
                />
            </div>

            {/* CONDITION D'AFFICHAGE : Recherche ou Catégories */}
            {searchQuery.length >= 1 ? (
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-slate-700">
                        Résultats ({searchResults.length})
                    </h2>

                    {searchResults.length === 0 ? (
                        <div className="text-center py-10 text-slate-400">
                            Aucune recette trouvée pour "{searchQuery}"
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-6">
                            {searchResults.map((recipe) => (
                                <FlipCard
                                    key={recipe.id}
                                    name={recipe.name}
                                    frontImage={recipe.photoUrl || ''} // Supporte les deux formats
                                    backImage={recipe.ingredientsUrl}
                                    recipeUrl={recipe.recipeUrl}
                                    onClick={() => navigate(`/recipes/detail/${recipe.recipeId || recipe.id}`)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                /* VUE PAR DÉFAUT : LES CATÉGORIES */
                <div className="grid grid-cols-2 tablet:grid-cols-3 lg:grid-cols-6 gap-6">
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
    );
};