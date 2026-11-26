import { useState } from "react";
import { Loader2, Star } from "lucide-react";
import { FEEDBACK_MESSAGE_MAX, FEEDBACK_RATINGS } from "../../../core/domain/feedback";
import { feedbackAreaOf, feedbackAreasFor } from "../../../core/logic/dashboard/feedbackLogic";
import { useIsAdmin } from "../../hooks/useIsAdmin";
import { sendFeedback } from "../../../core/services/feedbackService";
import { usePendingKey } from "../../hooks/usePendingKey";
import { useNotificationStore } from "../../store/useNotificationStore";
import { withPending } from "../../utils/withPending";
import { Sheet } from "./Sheet";
import { OwnFeedbackList } from "./OwnFeedbackList";
import { useFeedbackStore } from "../../store/useFeedbackStore";

const PENDING_KEY = "feedback-send";

export interface FeedbackSheetProps {
  screen: string;
  onClose: () => void;
}

export const FeedbackSheet = ({ screen, onClose }: FeedbackSheetProps) => {
  const unreadReplies = useFeedbackStore((s) => s.unreadReplies);
  const [tab, setTab] = useState<"write" | "mine">(() => (unreadReplies > 0 ? "mine" : "write"));
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState<number | null>(null);
  const isAdmin = useIsAdmin();
  const areas = feedbackAreasFor(isAdmin);
  const [area, setArea] = useState(() => feedbackAreaOf(screen, areas));
  const pending = usePendingKey(PENDING_KEY);
  const trimmed = message.trim();

  const send = () => {
    if (!trimmed) return;
    withPending(PENDING_KEY, () => sendFeedback({ message: trimmed, screen: area, appVersion: __APP_VERSION__, rating }))
      .then((created) => {
        if (!created) return;
        useNotificationStore.getState().push({ message: "Merci pour ton avis !", variant: "info", duration: 3000 });
        onClose();
      }, () => undefined);
  };

  return (
    <Sheet title="Donner mon avis" subtitle="Une idée, un bug, quelque chose qui t'agace ? On lit tout." onClose={onClose}>
      <div className="flex gap-2" role="tablist">
        {(["write", "mine"] as const).map((option) => (
          <button
            key={option}
            type="button"
            role="tab"
            aria-selected={tab === option}
            onClick={() => setTab(option)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-colors ${tab === option ? "bg-orange-500 text-white" : "bg-muted text-slate-500"}`}
          >
            {option === "write" ? "Écrire" : "Mes avis"}
            {option === "mine" && unreadReplies > 0 && (
              <span className={`min-w-4 h-4 px-1 rounded-full text-[10px] leading-4 ${tab === option ? "bg-white text-orange-600" : "bg-orange-500 text-white"}`}>{unreadReplies}</span>
            )}
          </button>
        ))}
      </div>
      {tab === "mine" ? <OwnFeedbackList /> : (<>
      <label className="flex flex-col gap-1">
        <span className="text-xs font-bold text-slate-500">À propos de</span>
        <select
          value={area}
          onChange={(e) => setArea(e.target.value)}
          className="w-full px-3 py-2.5 bg-surface border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
        >
          {areas.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
        </select>
      </label>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={5}
        maxLength={FEEDBACK_MESSAGE_MAX}
        autoFocus
        placeholder="Ton message…"
        aria-label="Ton avis"
        className="w-full px-3 py-2.5 bg-surface border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 resize-none focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
      />
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1" role="group" aria-label="Note facultative">
          {FEEDBACK_RATINGS.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(rating === value ? null : value)}
              aria-label={`${value} sur 5`}
              aria-pressed={rating !== null && value <= rating}
              className="p-1"
            >
              <Star className={`w-5 h-5 ${rating !== null && value <= rating ? "text-amber-500 fill-current" : "text-slate-300"}`} />
            </button>
          ))}
        </div>
        <span className="text-[11px] text-slate-400 tabular-nums">{message.length} / {FEEDBACK_MESSAGE_MAX}</span>
      </div>
      <p className="text-[11px] text-slate-400">Note facultative. La version de l'app est envoyée avec ton message.</p>
      <button
        type="button"
        onClick={send}
        disabled={!trimmed || pending}
        className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-orange-500 text-white font-bold disabled:opacity-50"
      >
        {pending && <Loader2 className="w-4 h-4 animate-spin" />}
        Envoyer
      </button>
      </>)}
    </Sheet>
  );
};
