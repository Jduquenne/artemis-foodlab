import { useParams, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../core/services/db';
import { FlipCard } from './components/FlipCard';
import { ArrowLeft } from 'lucide-react';
import { useMemo } from 'react';
import { CATEGORIES } from '../../core/domain/categories';

export const CategoryDetail = () => {
    const { categoryId } = useParams();
    const navigate = useNavigate();

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

    return (
        <div className="h-full flex flex-col gap-4 overflow-hidden">

            <div className="flex items-baseline gap-3 shrink-0">
                <button
                    onClick={() => navigate('/recipes')}
                    className="p-2 rounded-xl text-slate-400 hover:text-orange-600 hover:bg-orange-50 transition-colors shrink-0 self-center"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-3xl font-black text-slate-900 truncate">
                    {categoryInfo ? categoryInfo.name : categoryId}
                </h1>
                <span className="shrink-0 text-sm font-bold text-slate-400">{recipes.length} recettes</span>
            </div>

            <div className="flex-1 justify-center min-h-0 overflow-y-auto">
                <div
                    className="grid gap-3 pb-2"
                    style={{ gridTemplateColumns: 'repeat(auto-fill, 5cm)', gridAutoRows: '5.5cm', justifyContent: 'center' }}
                >
                    {recipes.map(recipe => (
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
