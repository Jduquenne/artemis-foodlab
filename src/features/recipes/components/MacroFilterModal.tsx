import { useState } from 'react';
import { X, Check } from 'lucide-react';
import { PREDEFINED_FILTERS } from '../../../core/domain/predefinedFilters';

export interface MacroFilterModalProps {
    activeFilterIds: string[];
    onSubmit: (ids: string[]) => void;
    onClose: () => void;
}

export const MacroFilterModal = ({ activeFilterIds, onSubmit, onClose }: MacroFilterModalProps) => {
    const [draft, setDraft] = useState<string[]>(activeFilterIds);

    const toggle = (id: string) => {
        setDraft(prev =>
            prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
        );
    };

    return (
        <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="w-full max-w-sm bg-white dark:bg-slate-100 rounded-2xl shadow-2xl flex flex-col overflow-hidden">

                <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-slate-100">
                    <p className="text-xs font-black text-orange-600 uppercase tracking-widest">
                        Filtres nutritionnels
                    </p>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-200 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="px-5 py-4 space-y-2">
                    {PREDEFINED_FILTERS.map((filter) => {
                        const active = draft.includes(filter.id);
                        return (
                            <button
                                key={filter.id}
                                onClick={() => toggle(filter.id)}
                                className={[
                                    'w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-semibold transition-colors text-left',
                                    active
                                        ? 'bg-orange-50 border-orange-300 text-orange-700 dark:bg-orange-900/30 dark:border-orange-700'
                                        : 'bg-slate-50 dark:bg-slate-200 border-slate-200 text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-300',
                                ].join(' ')}
                            >
                                <span>{filter.label}</span>
                                {active && <Check className="w-4 h-4 text-orange-500 shrink-0" />}
                            </button>
                        );
                    })}
                </div>

                <div className="flex items-center justify-end px-5 pb-5 pt-2 border-t border-slate-100 gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-200 transition-colors"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={() => onSubmit(draft)}
                        className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-bold bg-orange-500 hover:bg-orange-600 text-white transition-colors"
                    >
                        <Check className="w-4 h-4" />
                        Appliquer
                    </button>
                </div>
            </div>
        </div>
    );
};
