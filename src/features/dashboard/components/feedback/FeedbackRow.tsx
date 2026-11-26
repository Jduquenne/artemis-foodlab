import { Loader2, MessageSquareReply, Star, Trash2 } from 'lucide-react';
import { FeedbackItem } from '../../../../core/domain/feedback';
import { canReplyToFeedback, feedbackAreaLabel, feedbackAuthorLabel, isFeedbackHandled } from '../../../../core/logic/dashboard/feedbackLogic';
import { usePendingKey } from '../../../../shared/hooks/usePendingKey';

export interface FeedbackRowProps {
    item: FeedbackItem;
    onToggleHandled: (item: FeedbackItem) => void;
    onReply: (item: FeedbackItem) => void;
    onDeleteReply: (item: FeedbackItem) => void;
    onDelete: (item: FeedbackItem) => void;
}

const formatDate = (iso: string) => new Date(iso).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
const SMALL_BUTTON = 'flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold transition-colors disabled:opacity-50';

export const FeedbackRow = ({ item, onToggleHandled, onReply, onDeleteReply, onDelete }: FeedbackRowProps) => {
    const pending = usePendingKey(`feedback-handled:${item.id}`);
    const deletingReply = usePendingKey(`feedback-reply-delete:${item.id}`);
    const handled = isFeedbackHandled(item);
    const canReply = canReplyToFeedback(item);

    return (
        <div className="flex flex-col gap-2 px-4 py-3 border-t border-slate-100 first:border-t-0">
            <div className={`flex items-start gap-3 ${handled ? 'opacity-70' : ''}`}>
                <div className="flex-1 min-w-0 flex flex-col gap-1">
                    <p className="text-sm text-slate-800 whitespace-pre-wrap break-words">{item.message}</p>
                    <p className="text-[11px] text-slate-400 flex flex-wrap gap-x-2">
                        <span>{feedbackAuthorLabel(item)}</span>
                        <span>{formatDate(item.createdAt)}</span>
                        {item.screen && <span className="font-bold text-slate-500">{feedbackAreaLabel(item.screen)}</span>}
                        {item.appVersion && <span>v{item.appVersion}</span>}
                        {item.rating !== null && (
                            <span className="flex items-center gap-0.5 text-amber-500">
                                {item.rating}
                                <Star className="w-3 h-3 fill-current" />
                            </span>
                        )}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => onToggleHandled(item)}
                    disabled={pending}
                    className={`shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 ${handled ? 'bg-muted text-slate-500' : 'bg-orange-500 text-white hover:bg-orange-600'}`}
                >
                    {pending && <Loader2 className="w-3 h-3 animate-spin" />}
                    {handled ? 'Rouvrir' : 'Marquer traité'}
                </button>
            </div>

            {item.reply !== null && (
                <div className="ml-3 pl-3 border-l-2 border-orange-200 flex flex-col gap-0.5">
                    <p className="text-sm text-slate-700 whitespace-pre-wrap break-words">{item.reply}</p>
                    <p className="text-[11px] text-slate-400">
                        Réponse{item.repliedAt && ` du ${formatDate(item.repliedAt)}`} · {item.replyReadAt ? 'lue' : 'pas encore lue'}
                    </p>
                </div>
            )}

            <div className="flex flex-wrap gap-1.5">
                {canReply ? (
                    <button type="button" onClick={() => onReply(item)} className={`${SMALL_BUTTON} bg-muted text-slate-600 hover:text-orange-600`}>
                        <MessageSquareReply className="w-3.5 h-3.5" />
                        {item.reply ? 'Modifier la réponse' : 'Répondre'}
                    </button>
                ) : (
                    <span className="text-[11px] text-slate-400 italic px-1 py-1">
                        {item.fromDemo ? 'Avis de la démo : pas de réponse possible' : 'Compte supprimé : pas de réponse possible'}
                    </span>
                )}
                {item.reply !== null && (
                    <button type="button" onClick={() => onDeleteReply(item)} disabled={deletingReply} className={`${SMALL_BUTTON} bg-muted text-slate-600 hover:text-red-600`}>
                        {deletingReply && <Loader2 className="w-3 h-3 animate-spin" />}
                        Supprimer la réponse
                    </button>
                )}
                <button type="button" onClick={() => onDelete(item)} className={`${SMALL_BUTTON} ml-auto text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30`}>
                    <Trash2 className="w-3.5 h-3.5" />
                    Supprimer
                </button>
            </div>
        </div>
    );
};
