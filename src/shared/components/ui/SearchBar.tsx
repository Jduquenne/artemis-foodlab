import { Search, X } from 'lucide-react';

interface SearchBarProps {
    value: string;
    onChange: (val: string) => void;
    onClear: () => void;
}

export const SearchBar = ({ value, onChange, onClear }: SearchBarProps) => {
    return (
        <div className="relative w-full max-w-md mx-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="block w-full pl-10 pr-10 py-3 border border-slate-200 rounded-2xl leading-5 bg-white dark:bg-slate-100 placeholder-slate-400 focus:outline-none focus:placeholder-slate-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 sm:text-sm transition-all shadow-sm"
                placeholder="Recette ou ingrédient..."
            />
            {value && (
                <button
                    onClick={onClear}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-slate-400 hover:text-orange-600"
                >
                    <X className="h-5 w-5" />
                </button>
            )}
        </div>
    );
};
