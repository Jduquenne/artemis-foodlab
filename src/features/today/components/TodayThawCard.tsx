import { useNavigate } from 'react-router-dom';
import { ChevronRight, Snowflake } from 'lucide-react';
import { ThawReminder } from '../../../core/logic/freezer/thawLogic';

export interface TodayThawCardProps {
    reminders: ThawReminder[];
}

export const TodayThawCard = ({ reminders }: TodayThawCardProps) => {
    const navigate = useNavigate();

    return (
        <section className="bg-surface border border-slate-200 rounded-2xl shadow-sm p-4 flex flex-col gap-3 md:flex-1 md:min-h-0">
            <span className="flex items-center justify-between gap-2 shrink-0">
                <h2 className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-sky-600">
                    <Snowflake className="w-3.5 h-3.5" />
                    À sortir pour demain
                </h2>
                <button type="button" onClick={() => navigate('/freezer')} className="flex items-center text-xs font-bold text-slate-400 hover:text-orange-600">
                    Congélateur
                    <ChevronRight className="w-4 h-4" />
                </button>
            </span>
            {reminders.length === 0 ? (
                <p className="text-sm text-slate-400 italic">Rien à décongeler pour demain.</p>
            ) : (
                <ul className="flex flex-col gap-2 md:min-h-0 md:overflow-y-auto">
                    {reminders.map((reminder) => (
                        <li key={reminder.key} className="flex items-start gap-2 px-3 py-2 rounded-xl bg-sky-50 dark:bg-sky-950/30">
                            <span className="flex-1 min-w-0">
                                <span className="block text-sm font-bold text-slate-800 truncate">{reminder.name}</span>
                                <span className="block text-xs text-slate-500 truncate">
                                    {reminder.kind === 'batch' ? 'Lot prévu' : 'Au congélateur'} · pour {reminder.recipeNames.join(', ')}
                                </span>
                            </span>
                            <span className="shrink-0 text-xs font-black text-sky-700 dark:text-sky-400 tabular-nums">{reminder.amount}</span>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
};
