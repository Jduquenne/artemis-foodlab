import { ReactNode } from 'react';
import { X } from 'lucide-react';

export interface ShoppingSheetProps {
    title: string;
    subtitle?: ReactNode;
    onClose: () => void;
    children: ReactNode;
}

export const ShoppingSheet = ({ title, subtitle, onClose, children }: ShoppingSheetProps) => (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center sm:p-4">
        <div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="bg-surface-raised w-full sm:max-w-sm max-h-[88dvh] overflow-y-auto rounded-t-3xl sm:rounded-2xl shadow-2xl px-5 pt-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))] sm:pb-5 flex flex-col gap-4 modal-enter sm:modal-center-enter"
        >
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <h2 className="text-lg font-black text-slate-900 leading-tight">{title}</h2>
                    {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Fermer"
                    className="p-1.5 -mr-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-strong transition-colors shrink-0"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>
            {children}
        </div>
    </div>
);
