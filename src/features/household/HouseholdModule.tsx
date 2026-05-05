import { useMemo, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { HouseholdItem, HouseholdCategory } from '../../core/domain/types';
import { getRecords, toggleItem, clearAll } from '../../core/services/householdService';
import { markScrolling } from '../../shared/utils/scrollGuard';
import { useColCount } from '../../shared/hooks/useColCount';
import { distributeToColumns } from '../../shared/utils/columnUtils';
import householdDb from '../../core/data/household-db.json';
import { HouseholdCategoryCard } from './components/HouseholdCategoryCard';

const CATEGORY_ORDER: HouseholdCategory[] = [
    HouseholdCategory.PANTRY,
    HouseholdCategory.HYGIENE,
    HouseholdCategory.MAINTENANCE,
    HouseholdCategory.PHARMACY,
    HouseholdCategory.PETS,
];

const allItems = householdDb as HouseholdItem[];

export const HouseholdModule = () => {
    const records = useLiveQuery(() => getRecords(), []);
    const [spinning, setSpinning] = useState(false);
    const colCount = useColCount();

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

    const checkedCount = checkedIds.size;

    const grouped = useMemo(() => {
        return CATEGORY_ORDER
            .map(cat => ({ label: cat, items: allItems.filter(i => i.category === cat) }))
            .filter(g => g.items.length > 0);
    }, []);

    const columns = useMemo(
        () => distributeToColumns(grouped, g => g.items.length, colCount),
        [grouped, colCount]
    );

    return (
        <div className="h-full flex flex-col gap-4 overflow-hidden">
            <div className="flex justify-between items-start shrink-0">
                <div>
                    <h1 className="text-xl sm:text-2xl tablet:text-3xl font-black text-slate-900">Articles du quotidien</h1>
                    <p className="text-slate-500 text-sm mt-0.5">
                        {checkedCount > 0
                            ? <span className="text-orange-600 font-medium">{checkedCount} article{checkedCount > 1 ? 's' : ''} à acheter</span>
                            : <span>Aucun article sélectionné</span>
                        }
                    </p>
                </div>
                <button
                    onClick={handleReset}
                    title="Tout désélectionner"
                    className="flex items-center gap-2 bg-white dark:bg-slate-100 border border-slate-200 px-3 py-2 rounded-xl text-sm font-bold text-slate-500 hover:text-orange-600 hover:border-orange-300 transition-colors shrink-0"
                >
                    <RotateCcw className={`w-4 h-4 ${spinning ? 'animate-spin-once' : ''}`} />
                    <span className="hidden sm:inline">Tout réinitialiser</span>
                </button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto pr-1" onScroll={markScrolling}>
                <div
                    className="grid gap-4 pb-4 items-start"
                    style={{ gridTemplateColumns: `repeat(${colCount}, 1fr)` }}
                >
                    {columns.map((col, ci) => (
                        <div key={ci} className="flex flex-col gap-4">
                            {col.map((group, i) => (
                                <div key={group.label} className="animate-fade-in-up" style={{ animationDelay: `${(ci + i) * 60}ms` }}>
                                    <HouseholdCategoryCard
                                        label={group.label}
                                        items={group.items}
                                        checkedIds={checkedIds}
                                        onToggle={toggleItem}
                                    />
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
