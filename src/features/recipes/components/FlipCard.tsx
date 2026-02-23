import { useState, useRef } from 'react';

interface FlipCardProps {
    name: string;
    frontImage: string;
    backImage?: string;
    recipeUrl?: string;
    onClick: () => void;
}

export const FlipCard = ({ frontImage, backImage, recipeUrl, onClick }: FlipCardProps) => {
    const [isFlipped, setIsFlipped] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isLongPress = useRef(false);
    const hasRecipe = !!recipeUrl;

    const handleMouseEnter = () => {
        if (backImage) {
            timerRef.current = setTimeout(() => {
                setIsFlipped(true);
            }, 500);
        }
    };

    const handleMouseLeave = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
        setIsFlipped(false);
    };

    const handleTouchStart = () => {
        isLongPress.current = false;
        timerRef.current = setTimeout(() => {
            setIsFlipped(prev => !prev);
            isLongPress.current = true;
            if (window.navigator.vibrate) window.navigator.vibrate(50);
        }, 500);
    };

    const handleTouchEnd = () => {
        if (timerRef.current) clearTimeout(timerRef.current);

        if (!isLongPress.current && !isFlipped) {
            if (hasRecipe) onClick();
        }
    };

    const handleTouchMove = () => {
        if (timerRef.current) clearTimeout(timerRef.current);
    };

    return (
        <div
            className="group relative w-full h-full cursor-pointer perspective-1000"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onClick={() => {
                if (!('ontouchstart' in window) && hasRecipe) onClick();
            }}
            onContextMenu={(e) => e.preventDefault()}
        >
            {/* Container 3D qui tourne */}
            <div
                className={`relative w-full h-full transition-all duration-700 preserve-3d shadow-xl rounded-2xl ${isFlipped ? 'rotate-y-180' : ''}`}
            >
                {/* FACE AVANT */}
                <div className="absolute inset-0 w-full h-full backface-hidden z-20 bg-white dark:bg-slate-100 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                    <img src={frontImage} className="w-full h-full object-contain" />
                </div>

                {/* FACE ARRIÈRE (Ingrédients) */}
                <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 z-10 bg-orange-50 dark:bg-orange-950/40 rounded-xl overflow-hidden border-2 border-orange-200 dark:border-orange-800">
                    {backImage ? (
                        <img src={backImage} alt="Ingrédients" className="w-full h-full object-contain p-2" />
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
