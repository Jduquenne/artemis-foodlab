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

    // 1. On récupère TOUS les éléments de la catégorie (photos, ingredients, recipes)
    const rawItems = useLiveQuery(
        () => db.recipes.where('categoryId').equals(categoryId || '').toArray(),
        [categoryId]
    );

    // 2. On regroupe par recipeId pour avoir un objet { photo: URL, ingredients: URL, ... }
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
            if (item.type === 'recipes') entry.recipeUrl = item.url; // Ajout ici
        });
        return Array.from(map.values()).filter(r => r.photoUrl);
    }, [rawItems]);

    return (
        <div className="space-y-6 pb-20">
            <button
                onClick={() => navigate('/recipes')}
                className="flex items-center text-slate-500 hover:text-orange-600 transition-colors gap-2"
            >
                <ArrowLeft className="w-4 h-4" /> Retour aux catégories
            </button>

            <h1 className="text-4xl font-black text-slate-900">
                {/* Si on trouve la catégorie, on affiche le nom, sinon on affiche l'ID par défaut */}
                {categoryInfo ? categoryInfo.name : categoryId}
            </h1>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-6">
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
    );
};