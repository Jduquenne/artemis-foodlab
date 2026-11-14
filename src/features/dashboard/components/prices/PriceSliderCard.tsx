import { useState } from 'react';
import { Check, ChevronLeft } from 'lucide-react';
import { Food } from '../../../../core/domain/ingredient';
import { FoodPrice } from '../../../../core/domain/price';
import { RecipeDetails } from '../../../../core/domain/recipe';
import { formatEuro } from '../../../../core/logic/price/priceLogic';
import { isLiquidFood } from '../../../../core/logic/price/priceQueueLogic';
import { formatBagDate } from '../../../../core/utils/dateUtils';
import { usePendingKey } from '../../../../shared/hooks/usePendingKey';
import { DecimalInput } from '../../../../shared/components/ui/DecimalInput';
import { FoodPhotoCard } from '../../../../shared/components/ui/FoodPhotoCard';

export interface PriceSliderCardProps {
    food: Food;
    photoRecipe: RecipeDetails | undefined;
    price: FoodPrice | undefined;
    onSave: (pricePerKg: number) => void;
    onSkip: () => void;
    onPrevious: (() => void) | null;
}

export const PriceSliderCard = ({ food, photoRecipe, price, onSave, onSkip, onPrevious }: PriceSliderCardProps) => {
    const [value, setValue] = useState<number | null>(price?.pricePerKg ?? null);
    const pending = usePendingKey(`price-record:${food.id}`);
    const liquid = isLiquidFood(food);
    const perUnit = liquid ? '€/l' : '€/kg';
    const showsUnitWeight = !!food.unitWeight && food.unit !== 'g' && food.unit !== 'ml';
    const invalid = value === null || value <= 0;

    const confirm = () => {
        if (pending || value === null || value <= 0) return;
        if (value === price?.pricePerKg) onSkip();
        else onSave(value);
    };

    return (
        <div className="flex-1 min-h-0 flex flex-col gap-3">
            <div className="flex-1 min-h-0 flex items-center justify-center">
                {photoRecipe ? (
                    <div className="relative h-full max-h-[38dvh] aspect-[10/11] max-w-full rounded-2xl overflow-hidden shadow-md">
                        <FoodPhotoCard recipe={photoRecipe} fill />
                    </div>
                ) : (
                    <div className="h-full max-h-[30dvh] aspect-square max-w-full rounded-2xl bg-muted grid place-items-center text-6xl font-black text-slate-300">
                        {food.name.charAt(0).toUpperCase()}
                    </div>
                )}
            </div>
            <div className="shrink-0 text-center">
                <h3 className="text-xl font-black text-slate-900 leading-tight">{food.name}</h3>
                <p className="text-sm text-slate-500 mt-0.5">
                    {food.category}
                    {showsUnitWeight && ` · 1 ${food.unit} ≈ ${food.unitWeight} g`}
                    {liquid && ' · liquide'}
                </p>
                <p className={`text-xs mt-1 ${price ? 'text-slate-400' : 'text-amber-600 font-semibold'}`}>
                    {price
                        ? `Dernier prix : ${formatEuro(price.pricePerKg)}/${liquid ? 'l' : 'kg'} · ${formatBagDate(price.recordedAt)}`
                        : 'Pas encore de prix'}
                </p>
            </div>
            <label className="shrink-0 flex items-center justify-between gap-3">
                <span className="text-[15px] font-semibold text-slate-900">{liquid ? 'Prix au litre' : 'Prix au kilo'}</span>
                <span className="flex items-center w-44 rounded-xl border-2 border-slate-200 bg-subtle focus-within:border-orange-500 overflow-hidden">
                    <DecimalInput
                        value={value}
                        onValueChange={setValue}
                        onKeyDown={(e) => { if (e.key === 'Enter') confirm(); }}
                        placeholder="0,00"
                        autoFocus
                        aria-label={liquid ? 'Prix au litre' : 'Prix au kilo'}
                        className="flex-1 min-w-0 bg-transparent text-right text-2xl font-bold tabular-nums py-2 pl-2.5 pr-1.5 outline-none text-slate-900"
                    />
                    <span className="pr-2.5 text-sm text-slate-400">{perUnit}</span>
                </span>
            </label>
            <div className="shrink-0 grid grid-cols-[auto_1fr_1.4fr] gap-2">
                <button
                    type="button"
                    onClick={onPrevious ?? undefined}
                    disabled={!onPrevious || pending}
                    aria-label="Aliment précédent"
                    className="px-3 py-3 rounded-2xl border border-slate-200 bg-surface text-slate-600 disabled:opacity-30"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                    type="button"
                    onClick={onSkip}
                    disabled={pending}
                    className="py-3 rounded-2xl border border-slate-200 bg-surface text-slate-700 font-bold disabled:opacity-50"
                >
                    Passer
                </button>
                <button
                    type="button"
                    onClick={confirm}
                    disabled={pending || invalid}
                    className={`flex items-center justify-center gap-1.5 py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold transition-colors disabled:opacity-50 ${pending ? 'animate-pulse' : ''}`}
                >
                    <Check className="w-5 h-5" />
                    OK
                </button>
            </div>
        </div>
    );
};
