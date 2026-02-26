import { useState, useEffect } from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
import { HouseholdItem } from '../../../core/domain/types';
import { db, HouseholdRecord } from '../../../core/services/db';
import householdDb from '../../../core/data/household-db.json';

const allItems = householdDb as HouseholdItem[];

function isDue(record: HouseholdRecord | undefined, checkIntervalDays: number): boolean {
    if (!record) return true;
    const dueMs = new Date(record.lastCheckedAt).getTime() + checkIntervalDays * 86_400_000;
    return dueMs <= Date.now();
}

export interface HouseholdCardProps {
    viewMode: 'all' | 'missing';
}

export const HouseholdCard = ({ viewMode }: HouseholdCardProps) => {
    const [dueItems, setDueItems] = useState<HouseholdItem[]>([]);
    const [checked, setChecked] = useState<Set<string>>(new Set());

    useEffect(() => {
        db.household.toArray().then(records => {
            const map = new Map(records.map(r => [r.id, r]));
            setDueItems(allItems.filter(item => isDue(map.get(item.id), item.checkIntervalDays)));
        });
    }, []);

    const handleCheck = async (item: HouseholdItem) => {
        await db.household.put({ id: item.id, lastCheckedAt: new Date().toISOString() });
        setChecked(prev => new Set([...prev, item.id]));
    };

    const displayItems = viewMode === 'missing'
        ? dueItems.filter(i => !checked.has(i.id))
        : dueItems;

    if (displayItems.length === 0) return null;

    const checkedCount = checked.size;

    return (
        <div className="bg-white dark:bg-slate-100 border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-orange-600 font-black uppercase tracking-widest text-xs">
                    Quotidien
                </h2>
                {checkedCount > 0 && (
                    <span className="text-xs text-slate-400 font-medium">
                        {checkedCount}/{dueItems.length}
                    </span>
                )}
            </div>
            <div className="space-y-1">
                {displayItems.map(item => {
                    const isChecked = checked.has(item.id);
                    return (
                        <div
                            key={item.id}
                            onClick={() => { if (!isChecked) handleCheck(item); }}
                            className={`flex items-center justify-between gap-2 px-3 py-3 rounded-xl transition-all cursor-pointer select-none
                                ${isChecked
                                    ? 'opacity-40 bg-slate-50 dark:bg-slate-200/40'
                                    : 'hover:bg-slate-50 dark:hover:bg-slate-200/40'}`}
                        >
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                {isChecked
                                    ? <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                                    : <Circle className="w-5 h-5 text-slate-300 shrink-0" />
                                }
                                <span className={`font-medium text-slate-800 truncate ${isChecked ? 'line-through' : ''}`}>
                                    {item.name}
                                </span>
                            </div>
                            <span className="text-xs text-slate-400 shrink-0">{item.category}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
