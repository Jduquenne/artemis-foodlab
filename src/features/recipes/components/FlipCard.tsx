import React, { useState, useRef } from 'react';
import { Layers, Plus } from 'lucide-react';
import { isScrollingActive } from '../../../shared/utils/scrollGuard';
import { IS_TOUCH } from '../../../shared/utils/deviceUtils';

export interface FlipCardProps {
    name: string;
    frontContent: React.ReactNode;
    backContent?: React.ReactNode;
    recipeUrl?: string;
    onClick: () => void;
    onAddToPlanning?: () => void;
}

export const FlipCard = ({ name, frontContent, backContent, recipeUrl, onClick, onAddToPlanning }: FlipCardProps) => {
    const [isFlipped, setIsFlipped] = useState(false);
    const [showBack, setShowBack] = useState(false);
    const [backMounted, setBackMounted] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const hasRecipe = !!recipeUrl;

    if (IS_TOUCH) {
        const handleCardClick = () => {
            if (isScrollingActive()) return;
            if (showBack) { setShowBack(false); return; }
            if (hasRecipe) onClick();
        };

        return (
            <div
                aria-label={name}
                className="relative w-full h-full cursor-pointer rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-white dark:bg-slate-100"
                onClick={handleCardClick}
                onContextMenu={(e) => { e.preventDefault(); setBackMounted(true); }}
            >
                <div className={`w-full h-full transition-opacity duration-200 ${showBack ? 'opacity-0' : 'opacity-100'}`}>
                    {frontContent}
                </div>

                {showBack && (
                    <div className="absolute inset-0 bg-orange-50 dark:bg-orange-950/40 border-2 border-orange-200 dark:border-orange-800 rounded-2xl overflow-hidden">
                        {backMounted && backContent ? backContent : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-[10px] text-orange-400 font-bold p-4 text-center gap-2">
                                <span className="text-2xl">🤷‍♂️</span>
                                Pas d'ingrédients
                            </div>
                        )}
                    </div>
                )}

                {backContent && (
                    <button
                        onClick={(e) => { e.stopPropagation(); setBackMounted(true); setShowBack(prev => !prev); }}
                        className={`absolute bottom-1.5 left-1.5 p-1.5 rounded-lg shadow border transition-colors ${showBack ? 'bg-orange-100 border-orange-300 text-orange-600' : 'bg-white/90 dark:bg-slate-200/90 border-slate-200 text-slate-400'}`}
                    >
                        <Layers size={13} />
                    </button>
                )}
                {onAddToPlanning && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onAddToPlanning(); }}
                        className="absolute bottom-1.5 right-1.5 p-1.5 rounded-lg shadow border bg-orange-500 border-orange-400 text-white"
                    >
                        <Plus size={13} />
                    </button>
                )}
            </div>
        );
    }

    const handleMouseEnter = () => {
        if (backContent) {
            setBackMounted(true);
            timerRef.current = setTimeout(() => setIsFlipped(true), 500);
        }
    };

    const handleMouseLeave = () => {
        if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
        setIsFlipped(false);
    };

    return (
        <div
            className="group relative w-full h-full cursor-pointer perspective-1000"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={() => { if (hasRecipe) onClick(); }}
        >
            <div className={`relative w-full h-full transition-all duration-700 preserve-3d shadow-xl rounded-2xl ${isFlipped ? 'rotate-y-180' : ''}`}>
                <div className="absolute inset-0 w-full h-full backface-hidden z-20 bg-white dark:bg-slate-100 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                    {frontContent}
                </div>
                <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 z-10 bg-orange-50 dark:bg-orange-950/40 rounded-xl overflow-hidden border-2 border-orange-200 dark:border-orange-800">
                    {backMounted && backContent ? backContent : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-[10px] text-orange-400 font-bold p-4 text-center gap-2">
                            <span className="text-2xl">🤷‍♂️</span>
                            Pas d'ingrédients
                        </div>
                    )}
                </div>
            </div>
            {onAddToPlanning && (
                <button
                    onClick={(e) => { e.stopPropagation(); onAddToPlanning(); }}
                    className="absolute top-1.5 right-1.5 z-30 p-1.5 rounded-lg shadow border bg-orange-500 border-orange-400 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <Plus size={13} />
                </button>
            )}
        </div>
    );
};
