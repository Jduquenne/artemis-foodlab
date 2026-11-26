import { Loader2, Star } from 'lucide-react';
import { FeedbackItem } from '../../../../core/domain/feedback';
import { feedbackAreaLabel, feedbackAuthorLabel, isFeedbackHandled } from '../../../../core/logic/dashboard/feedbackLogic';
import { usePendingKey } from '../../../../shared/hooks/usePendingKey';

export interface FeedbackRowProps {
    item: FeedbackItem;
    onToggleHandled: (item: FeedbackItem) => void;
}

const formatDate = (iso: string) => new Date(iso).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

export const FeedbackRow = ({ item, onToggleHandled }: FeedbackRowProps) => {
    const pending = usePendingKey(`feedback-handled:${item.id}`);
    const handled = isFeedbackHandled(item);

    return (
        <div className={`flex items-start gap-3 px-4 py-3 border-t border-slate-100 first:border-t-0 ${handled ? 'opacity-60' : ''}`}>
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
    );
};
