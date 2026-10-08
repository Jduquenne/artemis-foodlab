import { RecipeAsset } from '../../../../core/domain/recipe';
import { AsyncImage } from '../../../../shared/components/ui/AsyncImage';

export interface MealPhotoProps {
    asset: RecipeAsset | undefined;
    name: string;
    showName?: boolean;
    compact?: boolean;
    eager?: boolean;
}

export const MealPhoto = ({ asset, name, showName = true, compact = false, eager = false }: MealPhotoProps) => (
    <>
        <AsyncImage asset={asset} alt={name} className="object-cover" fill eager={eager} />
        <div className="absolute inset-0 bg-white/40 dark:bg-black/50 transition-colors" />
        {showName && (
            <div className={`absolute inset-0 flex items-center justify-center ${compact ? 'p-1.5' : 'p-2'}`}>
                <span className={`bg-white/90 dark:bg-black/75 text-slate-900 font-bold py-0.5 leading-tight line-clamp-4 text-center ${compact ? 'text-[13px] px-1 rounded' : 'text-[14px] px-1.5 rounded-md'}`}>
                    {name}
                </span>
            </div>
        )}
    </>
);
