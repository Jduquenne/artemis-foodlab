import { useState } from "react";
import { Plus, X } from "lucide-react";
import { toggleInList } from "../../../../core/utils/collectionUtils";

export interface KeywordsFieldProps {
  keywords: string[];
  disabled: boolean;
  onChange: (keywords: string[]) => void;
}

export const KeywordsField = ({ keywords, disabled, onChange }: KeywordsFieldProps) => {
  const [draft, setDraft] = useState("");
  const word = draft.trim();
  const add = () => {
    if (!word || keywords.some((keyword) => keyword.toLowerCase() === word.toLowerCase())) return;
    onChange([...keywords, word]);
    setDraft("");
  };

  return (
    <div className="flex flex-col gap-1.5">
      {keywords.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {keywords.map((keyword, index) => (
            <span key={keyword} className="flex items-center gap-1.5">
              {index > 0 && <span className="text-[11px] font-semibold text-slate-400">ou</span>}
              <span className="flex items-center gap-1 pl-2.5 pr-1 py-1 rounded-lg bg-muted text-xs font-semibold text-slate-700">
                {keyword}
                <button
                  type="button"
                  disabled={disabled}
                  aria-label={`Retirer ${keyword}`}
                  onClick={() => onChange(toggleInList(keywords, keyword))}
                  className="p-0.5 rounded hover:bg-black/5 disabled:opacity-50"
                >
                  <X size={12} />
                </button>
              </span>
            </span>
          ))}
        </div>
      )}
      <div className="flex gap-1.5">
        <input
          value={draft}
          disabled={disabled}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder="Ex : soupe, velouté…"
          aria-label="Mot du nom de recette"
          className="flex-1 min-w-0 px-3 py-2 bg-surface border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 disabled:opacity-50"
        />
        <button
          type="button"
          onClick={add}
          disabled={disabled || !word}
          aria-label="Ajouter le mot"
          className="px-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-muted disabled:opacity-40"
        >
          <Plus size={14} />
        </button>
      </div>
      <p className="text-[11px] text-slate-400">Le nom de la recette contient un de ces mots (sans tenir compte des accents ni des majuscules). Les nouvelles recettes suivent automatiquement.</p>
    </div>
  );
};
