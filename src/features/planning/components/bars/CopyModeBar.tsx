import { Check, X } from 'lucide-react';

export interface CopyModeBarProps {
    recipeName: string;
    selectedCount: number;
    onConfirm: () => void;
    onCancel: () => void;
}

export const CopyModeBar = ({ recipeName, selectedCount, onConfirm, onCancel }: CopyModeBarProps) => (
    <div className="shrink-0 flex items-center justify-between gap-3 px-3 py-2 bg-violet-500 text-white rounded-xl">
        <div className="flex flex-col min-w-0">
            <span className="text-[9px] font-black uppercase tracking-widest opacity-70">Copier vers…</span>
            <span className="text-sm font-bold truncate">{recipeName}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
            {selectedCount > 0 && (
                <span className="text-xs font-bold bg-white/20 px-2 py-0.5 rounded-lg">
                    {selectedCount} jour{selectedCount > 1 ? 's' : ''}
                </span>
            )}
            <button
                disabled={selectedCount === 0}
                onClick={onConfirm}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-violet-600 rounded-lg font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-violet-50 transition-colors"
            >
                <Check size={14} />
                Coller
            </button>
            <button
                onClick={onCancel}
                className="p-1.5 hover:bg-violet-600 rounded-lg transition-colors"
            >
                <X size={16} />
            </button>
        </div>
    </div>
);
