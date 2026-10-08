import { useNavigate } from 'react-router-dom';
import { ArrowLeft, SearchX } from 'lucide-react';

export const RecipeNotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col items-center justify-center gap-4 p-6 text-center modal-center-enter">
      <SearchX className="w-12 h-12 text-slate-300" />
      <div className="flex flex-col gap-1">
        <h1 className="text-lg font-black text-slate-800">Recette introuvable</h1>
        <p className="text-sm text-slate-500">Cette recette n'existe peut-être plus.</p>
      </div>
      <button
        type="button"
        onClick={() => navigate('/recipes', { replace: true })}
        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-bold hover:bg-orange-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour au catalogue
      </button>
    </div>
  );
};
