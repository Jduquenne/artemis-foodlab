import { RecipeCost } from '../../../../core/logic/price/recipeCostLogic';
import { formatEuro } from '../../../../core/logic/price/priceLogic';

export interface RecipeCostInfoProps {
  cost: RecipeCost;
  portions: number;
}

export const RecipeCostInfo = ({ cost, portions }: RecipeCostInfoProps) => {
  const missing = cost.total.missing.length;
  const partial = missing > 0;
  const total = formatEuro(cost.total.total);
  const perPortion = formatEuro(cost.perPortion);
  const title = [
    `Prix indicatif pour ${portions} part${portions > 1 ? 's' : ''} : ${total} (${perPortion} / part)`,
    partial ? `incomplet, ${missing} ingrédient${missing > 1 ? 's' : ''} sans prix` : '',
  ].filter(Boolean).join(', ');
  return (
    <div title={title} className="flex flex-col items-center justify-center tabular-nums leading-none">
      <span className={`flex items-center gap-1 text-base font-black ${partial ? 'text-amber-600' : 'text-orange-600'}`}>
        ≈ {total}
        {partial && (
          <span aria-hidden className="grid place-items-center w-3.5 h-3.5 rounded-full bg-amber-500 text-white text-[10px] font-black">!</span>
        )}
      </span>
      <span className="text-[10px] font-semibold text-slate-400 mt-0.5">{perPortion} / part</span>
      <span className="sr-only">{title}</span>
    </div>
  );
};
