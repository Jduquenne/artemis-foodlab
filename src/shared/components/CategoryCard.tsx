interface CategoryCardProps {
    name: string;
    onClick: () => void;
}

export const CategoryCard = ({ name, onClick }: CategoryCardProps) => {
    return (
        <button
            onClick={onClick}
            className="group relative flex flex-col items-center justify-center 
             aspect-square
             border border-slate-200 rounded-2xl p-8 
             hover:border-orange-500 hover:shadow-lg 
             transition-all duration-300 bg-contain"
            style={{ backgroundImage: `url('/artemis-foodlab/categories/${name}.webp')` }}
        >
            {/* Overlay pour lisibilité */}
            <div className="absolute inset-0 bg-white/40 rounded-2xl group-hover:bg-white/80 transition-colors"></div>

            {/* Contenu */}
            <div className="relative z-10 flex flex-col items-center bg-white px-4 py-2 rounded-2xl">
                <span className="text-slate-900 font-bold text-xl">{name}</span>
            </div>
        </button>
    );
};