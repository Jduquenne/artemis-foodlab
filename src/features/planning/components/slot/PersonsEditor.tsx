import { useState, useRef, useEffect } from 'react';
import { Check, RotateCcw, X } from 'lucide-react';

interface PersonsEditorProps {
    initialValue: number;
    defaultPortion: number | undefined;
    onConfirm: (n: number) => void;
    onCancel: () => void;
}

export const PersonsEditor = ({ initialValue, defaultPortion, onConfirm, onCancel }: PersonsEditorProps) => {
    const [draft, setDraft] = useState(initialValue);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
    }, []);

    const confirm = () => onConfirm(Math.max(1, draft || 1));

    return (
        <div className="absolute inset-0 z-30 bg-white/97 dark:bg-slate-100/97 rounded-xl flex flex-col items-center justify-center gap-3 px-3">
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-500">Personnes ?</span>
            <input
                ref={inputRef}
                type="number"
                min="1"
                value={draft}
                onChange={(e) => setDraft(Number(e.target.value) || 0)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') confirm();
                    if (e.key === 'Escape') onCancel();
                }}
                className="w-16 text-center text-2xl font-black text-slate-900 bg-slate-100 dark:bg-slate-200 rounded-xl py-1.5 border-0 outline-none focus:ring-2 focus:ring-orange-400"
            />
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
                    onClick={() => setDraft(defaultPortion ?? 2)}
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
