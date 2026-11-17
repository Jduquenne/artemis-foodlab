import { RecipeCost } from '../../../../core/logic/price/recipeCostLogic';
import { formatEuro } from '../../../../core/logic/price/priceLogic';
import { formatQty, pluralizeUnit } from '../../../../core/logic/unit/unitFormatLogic';
import { Sheet } from '../../../../shared/components/ui/Sheet';
import { useFoodPrices } from '../../../../shared/hooks/useFoodPrices';

export interface RecipeCostSheetProps {
  cost: RecipeCost;
  portions: number;
  onClose: () => void;
}

export const RecipeCostSheet = ({ cost, portions, onClose }: RecipeCostSheetProps) => {
  const { store } = useFoodPrices();
  const priced = cost.lines.filter((line) => line.cost !== null);
  const missing = cost.lines.filter((line) => line.cost === null);
  const partial = missing.length > 0;
  const maxCost = Math.max(...priced.map((line) => line.cost ?? 0), 0);
  const subtitle = `Pour ${portions} part${portions > 1 ? 's' : ''}${store ? `, prix de ${store.name}, ${store.city}` : ''}. Montant indicatif.`;

  return (
    <Sheet title="Détail du prix" subtitle={subtitle} onClose={onClose}>
      <div className="flex items-end justify-between gap-3">
        <p className={`text-4xl font-extrabold tabular-nums leading-none ${partial ? 'text-amber-600' : 'text-orange-600'}`}>
          ≈ {formatEuro(cost.total.total)}
        </p>
        <p className="text-sm font-bold text-slate-500 tabular-nums">{formatEuro(cost.perPortion)} / part</p>
      </div>

      {priced.length > 0 && (
        <section className="flex flex-col gap-1">
          <h3 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">Du plus cher au moins cher</h3>
          <ul className="flex flex-col">
            {priced.map((line) => {
              const lineCost = line.cost ?? 0;
              const share = cost.total.total > 0 ? Math.round((lineCost / cost.total.total) * 100) : 0;
              return (
                <li key={line.key} className="flex flex-col gap-1 py-2 border-b border-muted last:border-b-0">
                  <div className="flex items-baseline justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">{line.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">
                        {formatQty(line.quantity)} {pluralizeUnit(line.unit, line.quantity)}
                        {line.baseName && ` · ${line.baseName}`}
                      </p>
                    </div>
                    <div className="text-right shrink-0 tabular-nums">
                      <p className="text-sm font-black text-slate-800">{formatEuro(lineCost)}</p>
                      <p className="text-[11px] text-slate-400">{share} %</p>
                    </div>
                  </div>
                  <div className="h-1 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full w-full rounded-full bg-orange-400 origin-left"
                      style={{ transform: `scaleX(${maxCost > 0 ? lineCost / maxCost : 0})` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {partial && (
        <section className="flex flex-col gap-1 rounded-2xl bg-amber-50 dark:bg-amber-900/20 px-3 py-2.5">
          <h3 className="text-[11px] font-extrabold text-amber-600 uppercase tracking-widest">
            Sans prix, non comptés ({missing.length})
          </h3>
          <ul className="flex flex-col">
            {missing.map((line) => (
              <li key={line.key} className="flex items-baseline justify-between gap-3 py-1">
                <span className="text-sm font-semibold text-slate-700 truncate">
                  {line.name}
                  {line.baseName && <span className="text-[11px] font-normal text-slate-400">{` · ${line.baseName}`}</span>}
                </span>
                <span className="text-[11px] text-slate-500 shrink-0 tabular-nums">
                  {formatQty(line.quantity)} {pluralizeUnit(line.unit, line.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-slate-500">Ces ingrédients ne sont pas comptés : le montant est donc sous-estimé.</p>
        </section>
      )}
    </Sheet>
  );
};
