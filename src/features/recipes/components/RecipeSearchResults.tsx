import { useNavigate } from 'react-router-dom';
import { FlipCard } from './FlipCard';
import { isPlannable } from '../../../core/domain/recipePredicates';
import { typedRecipesDb } from '../../../core/typed-db/typedRecipesDb';
import { markScrolling } from '../../../shared/utils/scrollGuard';
import { useScrollRestore } from '../../../shared/hooks/useScrollRestore';
import { SearchRecipeResult } from '../../../shared/hooks/useSearch';
import { RecipePhotoCard } from '../../../shared/components/ui/RecipePhotoCard';
import { RecipeIngredientsCard } from '../../../shared/components/ui/RecipeIngredientsCard';
import { LazyRender } from '../../../shared/components/ui/LazyRender';

interface RecipeSearchResultsProps {
    results: SearchRecipeResult[];
    searchQuery: string;
    scrollKey: string;
}

export const RecipeSearchResults = ({ results, searchQuery, scrollKey }: RecipeSearchResultsProps) => {
    const navigate = useNavigate();
    const { ref, onScroll } = useScrollRestore(scrollKey);

    return (
        <div ref={ref} className="h-full overflow-y-auto space-y-4 pr-1" onScroll={() => { markScrolling(); onScroll(); }}>
            <h2 className="text-base sm:text-xl font-bold text-slate-700">
                Résultats ({results.length})
            </h2>
            {results.length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                    {searchQuery.length >= 3
                        ? `Aucune recette trouvée pour "${searchQuery}"`
                        : searchQuery.length > 0
                            ? `Encore ${3 - searchQuery.length} caractère${3 - searchQuery.length > 1 ? 's' : ''}…`
                            : 'Aucune recette ne correspond à ces filtres'}
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-3 pb-4">
                    {results.map((recipe) => (
                        <LazyRender key={recipe.id} className="aspect-[10/11]">
                            <FlipCard
                                name={recipe.name}
                                frontContent={<RecipePhotoCard recipeId={recipe.recipeId} recipe={typedRecipesDb[recipe.recipeId]} fill />}
                                backContent={<RecipeIngredientsCard recipeId={recipe.recipeId} recipe={typedRecipesDb[recipe.recipeId]} fill />}
                                recipeUrl={recipe.recipeUrl}
                                onClick={() => navigate(`/recipes/detail/${recipe.recipeId || recipe.id}`)}
                                onAddToPlanning={isPlannable(typedRecipesDb[recipe.recipeId || recipe.id]) ? () => navigate(`/planning?addRecipe=${recipe.recipeId || recipe.id}`) : undefined}
                            />
                        </LazyRender>
                    ))}
                </div>
            )}
        </div>
    );
};
