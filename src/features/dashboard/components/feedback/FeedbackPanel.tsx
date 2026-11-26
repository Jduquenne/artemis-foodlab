import { useState } from 'react';
import { RotateCw, Trash2 } from 'lucide-react';
import { FeedbackItem, FeedbackStatusFilter } from '../../../../core/domain/feedback';
import { feedbackPurgeMessage, matchesFeedbackFilter } from '../../../../core/logic/dashboard/feedbackLogic';
import { useFeedbackList } from '../../../../shared/hooks/useFeedbackList';
import { useNotificationStore } from '../../../../shared/store/useNotificationStore';
import { ConfirmActionModal } from '../../../../shared/components/ui/ConfirmActionModal';
import { PillTabs } from '../common/PillTabs';
import { FeedbackRow } from './FeedbackRow';
import { FeedbackReplySheet } from './FeedbackReplySheet';

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
    const { items, loadError, reload, toggleHandled, reply, deleteReply, remove, purgeHandled } = useFeedbackList(filter);
    const [replying, setReplying] = useState<FeedbackItem | null>(null);
    const [deleting, setDeleting] = useState<FeedbackItem | null>(null);
    const [purging, setPurging] = useState(false);
    const shown = (items ?? []).filter((item) => matchesFeedbackFilter(item, filter));

    const confirmPurge = async (): Promise<boolean> => {
        const result = await purgeHandled();
        if (!result) return false;
        useNotificationStore.getState().push({ message: feedbackPurgeMessage(result), variant: 'info', duration: 4000 });
        setPurging(false);
        return true;
    };

    const confirmDelete = async (): Promise<boolean> => {
        if (!deleting) return false;
        const done = await remove(deleting);
        if (done) setDeleting(null);
        return done;
    };

    return (
        <div className="h-full flex flex-col gap-3 min-h-0">
            <div className="shrink-0 flex items-center justify-between gap-3">
                <PillTabs tabs={FILTERS} value={filter} onChange={setFilter} compact />
                <span className="flex items-center gap-1">
                    {filter === 'handled' && shown.length > 0 && (
                        <button type="button" onClick={() => setPurging(true)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                            Vider les avis traités
                        </button>
                    )}
                    <button type="button" onClick={reload} aria-label="Recharger les avis" className="p-1.5 rounded-lg text-slate-400 hover:text-orange-500 hover:bg-muted transition-colors">
                        <RotateCw size={14} />
                    </button>
                </span>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto bg-surface border border-slate-200 rounded-2xl shadow-sm">
                {loadError ? (
                    <p className="p-6 text-center text-sm text-slate-500">Impossible de charger les avis.</p>
                ) : items === null ? (
                    <p className="p-6 text-center text-sm text-slate-400">Chargement…</p>
                ) : shown.length === 0 ? (
                    <p className="p-6 text-center text-sm text-slate-400 italic">{EMPTY_LABELS[filter]}</p>
                ) : (
                    shown.map((item) => (
                        <FeedbackRow
                            key={item.id}
                            item={item}
                            onToggleHandled={toggleHandled}
                            onReply={setReplying}
                            onDeleteReply={deleteReply}
                            onDelete={setDeleting}
                        />
                    ))
                )}
            </div>

            {replying && <FeedbackReplySheet item={replying} onSave={(text) => reply(replying, text)} onClose={() => setReplying(null)} />}

            {deleting && (
                <ConfirmActionModal
                    title="Supprimer cet avis ?"
                    consequence="L'avis et sa réponse seront supprimés définitivement."
                    confirmLabel="Supprimer"
                    danger
                    onConfirm={confirmDelete}
                    onCancel={() => setDeleting(null)}
                />
            )}

            {purging && (
                <ConfirmActionModal
                    title="Vider les avis traités ?"
                    consequence="Tous les avis traités sont supprimés définitivement, sauf ceux dont la réponse n'a pas encore été lue par leur auteur."
                    confirmLabel="Vider"
                    danger
                    onConfirm={confirmPurge}
                    onCancel={() => setPurging(false)}
                />
            )}
        </div>
    );
};
