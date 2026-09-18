import { Loader2 } from 'lucide-react';

export interface MoveDessertsPromptProps {
    dessertCount: number;
    pendingChoice: 'move' | 'keep' | null;
    onMove: () => void;
    onKeep: () => void;
    onCancel: () => void;
}

export const MoveDessertsPrompt = ({ dessertCount, pendingChoice, onMove, onKeep, onCancel }: MoveDessertsPromptProps) => {
    const pending = pendingChoice !== null;

    return (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => !pending && onCancel()}>
            <div className="bg-white dark:bg-slate-100 rounded-2xl shadow-2xl w-full max-w-sm p-5" onClick={(e) => e.stopPropagation()}>
                <p className="text-xs font-black text-orange-600 uppercase tracking-widest mb-1.5">Déplacer le repas</p>
                <p className="text-sm text-slate-600 mb-5">
                    Ce repas a {dessertCount} dessert{dessertCount > 1 ? 's' : ''}. Tu veux les déplacer avec lui, ou les laisser sur place ?
                </p>
                <div className="flex flex-col gap-2">
                    <button
                        onClick={onMove}
                        disabled={pending}
                        className="w-full py-2.5 rounded-xl bg-orange-500 text-white text-sm font-bold hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {pendingChoice === 'move' && <Loader2 className="w-4 h-4 animate-spin" />}
                        Déplacer aussi {dessertCount > 1 ? 'les desserts' : 'le dessert'}
                    </button>
                    <button
                        onClick={onKeep}
                        disabled={pending}
                        className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-200 text-slate-700 text-sm font-bold hover:bg-slate-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {pendingChoice === 'keep' && <Loader2 className="w-4 h-4 animate-spin" />}
                        Laisser sur place
                    </button>
                    <button
                        onClick={onCancel}
                        disabled={pending}
                        className="w-full py-2 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
                    >
                        Annuler le déplacement
                    </button>
                </div>
            </div>
        </div>
    );
};
