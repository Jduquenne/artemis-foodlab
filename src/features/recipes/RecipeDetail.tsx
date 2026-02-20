import { useParams, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../core/services/db';
import { useState } from 'react';
import { ArrowLeft, Maximize2, Minimize2, Loader2 } from 'lucide-react';

export const RecipeDetail = () => {
    const { recipeId } = useParams();
    const navigate = useNavigate();
    const [isFullscreen, setIsFullscreen] = useState(false);

    // On récupère l'image de type 'recipes'
    const recipeData = useLiveQuery(
        () => db.recipes.where({ recipeId: recipeId, type: 'recipes' }).first(),
        [recipeId]
    );

    if (!recipeData) {
        return (
            <div className="flex flex-col items-center justify-center h-screen gap-4 bg-slate-50">
                <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
                <p className="text-slate-500 font-medium text-lg">Recherche de la recette...</p>
            </div>
        );
    }

    return (
        // Le conteneur principal s'adapte si on est en plein écran pour éviter le scroll double
        <div className={`relative bg-slate-50 ${isFullscreen ? 'h-screen overflow-hidden' : 'min-h-screen'}`}>

            {/* --- 1. BARRE DU HAUT (Reste comme tu l'aimais) --- */}
            {/* On la cache en mode plein écran pour gagner de la place */}
            {!isFullscreen && (
                <div className="sticky top-0 z-40 flex items-center px-4 py-4 bg-slate-50/80 backdrop-blur-md border-b border-slate-200">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-slate-700 font-bold hover:text-orange-600 transition-colors"
                    >
                        <ArrowLeft size={24} />
                        <span className="text-lg">Retour</span>
                    </button>
                    {/* On peut ajouter le nom de la recette ici si on veut */}
                    <h1 className="ml-4 text-xl font-black text-slate-900 truncate flex-1 text-center pr-8">
                        {recipeData.name}
                    </h1>
                </div>
            )}

            {/* --- 2. CONTENEUR DE L'IMAGE (La magie opère ici) --- */}
            <div className={`transition-all duration-300 ease-in-out 
                    ${isFullscreen ? 'fixed inset-0 z-50 bg-white overflow-auto p-0' : 'relative flex justify-center p-4 md:p-8'}`}
            >
                <img src={recipeData.url} alt={`Recette ${recipeData.name}`} className={`transition-all duration-300
                    ${isFullscreen ? 'w-full h-auto shadow-none rounded-none' : 'w-full max-w-6xl h-auto object-contain shadow-2xl rounded-2xl border border-slate-100'}`}
                />
            </div>

            {/* --- 3. BOUTON FLOTTANT PLEIN ÉCRAN (FAB) --- */}
            <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className={`fixed z-60 bottom-6 right-6 flex items-center justify-center w-14 h-14 bg-orange-500 text-white rounded-full shadow-lg hover:bg-orange-600 hover:scale-110 hover:shadow-xltransition-all duration-200 ease-outfocus:outline-none focus:ring-4 focus:ring-orange-300`}
                aria-label={isFullscreen ? "Quitter le plein écran" : "Mettre en plein écran"}
            >
                {isFullscreen ? <Minimize2 size={28} /> : <Maximize2 size={28} />}
            </button>

        </div>
    );
};