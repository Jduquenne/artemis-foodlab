import { useMemo, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { HouseholdCategory } from '../../../core/domain/types';
import { getRecords, toggleItem, clearAll } from '../../../core/services/householdService';
import { distributeToColumns } from '../../../shared/utils/columnUtils';
import { typedHouseholdDb } from '../../../core/typed-db/typedHouseholdDb';
import { HouseholdCategoryCard } from './HouseholdCategoryCard';

const CATEGORY_ORDER: HouseholdCategory[] = [
  HouseholdCategory.PANTRY,
  HouseholdCategory.HYGIENE,
  HouseholdCategory.MAINTENANCE,
  HouseholdCategory.PHARMACY,
  HouseholdCategory.PETS,
];

export interface HouseholdPanelProps {
  colCount: number;
}

export const HouseholdPanel = ({ colCount }: HouseholdPanelProps) => {
  const records = useLiveQuery(() => getRecords(), []);
  const [spinning, setSpinning] = useState(false);
  const allItems = useMemo(() => Object.values(typedHouseholdDb), []);

  const checkedIds = useMemo(() => {
    const set = new Set<string>();
    for (const r of records ?? []) set.add(r.id);
    return set;
  }, [records]);

  const handleReset = async () => {
    setSpinning(true);
    await clearAll();
    setTimeout(() => setSpinning(false), 600);
  };

  const grouped = useMemo(
    () =>
      CATEGORY_ORDER.map(cat => ({ label: cat, items: allItems.filter(i => i.category === cat) })).filter(
        g => g.items.length > 0,
      ),
    [allItems],
  );

  const columns = useMemo(
    () => distributeToColumns(grouped, g => g.items.length, colCount),
    [grouped, colCount],
  );

  return (
    <div className="flex flex-col gap-3 pb-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-500">
          {checkedIds.size > 0 ? (
            <span className="text-orange-600 font-medium">
              {checkedIds.size} article{checkedIds.size > 1 ? 's' : ''} à acheter
            </span>
          ) : (
            'Coche les articles à ajouter à la liste'
          )}
        </span>
        {checkedIds.size > 0 && (
          <button
            onClick={handleReset}
            title="Tout désélectionner"
            className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-orange-600 transition-colors"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${spinning ? 'animate-spin-once' : ''}`} />
            Tout réinitialiser
          </button>
        )}
      </div>

      <div className="grid gap-4 items-start" style={{ gridTemplateColumns: `repeat(${colCount}, 1fr)` }}>
        {columns.map((col, ci) => (
          <div key={ci} className="flex flex-col gap-4">
            {col.map(group => (
              <HouseholdCategoryCard
                key={group.label}
                label={group.label}
                items={group.items}
                checkedIds={checkedIds}
                onToggle={toggleItem}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
