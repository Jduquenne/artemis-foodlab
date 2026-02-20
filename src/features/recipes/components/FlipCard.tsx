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
    const hasRecipe = !!recipeUrl; // Vérifie si la fiche existe

    const handleMouseEnter = () => {
        if (backImage) {
            console.log(frontImage);

            timerRef.current = setTimeout(() => {
                setIsFlipped(true);
            }, 500); // 0.5 secondes
        }
    };

    const handleMouseLeave = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
        setIsFlipped(false);
    };

    return (
        <div
            className="group relative w-full aspect-square cursor-pointer perspective-1000"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={() => hasRecipe && onClick()}
        >
            {/* Container 3D qui tourne */}
            <div
                className={`relative w-full h-full transition-all duration-700 preserve-3d shadow-xl rounded-2xl ${isFlipped ? 'rotate-y-180' : ''
                    }`}
            >

                {/* --- FACE AVANT --- */}
                <div className="absolute inset-0 w-full h-full backface-hidden rounded-2xl overflow-hidden bg-white">
                    <img
                        src={frontImage}
                        className="w-full h-full object-cover"
                        loading="lazy"
                    />
                </div>

                {/* --- FACE ARRIÈRE --- */}
                <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-2xl overflow-hidden bg-white border-2 border-orange-200">
                    {backImage ? (
                        // <div className="relative w-full h-full p-2 bg-orange-50">
                        <img
                            src={backImage}
                            alt="Ingrédients"
                            className="w-full h-full mix-blend-multiply"
                        />
                        // </div>
                    ) : (
                        <div className="flex items-center justify-center h-full text-orange-400 font-bold text-sm">
                            Pas d'ingrédients
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};