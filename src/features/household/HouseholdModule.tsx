import { useMemo } from 'react';
import { CheckCircle2, Circle, RotateCcw } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { HouseholdItem, HouseholdCategory } from '../../core/domain/types';
import { db } from '../../core/services/db';
import { markScrolling } from '../../shared/utils/scrollGuard';
import householdDb from '../../core/data/household-db.json';

const CATEGORY_ORDER: HouseholdCategory[] = [
    HouseholdCategory.PANTRY,
    HouseholdCategory.HYGIENE,
    HouseholdCategory.MAINTENANCE,
    HouseholdCategory.PHARMACY,
    HouseholdCategory.PETS,
];

const allItems = householdDb as HouseholdItem[];

export const HouseholdModule = () => {
    const records = useLiveQuery(() => db.household.toArray(), []);

    const checkedIds = useMemo(() => {
        const set = new Set<string>();
        for (const r of records ?? []) set.add(r.id);
        return set;
    }, [records]);

    const handleVerify = async (id: string) => {
        await db.household.put({ id, lastCheckedAt: new Date().toISOString() });
    };

    const handleReset = async () => {
        await db.household.clear();
    };

    const uncheckedCount = allItems.length - checkedIds.size;

    const grouped = useMemo(() => {
        return CATEGORY_ORDER
            .map(cat => ({ label: cat, items: allItems.filter(i => i.category === cat) }))
            .filter(g => g.items.length > 0);
    }, []);

    return (
        <div className="h-full flex flex-col gap-4 overflow-hidden">
            <div className="flex justify-between items-start shrink-0">
                <div>
                    <h1 className="text-xl sm:text-2xl tablet:text-3xl font-black text-slate-900">Articles du quotidien</h1>
                    <p className="text-slate-500 text-sm mt-0.5">
                        {uncheckedCount > 0
                            ? <span className="text-orange-600 font-medium">{uncheckedCount} article{uncheckedCount > 1 ? 's' : ''} à vérifier</span>
                            : <span>Tout est vérifié</span>
                        }
                    </p>
                </div>
                <button
                    onClick={handleReset}
                    title="Réinitialiser toutes les vérifications"
                    className="flex items-center gap-2 bg-white dark:bg-slate-100 border border-slate-200 px-3 py-2 rounded-xl text-sm font-bold text-slate-500 hover:text-orange-600 hover:border-orange-300 transition-colors shrink-0"
                >
                    <RotateCcw className="w-4 h-4" />
                    <span className="hidden sm:inline">Tout réinitialiser</span>
                </button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto pr-1" onScroll={markScrolling}>
                <div className="columns-1 tablet:columns-2 lg:columns-3 gap-4 pb-4">
                    {grouped.map(group => (
                        <div key={group.label} className="break-inside-avoid mb-4">
                            <div className="bg-white dark:bg-slate-100 border border-slate-200 rounded-2xl p-3 shadow-sm">
                                <h2 className="text-orange-600 font-black uppercase tracking-widest text-xs mb-2">
                                    {group.label}
                                </h2>
                                <div className="space-y-0.5">
                                    {group.items.map(item => {
                                        const isChecked = checkedIds.has(item.id);

                                        return (
                                            <div
                                                key={item.id}
                                                onClick={() => { if (!isChecked) handleVerify(item.id); }}
                                                className={`flex items-center gap-2 px-2 py-2.5 rounded-xl transition-colors select-none
                                                    ${isChecked
                                                        ? 'opacity-40'
                                                        : 'hover:bg-slate-50 dark:hover:bg-slate-200/40 cursor-pointer'
                                                    }`}
                                            >
                                                {isChecked
                                                    ? <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                                                    : <Circle className="w-4 h-4 text-orange-400 shrink-0" />
                                                }
                                                <span className={`text-sm font-medium text-slate-800 truncate ${isChecked ? 'line-through' : ''}`}>
                                                    {item.name}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
