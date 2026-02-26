import { useMemo } from 'react';
import { CheckCircle2, Circle, Clock, RotateCcw } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { HouseholdItem, HouseholdCategory } from '../../core/domain/types';
import { db } from '../../core/services/db';
import { markScrolling } from '../../shared/utils/scrollGuard';
import householdDb from '../../core/data/household-db.json';

const CATEGORY_ORDER: HouseholdCategory[] = [
    HouseholdCategory.HYGIENE,
    HouseholdCategory.CUISINE,
    HouseholdCategory.ENTRETIEN,
    HouseholdCategory.MAISON,
    HouseholdCategory.PHARMACIE,
];

const allItems = householdDb as HouseholdItem[];

function getDueInfo(lastCheckedAt: string | undefined, checkIntervalDays: number) {
    if (!lastCheckedAt) return { daysUntilDue: -Infinity, isOverdue: true, neverChecked: true };
    const dueMs = new Date(lastCheckedAt).getTime() + checkIntervalDays * 86_400_000;
    const daysUntilDue = Math.ceil((dueMs - Date.now()) / 86_400_000);
    return { daysUntilDue, isOverdue: daysUntilDue <= 0, neverChecked: false };
}

export const HouseholdModule = () => {
    const records = useLiveQuery(() => db.household.toArray(), []);

    const checkMap = useMemo(() => {
        const map = new Map<string, string>();
        for (const r of records ?? []) map.set(r.id, r.lastCheckedAt);
        return map;
    }, [records]);

    const handleVerify = async (id: string) => {
        await db.household.put({ id, lastCheckedAt: new Date().toISOString() });
    };

    const handleReset = async () => {
        await db.household.clear();
    };

    const overdueCount = useMemo(() => {
        return allItems.filter(item => {
            const { isOverdue } = getDueInfo(checkMap.get(item.id), item.checkIntervalDays);
            return isOverdue;
        }).length;
    }, [checkMap]);

    const grouped = useMemo(() => {
        return CATEGORY_ORDER
            .map(cat => ({ label: cat, items: allItems.filter(i => i.category === cat) }))
            .filter(g => g.items.length > 0);
    }, []);

    return (
        <div className="h-full flex flex-col gap-4 overflow-hidden">
            <div className="flex justify-between items-start shrink-0">
                <div>
                    <h1 className="text-3xl font-black text-slate-900">Articles du quotidien</h1>
                    <p className="text-slate-500 text-sm mt-0.5">
                        {overdueCount > 0
                            ? <span className="text-orange-600 font-medium">{overdueCount} article{overdueCount > 1 ? 's' : ''} à vérifier</span>
                            : <span>Tout est à jour</span>
                        }
                    </p>
                </div>
                <button
                    onClick={handleReset}
                    title="Réinitialiser toutes les dates de vérification"
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
                            <div className="bg-white dark:bg-slate-100 border border-slate-200 rounded-2xl p-5 shadow-sm">
                                <h2 className="text-orange-600 font-black uppercase tracking-widest text-xs mb-4">
                                    {group.label}
                                </h2>
                                <div className="space-y-1">
                                    {group.items.map(item => {
                                        const lastChecked = checkMap.get(item.id);
                                        const { daysUntilDue, isOverdue, neverChecked } = getDueInfo(lastChecked, item.checkIntervalDays);

                                        return (
                                            <div
                                                key={item.id}
                                                onClick={() => handleVerify(item.id)}
                                                className="flex items-center justify-between gap-3 px-3 py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-200/40 cursor-pointer transition-colors select-none"
                                            >
                                                <div className="flex items-center gap-3 min-w-0">
                                                    {isOverdue
                                                        ? <Circle className="w-5 h-5 text-orange-400 shrink-0" />
                                                        : <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                                                    }
                                                    <span className="font-medium text-slate-800 truncate">{item.name}</span>
                                                </div>
                                                <div className="flex items-center gap-2 shrink-0">
                                                    <span className="text-xs text-slate-400 flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {item.checkIntervalDays}j
                                                    </span>
                                                    {neverChecked ? (
                                                        <span className="text-xs font-semibold px-2 py-0.5 rounded-lg bg-orange-100 text-orange-600">
                                                            Jamais vérifié
                                                        </span>
                                                    ) : isOverdue ? (
                                                        <span className="text-xs font-semibold px-2 py-0.5 rounded-lg bg-orange-100 text-orange-600">
                                                            {Math.abs(daysUntilDue)}j de retard
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs font-semibold px-2 py-0.5 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600">
                                                            dans {daysUntilDue}j
                                                        </span>
                                                    )}
                                                </div>
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
