import { useState } from "react";
import { ChevronLeft, Plus, Soup, X } from "lucide-react";
import {
  AccompanimentDraft,
  MAX_ACCOMPANIMENTS,
  draftFromAccompaniment,
  emptyAccompanimentDraft,
} from "../../core/logic/accompaniment/accompanimentFormLogic";
import { useAccompanimentStore } from "../../shared/store/useAccompanimentStore";
import { AccompanimentEditor } from "./components/AccompanimentEditor";
import { AccompanimentRow } from "./components/AccompanimentRow";

export interface AccompanimentsModalProps {
  onClose: () => void;
}

export const AccompanimentsModal = ({ onClose }: AccompanimentsModalProps) => {
  const accompaniments = useAccompanimentStore((s) => s.accompaniments);
  const [editing, setEditing] = useState<AccompanimentDraft | null>(null);
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => { setIsClosing(true); setTimeout(onClose, 220); };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        className={`w-full max-w-lg h-[90dvh] bg-surface rounded-2xl shadow-2xl flex flex-col overflow-hidden ${
          isClosing ? "modal-center-exit" : "modal-center-enter"
        }`}
      >
        <div className="flex items-center gap-2 px-3 pt-4 pb-3 border-b border-slate-100 shrink-0">
          {editing ? (
            <button
              onClick={() => setEditing(null)}
              aria-label="Retour aux accompagnements"
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-muted transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          ) : (
            <span className="p-1.5"><Soup className="w-5 h-5 text-orange-500" /></span>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-black text-orange-600 uppercase tracking-widest truncate">
              {editing ? (editing.id ? editing.name : "Nouvel accompagnement") : "Accompagnements"}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Ce qui accompagne certains plats chez vous, au choix de chaque profil.
            </p>
          </div>
          <button
            onClick={handleClose}
            aria-label="Fermer"
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {editing ? (
          <AccompanimentEditor key={editing.id ?? "new"} initial={editing} onDone={() => setEditing(null)} />
        ) : (
          <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4 flex flex-col gap-2">
            {accompaniments.length === 0 && (
              <p className="px-4 py-6 rounded-2xl border border-dashed border-slate-300 text-center text-sm text-slate-400">
                Aucun accompagnement. Exemple : « Soupe », avec une tartine au fromage, une tartine de pâté ou des croûtons.
              </p>
            )}
            {accompaniments.map((accompaniment) => (
              <AccompanimentRow
                key={accompaniment.id}
                accompaniment={accompaniment}
                onOpen={() => setEditing(draftFromAccompaniment(accompaniment))}
              />
            ))}
            {accompaniments.length < MAX_ACCOMPANIMENTS && (
              <button
                type="button"
                onClick={() => setEditing(emptyAccompanimentDraft())}
                className="mt-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-dashed border-orange-300 text-sm font-bold text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
              >
                <Plus className="w-4 h-4" /> Nouvel accompagnement
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
