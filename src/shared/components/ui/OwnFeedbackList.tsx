import { Star } from "lucide-react";
import { feedbackAreaLabel } from "../../../core/logic/dashboard/feedbackLogic";
import { useOwnFeedback } from "../../hooks/useOwnFeedback";

const formatDate = (iso: string) => new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });

export const OwnFeedbackList = () => {
  const { items, newReplyIds, loadError } = useOwnFeedback();

  if (loadError) return <p className="text-sm text-slate-500 text-center py-4">Impossible de charger tes avis.</p>;
  if (items === null) return <p className="text-sm text-slate-400 text-center py-4">Chargement…</p>;
  if (items.length === 0) return <p className="text-sm text-slate-400 italic text-center py-4">Tu n'as encore envoyé aucun avis.</p>;

  return (
    <ul className="flex flex-col gap-3">
      {items.map((item) => (
        <li key={item.id} className="flex flex-col gap-2 rounded-xl bg-muted px-3 py-2.5">
          <p className="text-[11px] text-slate-400 flex flex-wrap gap-x-2">
            <span>{formatDate(item.createdAt)}</span>
            {item.screen && <span className="font-bold text-slate-500">{feedbackAreaLabel(item.screen)}</span>}
            {item.rating !== null && (
              <span className="flex items-center gap-0.5 text-amber-500">
                {item.rating}
                <Star className="w-3 h-3 fill-current" />
              </span>
            )}
            <span>{item.handledAt ? "Traité" : "En attente"}</span>
          </p>
          <p className="text-sm text-slate-800 whitespace-pre-wrap break-words">{item.message}</p>
          {item.reply !== null && (
            <div className="pl-3 border-l-2 border-orange-300 flex flex-col gap-0.5">
              <p className="text-[11px] font-bold text-orange-600">
                Réponse{newReplyIds.has(item.id) && <span className="ml-1.5 px-1.5 py-0.5 rounded bg-orange-500 text-white">Nouveau</span>}
              </p>
              <p className="text-sm text-slate-700 whitespace-pre-wrap break-words">{item.reply}</p>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
};
