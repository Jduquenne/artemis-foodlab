import { useState, useCallback, useMemo } from "react";
import { Sparkles, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { typedRecipesDb } from "../../core/typed-db/typedRecipesDb";
import { getNewsGroups } from "../../core/logic/news/newsLogic";
import { NewsRecipeCard } from "./components/NewsRecipeCard";
import { formatNewsDate } from "../../shared/utils/dateUtils";

export interface NewsModalProps {
  onClose: () => void;
}

export const NewsModal = ({ onClose }: NewsModalProps) => {
  const [isClosing, setIsClosing] = useState(false);
  const navigate = useNavigate();
  const groups = useMemo(() => getNewsGroups(typedRecipesDb), []);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(onClose, 300);
  }, [onClose]);

  const handleRecipeClick = useCallback(
    (code: string) => {
      setIsClosing(true);
      setTimeout(() => {
        onClose();
        navigate(`/recipes/detail/${code}`);
      }, 300);
    },
    [onClose, navigate]
  );

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        className={`bg-white dark:bg-slate-100 w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[85vh] ${
          isClosing ? "modal-exit sm:modal-center-exit" : "modal-enter sm:modal-center-enter"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-orange-500" />
            <h2 className="text-base font-semibold text-slate-800">Nouveautés</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-3 py-3">
          {groups.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">
              Aucune nouveauté pour l'instant.
            </p>
          ) : (
            groups.map((group) => (
              <div key={group.date} className="mb-4 last:mb-0">
                <div className="px-3 mb-1">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    {formatNewsDate(group.date)}
                  </p>
                </div>
                <div>
                  {group.recipes.map((recipe) => (
                    <NewsRecipeCard
                      key={recipe.code}
                      recipe={recipe}
                      onClick={() => handleRecipeClick(recipe.code)}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
