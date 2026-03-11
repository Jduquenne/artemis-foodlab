import { useState, useRef, useEffect } from 'react';
import { Check, RotateCcw, X, Users } from 'lucide-react';

interface RecipeMetaEditorProps {
    initialPersons: number;
    defaultPersons: number;
    initialGrams: number;
    defaultGrams: number;
    isDish?: boolean;
    onConfirm: (persons: number, grams: number) => void;
    onCancel: () => void;
}

export const RecipeMetaEditor = ({
    initialPersons,
    defaultPersons,
    initialGrams,
    defaultGrams,
    isDish,
    onConfirm,
    onCancel,
}: RecipeMetaEditorProps) => {
    const [draftPersons, setDraftPersons] = useState(initialPersons);
    const [draftGrams, setDraftGrams] = useState(initialGrams);
    const firstInputRef = useRef<HTMLInputElement>(null);
    const showGrams = !isDish && defaultGrams > 0;

    useEffect(() => {
        firstInputRef.current?.focus();
        firstInputRef.current?.select();
    }, []);

    const confirm = () => onConfirm(
        Math.max(1, draftPersons || 1),
        showGrams ? Math.max(1, draftGrams || 1) : initialGrams,
    );

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') confirm();
        if (e.key === 'Escape') onCancel();
    };

    return (
        <div className="absolute inset-0 z-30 bg-white/97 dark:bg-slate-100/97 rounded-xl flex flex-col items-center justify-center gap-3 px-3">
            <div className={`flex gap-4 ${showGrams ? '' : 'justify-center'}`}>
                <div className="flex flex-col items-center gap-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-0.5">
                        <Users size={9} /> {isDish ? 'Portions' : 'Pers.'}
                    </span>
                    <input
                        ref={firstInputRef}
                        type="number"
                        min="1"
                        value={draftPersons}
                        onChange={(e) => setDraftPersons(Number(e.target.value) || 0)}
                        onKeyDown={handleKeyDown}
                        className="w-14 text-center text-xl font-black text-slate-900 bg-slate-100 dark:bg-slate-200 rounded-xl py-1.5 border-0 outline-none focus:ring-2 focus:ring-orange-400"
                    />
                </div>
                {showGrams && (
                    <div className="flex flex-col items-center gap-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Grammes</span>
                        <div className="flex items-baseline gap-0.5">
                            <input
                                type="number"
                                min="1"
                                value={draftGrams}
                                onChange={(e) => setDraftGrams(Number(e.target.value) || 0)}
                                onKeyDown={handleKeyDown}
                                className="w-14 text-center text-xl font-black text-slate-900 bg-slate-100 dark:bg-slate-200 rounded-xl py-1.5 border-0 outline-none focus:ring-2 focus:ring-orange-400"
                            />
                            <span className="text-xs font-bold text-slate-400">g</span>
                        </div>
                    </div>
                )}
            </div>
            <div className="flex gap-2">
                <button
                    aria-label="Confirmer"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={confirm}
                    className="p-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors"
                >
                    <Check size={15} />
                </button>
                <button
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={() => { setDraftPersons(defaultPersons); setDraftGrams(defaultGrams); }}
                    title="Remettre par défaut"
                    className="p-2 bg-slate-200 dark:bg-slate-300 text-slate-500 rounded-xl hover:bg-slate-300 transition-colors"
                >
                    <RotateCcw size={15} />
                </button>
                <button
                    aria-label="Annuler"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={onCancel}
                    className="p-2 bg-slate-200 dark:bg-slate-300 text-slate-600 rounded-xl hover:bg-slate-300 transition-colors"
                >
                    <X size={15} />
                </button>
            </div>
        </div>
    );
};
