import { useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { MacroFilterModal } from './MacroFilterModal';

export interface MacroFilterButtonProps {
    activeFilterIds: string[];
    onApply: (ids: string[]) => void;
}

export const MacroFilterButton = ({ activeFilterIds, onApply }: MacroFilterButtonProps) => {
    const [open, setOpen] = useState(false);
    const active = activeFilterIds.length > 0;

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className={[
                    'flex items-center gap-1.5 px-3 py-2.5 rounded-2xl shadow-sm border font-bold text-sm transition-colors shrink-0',
                    active
                        ? 'bg-orange-500 border-orange-400 text-white hover:bg-orange-600'
                        : 'bg-white dark:bg-slate-100 border-slate-200 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-200',
                ].join(' ')}
            >
                <SlidersHorizontal size={16} />
            </button>

            {open && (
                <MacroFilterModal
                    activeFilterIds={activeFilterIds}
                    onSubmit={(ids) => { onApply(ids); setOpen(false); }}
                    onClose={() => setOpen(false)}
                />
            )}
        </>
    );
};
