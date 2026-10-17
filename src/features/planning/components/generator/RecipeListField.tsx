import { X } from "lucide-react";
import { useRecipesSnapshot } from "../../../../shared/hooks/useCatalogueSnapshot";
import { RecipeSearchInput } from "./RecipeSearchInput";

export interface RecipeListFieldProps {
  codes: string[];
  tone: "favorite" | "banned";
  disabled: boolean;
  onToggle: (code: string) => void;
}

export const RecipeListField = ({ codes, tone, disabled, onToggle }: RecipeListFieldProps) => {
  const recipes = useRecipesSnapshot();
  const chipClass = tone === "favorite"
    ? "bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400"
    : "bg-red-50 dark:bg-red-900/20 text-red-600";

  return (
    <div className="flex flex-col gap-2">
      {codes.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {codes.map((code) => {
            const name = recipes[code]?.name ?? code;
            return (
              <span key={code} className={`flex items-center gap-1 pl-2.5 pr-1 py-1 rounded-lg text-xs font-semibold ${chipClass}`}>
                {name}
                <button
                  type="button"
                  disabled={disabled}
                  aria-label={`Retirer ${name}`}
                  onClick={() => onToggle(code)}
                  className="p-0.5 rounded hover:bg-black/5 disabled:opacity-50"
                >
                  <X size={12} />
                </button>
              </span>
            );
          })}
        </div>
      )}
      <RecipeSearchInput disabled={disabled} onPick={onToggle} />
    </div>
  );
};
