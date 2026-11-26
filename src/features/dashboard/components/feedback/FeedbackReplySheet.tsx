import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { FEEDBACK_REPLY_MAX, FeedbackItem } from '../../../../core/domain/feedback';
import { Sheet } from '../../../../shared/components/ui/Sheet';
import { usePendingKey } from '../../../../shared/hooks/usePendingKey';

export interface FeedbackReplySheetProps {
    item: FeedbackItem;
    onSave: (text: string) => Promise<boolean>;
    onClose: () => void;
}

export const FeedbackReplySheet = ({ item, onSave, onClose }: FeedbackReplySheetProps) => {
    const [text, setText] = useState(item.reply ?? '');
    const pending = usePendingKey(`feedback-reply:${item.id}`);
    const trimmed = text.trim();

    const save = () => {
        if (!trimmed) return;
        onSave(trimmed).then((saved) => { if (saved) onClose(); }, () => undefined);
    };

    return (
        <Sheet title={item.reply ? 'Modifier la réponse' : 'Répondre'} subtitle="L'auteur verra ta réponse dans « Mes avis ». Envoyer marque l'avis comme traité." onClose={onClose}>
            <p className="text-sm text-slate-500 bg-muted rounded-xl px-3 py-2 whitespace-pre-wrap break-words max-h-32 overflow-y-auto">{item.message}</p>
            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={5}
                autoFocus
                maxLength={FEEDBACK_REPLY_MAX}
                placeholder="Ta réponse…"
                aria-label="Réponse"
                className="w-full px-3 py-2.5 bg-surface border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 resize-none focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
            />
            <span className="self-end text-[11px] text-slate-400 tabular-nums">{text.length} / {FEEDBACK_REPLY_MAX}</span>
            <button
                type="button"
                onClick={save}
                disabled={!trimmed || pending}
                className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-orange-500 text-white font-bold disabled:opacity-50"
            >
                {pending && <Loader2 className="w-4 h-4 animate-spin" />}
                Envoyer la réponse
            </button>
        </Sheet>
    );
};
