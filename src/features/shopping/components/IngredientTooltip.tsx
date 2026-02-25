import { useState, useRef, useEffect } from 'react';
import { Info } from 'lucide-react';
import { IngredientSource } from '../../../core/utils/shoppingLogic';

const DAY_LABELS: Record<string, string> = {
    monday: 'Lundi',
    tuesday: 'Mardi',
    wednesday: 'Mercredi',
    thursday: 'Jeudi',
    friday: 'Vendredi',
    saturday: 'Samedi',
    sunday: 'Dimanche',
};

const SLOT_LABELS: Record<string, string> = {
    breakfast: 'Petit déj.',
    lunch: 'Déjeuner',
    snack: 'Goûter',
    dinner: 'Dîner',
};

export interface IngredientTooltipProps {
    sources: IngredientSource[];
}

export const IngredientTooltip = ({ sources }: IngredientTooltipProps) => {
    const [open, setOpen] = useState(false);
    const [pos, setPos] = useState({ top: 0, right: 0 });
    const buttonRef = useRef<HTMLButtonElement>(null);

    const computePos = () => {
        if (!buttonRef.current) return;
        const rect = buttonRef.current.getBoundingClientRect();
        setPos({
            right: window.innerWidth - rect.left + 8,
            top: rect.top,
        });
    };

    useEffect(() => {
        if (!open) return;
        const close = () => setOpen(false);
        window.addEventListener('scroll', close, true);
        return () => window.removeEventListener('scroll', close, true);
    }, [open]);

    return (
        <div
            className="shrink-0"
            onMouseEnter={() => { computePos(); setOpen(true); }}
            onMouseLeave={() => setOpen(false)}
        >
            <button
                ref={buttonRef}
                onClick={() => { computePos(); setOpen(prev => !prev); }}
                className="flex items-center justify-center w-6 h-6 rounded-full text-slate-300 hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/30 transition-colors"
                tabIndex={-1}
            >
                <Info className="w-3.5 h-3.5" />
            </button>

            {open && (
                <div
                    style={{
                        position: 'fixed',
                        right: pos.right,
                        top: pos.top,
                    }}
                    className="w-60 bg-white dark:bg-slate-200 border border-slate-200 rounded-xl shadow-xl z-50 p-3"
                >
                    <p className="text-xs font-black text-orange-600 uppercase tracking-widest mb-2.5">
                        Utilisé dans
                    </p>
                    <div className="space-y-2.5">
                        {sources.map((src, i) => (
                            <div key={i} className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0 mt-1.5" />
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-slate-800 leading-tight">
                                        {src.recipeName}
                                    </p>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        {DAY_LABELS[src.day] ?? src.day}
                                        <span className="mx-1 text-slate-300">·</span>
                                        {SLOT_LABELS[src.slot] ?? src.slot}
                                        <span className="mx-1 text-slate-300">·</span>
                                        <span className="text-orange-500 font-medium">
                                            {src.quantity === 0 ? '—' : `${parseFloat(src.quantity.toFixed(2))}\u00a0${src.unit}`}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
