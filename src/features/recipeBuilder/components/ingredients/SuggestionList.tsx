export interface Suggestion {
  id: string;
  label: string;
  hint: string;
}

export interface SuggestionListProps {
  suggestions: Suggestion[];
  onPick: (id: string) => void;
}

export const SuggestionList = ({ suggestions, onPick }: SuggestionListProps) => (
  <div className="absolute z-30 top-full left-0 right-0 mt-1 bg-surface border border-slate-200 rounded-xl shadow-lg overflow-hidden">
    {suggestions.map((suggestion) => (
      <button
        key={suggestion.id}
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => onPick(suggestion.id)}
        className="flex items-center justify-between w-full px-3 py-2 text-left hover:bg-subtle transition-colors border-b border-slate-100 last:border-0"
      >
        <span className="text-sm font-semibold text-slate-800">{suggestion.label}</span>
        <span className="text-xs text-slate-400 ml-2 shrink-0">{suggestion.hint}</span>
      </button>
    ))}
  </div>
);
