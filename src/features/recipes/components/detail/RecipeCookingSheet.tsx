import { COOKING_METHOD_LABELS } from '../../../../core/domain/cooking';
import { RecipeCookingRow, cookedGramsOf } from '../../../../core/logic/cooking/recipeCookingLogic';
import { formatCookingDuration, isRawMethod } from '../../../../core/logic/cooking/cookingLogic';
import { formatQty, pluralizeUnit } from '../../../../core/logic/unit/unitFormatLogic';
import { Sheet } from '../../../../shared/components/ui/Sheet';

export interface RecipeCookingSheetProps {
  rows: RecipeCookingRow[];
  portions: number;
  onClose: () => void;
}

const grams = (value: number) => `${Math.round(value).toLocaleString('fr-FR')} g`;

export const RecipeCookingSheet = ({ rows, portions, onClose }: RecipeCookingSheetProps) => (
  <Sheet
    title="Cuisson"
    subtitle={`Pour ${portions} part${portions > 1 ? 's' : ''}. Temps et poids cuits indicatifs.`}
    onClose={onClose}
  >
    <ul className="flex flex-col gap-3">
      {rows.map((row) => (
        <li key={row.key} className="flex flex-col gap-2 rounded-2xl border border-muted p-3">
          <div className="flex items-baseline justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-black text-slate-800 truncate">{row.name}</p>
              {row.baseNames.length > 0 && (
                <p className="text-[11px] text-slate-400 truncate">{row.baseNames.join(', ')}</p>
              )}
            </div>
            <p className="text-xs font-bold text-slate-500 tabular-nums shrink-0">
              Cru : {formatQty(row.quantity)} {pluralizeUnit(row.unit, row.quantity)}
            </p>
          </div>

          <ul className="flex flex-col divide-y divide-muted">
            {row.cookings.map((cooking) => {
              const cooked = cookedGramsOf(row, cooking);
              const duration = formatCookingDuration(cooking);
              const details = [duration, cooking.temperatureC !== null ? `${cooking.temperatureC} °C` : null]
                .filter((part): part is string => !!part)
                .join(' · ');
              return (
                <li key={cooking.method} className="flex flex-col gap-0.5 py-1.5">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-sm font-bold text-slate-700">
                      {COOKING_METHOD_LABELS[cooking.method]}
                      {isRawMethod(cooking.method) ? (
                        <span className="font-normal text-slate-500"> · se mange cru</span>
                      ) : (
                        details && <span className="font-normal text-slate-500 tabular-nums">{` · ${details}`}</span>
                      )}
                    </span>
                    {cooked !== null && (
                      <span className="text-sm font-black text-orange-600 tabular-nums shrink-0">≈ {grams(cooked)} cuits</span>
                    )}
                  </div>
                  {cooking.note && <p className="text-xs italic text-slate-400">{cooking.note}</p>}
                </li>
              );
            })}
          </ul>
        </li>
      ))}
    </ul>
    <p className="text-xs text-slate-400">
      Les macros et les prix restent calculés sur les poids crus.
    </p>
  </Sheet>
);
