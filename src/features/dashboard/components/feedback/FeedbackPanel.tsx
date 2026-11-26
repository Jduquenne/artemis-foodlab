import { useState } from 'react';
import { RotateCw } from 'lucide-react';
import { FeedbackStatusFilter } from '../../../../core/domain/feedback';
import { matchesFeedbackFilter } from '../../../../core/logic/dashboard/feedbackLogic';
import { useFeedbackList } from '../../../../shared/hooks/useFeedbackList';
import { PillTabs } from '../common/PillTabs';
import { FeedbackRow } from './FeedbackRow';

const FILTERS: readonly { id: FeedbackStatusFilter; label: string }[] = [
    { id: 'open', label: 'Ouverts' },
    { id: 'handled', label: 'Traités' },
    { id: 'all', label: 'Tous' },
];

const EMPTY_LABELS: Record<FeedbackStatusFilter, string> = {
    open: 'Aucun avis ouvert.',
    handled: 'Aucun avis traité.',
    all: 'Aucun avis pour l\'instant.',
};

export const FeedbackPanel = () => {
    const [filter, setFilter] = useState<FeedbackStatusFilter>('open');
    const { items, loadError, reload, toggleHandled } = useFeedbackList(filter);
    const shown = (items ?? []).filter((item) => matchesFeedbackFilter(item, filter));

    return (
        <div className="h-full flex flex-col gap-3 min-h-0">
            <div className="shrink-0 flex items-center justify-between gap-3">
                <PillTabs tabs={FILTERS} value={filter} onChange={setFilter} compact />
                <button type="button" onClick={reload} aria-label="Recharger les avis" className="p-1.5 rounded-lg text-slate-400 hover:text-orange-500 hover:bg-muted transition-colors">
                    <RotateCw size={14} />
                </button>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto bg-surface border border-slate-200 rounded-2xl shadow-sm">
                {loadError ? (
                    <p className="p-6 text-center text-sm text-slate-500">Impossible de charger les avis.</p>
                ) : items === null ? (
                    <p className="p-6 text-center text-sm text-slate-400">Chargement…</p>
                ) : shown.length === 0 ? (
                    <p className="p-6 text-center text-sm text-slate-400 italic">{EMPTY_LABELS[filter]}</p>
                ) : (
                    shown.map((item) => <FeedbackRow key={item.id} item={item} onToggleHandled={toggleHandled} />)
                )}
            </div>
        </div>
    );
};
