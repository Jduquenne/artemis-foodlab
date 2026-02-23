interface CategoryCardProps {
    name: string;
    onClick: () => void;
}

export const CategoryCard = ({ name, onClick }: CategoryCardProps) => {
    return (
        <button
            onClick={onClick}
            className="group relative flex flex-col items-center justify-center
             w-full h-full overflow-hidden
             border border-slate-200 rounded-2xl
             hover:border-orange-500 hover:shadow-lg
             transition-all duration-300 bg-cover bg-center"
            style={{ backgroundImage: `url('/artemis-foodlab/categories/${name}.webp')` }}
        >
            <div className="absolute inset-0 bg-white/40 rounded-2xl group-hover:bg-white/80 transition-colors" />
            <div className="relative z-10 flex flex-col items-center bg-white/90 px-4 py-2 rounded-xl shadow-sm">
                <span className="text-slate-900 font-bold text-base lg:text-lg">{name}</span>
            </div>
        </button>
    );
};
