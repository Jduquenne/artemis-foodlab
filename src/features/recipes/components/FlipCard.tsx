import { useState, useRef } from 'react';
import { Layers } from 'lucide-react';
import { isScrollingActive } from '../../../shared/utils/scrollGuard';
import { IS_TOUCH } from '../../../shared/utils/deviceUtils';

interface FlipCardProps {
    name: string;
    frontImage: string;
    backImage?: string;
    recipeUrl?: string;
    onClick: () => void;
}

export const FlipCard = ({ frontImage, backImage, recipeUrl, onClick }: FlipCardProps) => {
    const [isFlipped, setIsFlipped] = useState(false);
    const [showBack, setShowBack] = useState(false);
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
                className="relative w-full h-full cursor-pointer rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-white dark:bg-slate-100"
                onClick={handleCardClick}
                onContextMenu={(e) => e.preventDefault()}
            >
                <img src={frontImage} className={`w-full h-full object-contain transition-opacity duration-200 ${showBack ? 'opacity-0' : 'opacity-100'}`} />

                {showBack && (
                    <div className="absolute inset-0 bg-orange-50 dark:bg-orange-950/40 border-2 border-orange-200 dark:border-orange-800 rounded-2xl">
                        {backImage ? (
                            <img src={backImage} alt="Ingrédients" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-[10px] text-orange-400 font-bold p-4 text-center gap-2">
                                <span className="text-2xl">🤷‍♂️</span>
                                Pas d'ingrédients
                            </div>
                        )}
                    </div>
                )}

                {backImage && (
                    <button
                        onClick={(e) => { e.stopPropagation(); setShowBack(prev => !prev); }}
                        className={`absolute bottom-1.5 left-1.5 p-1.5 rounded-lg shadow border transition-colors ${showBack ? 'bg-orange-100 border-orange-300 text-orange-600' : 'bg-white/90 dark:bg-slate-200/90 border-slate-200 text-slate-400'}`}
                    >
                        <Layers size={13} />
                    </button>
                )}
            </div>
        );
    }

    const handleMouseEnter = () => {
        if (backImage) {
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
                    <img src={frontImage} className="w-full h-full object-contain" />
                </div>
                <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 z-10 bg-orange-50 dark:bg-orange-950/40 rounded-xl overflow-hidden border-2 border-orange-200 dark:border-orange-800">
                    {backImage ? (
                        <img src={backImage} alt="Ingrédients" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-[10px] text-orange-400 font-bold p-4 text-center gap-2">
                            <span className="text-2xl">🤷‍♂️</span>
                            Pas d'ingrédients
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
