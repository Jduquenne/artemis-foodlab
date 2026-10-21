import { useState } from "react";
import { Apple, CookingPot, Loader2, Trash2, X } from "lucide-react";
import {
  AccompanimentDraft,
  MAX_ACCOMPANIMENT_NAME,
  MAX_ACCOMPANIMENT_OPTIONS,
  accompanimentOptionLabel,
  draftToInput,
  emptyOptionDraft,
  removeOptionDraft,
  updateOptionDraft,
  validateAccompanimentDraft,
} from "../../../core/logic/accompaniment/accompanimentFormLogic";
import { AccompanimentOptionKind } from "../../../core/domain/accompaniment";
import { toggleInList } from "../../../core/utils/collectionUtils";
import { RecipeSearchInput } from "../../../shared/components/ui/RecipeSearchInput";
import { ConfirmActionModal } from "../../../shared/components/ui/ConfirmActionModal";
import { useFoodsSnapshot, useRecipesSnapshot } from "../../../shared/hooks/useCatalogueSnapshot";
import { usePendingKey } from "../../../shared/hooks/usePendingKey";
import { useAccompanimentStore } from "../../../shared/store/useAccompanimentStore";
import { withPending } from "../../../shared/utils/withPending";
import { AccompanimentOptionRow } from "./AccompanimentOptionRow";

export interface AccompanimentEditorProps {
  initial: AccompanimentDraft;
  onDone: () => void;
}

const SECTION_TITLE = "text-[11px] font-black text-slate-400 uppercase tracking-widest";

export const AccompanimentEditor = ({ initial, onDone }: AccompanimentEditorProps) => {
  const recipes = useRecipesSnapshot();
  const foods = useFoodsSnapshot();
  const accompaniments = useAccompanimentStore((s) => s.accompaniments);
  const createAccompaniment = useAccompanimentStore((s) => s.createAccompaniment);
  const updateAccompaniment = useAccompanimentStore((s) => s.updateAccompaniment);
  const deleteAccompaniment = useAccompanimentStore((s) => s.deleteAccompaniment);
  const [draft, setDraft] = useState<AccompanimentDraft>(initial);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const saveKey = `accompaniment-save:${initial.id ?? "new"}`;
  const saving = usePendingKey(saveKey);
  const deleteKey = `accompaniment-delete:${initial.id ?? "new"}`;
  const deleting = usePendingKey(deleteKey);
  const busy = saving || deleting;

  const addOption = (kind: AccompanimentOptionKind) => {
    const option = emptyOptionDraft(crypto.randomUUID(), kind);
    setDraft({ ...draft, options: [...draft.options, option], defaultKey: draft.options.length === 0 ? option.key : draft.defaultKey });
  };

  const save = async () => {
    const validation = validateAccompanimentDraft(draft, accompaniments);
    setError(validation);
    if (validation) return;
    const input = draftToInput(draft);
    const { id } = draft;
    const saved = await withPending(saveKey, () => (id ? updateAccompaniment(id, input) : createAccompaniment(input))).catch(() => undefined);
    if (saved) onDone();
  };

  const remove = async (): Promise<boolean> => {
    const { id } = draft;
    if (!id) return false;
    const ok = await withPending(deleteKey, () => deleteAccompaniment(id).then(() => true)).catch(() => false);
    if (ok) onDone();
    return ok ?? false;
  };

  return (
    <>
      <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4 flex flex-col gap-5">
        <section className="flex flex-col gap-1.5">
          <label htmlFor="accompaniment-name" className={SECTION_TITLE}>Nom</label>
          <input
            id="accompaniment-name"
            value={draft.name}
            maxLength={MAX_ACCOMPANIMENT_NAME}
            disabled={busy}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            placeholder="Ex : Soupe"
            className="px-3 py-2 bg-surface border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 disabled:opacity-50"
          />
        </section>

        <section className="flex flex-col gap-2">
          <p className={SECTION_TITLE}>Plats concernés</p>
          {draft.recipeCodes.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {draft.recipeCodes.map((code) => {
                const name = recipes[code]?.name ?? "Recette supprimée";
                return (
                  <span key={code} className="flex items-center gap-1 pl-2.5 pr-1 py-1 rounded-lg text-xs font-semibold bg-orange-50 dark:bg-orange-900/20 text-orange-700">
                    {name}
                    <button
                      type="button"
                      disabled={busy}
                      aria-label={`Retirer ${name}`}
                      onClick={() => setDraft({ ...draft, recipeCodes: toggleInList(draft.recipeCodes, code) })}
                      className="p-0.5 rounded hover:bg-black/10 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                );
              })}
            </div>
          )}
          <RecipeSearchInput
            disabled={busy}
            placeholder="Ex : velouté de potiron, soupe à l'oignon…"
            onPick={(code) => { if (!draft.recipeCodes.includes(code)) setDraft({ ...draft, recipeCodes: [...draft.recipeCodes, code] }); }}
          />
        </section>

        <section className="flex flex-col gap-2">
          <p className={SECTION_TITLE}>Options au choix</p>
          {draft.options.length === 0 && (
            <p className="px-4 py-4 rounded-2xl border border-dashed border-slate-300 text-center text-sm text-slate-400">
              Ajoute une recette (ex : Tartine au fromage) ou un aliment (ex : Croûtons).
            </p>
          )}
          {draft.options.map((option, index) => (
            <AccompanimentOptionRow
              key={option.key}
              option={option}
              index={index}
              disabled={busy}
              onChange={(next) => setDraft(updateOptionDraft(draft, next))}
              onRemove={() => setDraft(removeOptionDraft(draft, option.key))}
            />
          ))}
          {draft.options.length < MAX_ACCOMPANIMENT_OPTIONS && (
            <div className="flex gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => addOption("recipe")}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-muted transition-colors disabled:opacity-50"
              >
                <CookingPot className="w-4 h-4 text-orange-500" /> Recette
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => addOption("food")}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-muted transition-colors disabled:opacity-50"
              >
                <Apple className="w-4 h-4 text-emerald-500" /> Aliment
              </button>
            </div>
          )}
        </section>

        <section className="flex flex-col gap-1.5">
          <label htmlFor="accompaniment-default" className={SECTION_TITLE}>Par défaut</label>
          <select
            id="accompaniment-default"
            value={draft.defaultKey ?? ""}
            disabled={busy}
            onChange={(e) => setDraft({ ...draft, defaultKey: e.target.value || null })}
            className="px-3 py-2 bg-surface border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 disabled:opacity-50"
          >
            <option value="">Sans accompagnement</option>
            {draft.options.map((option) => (
              <option key={option.key} value={option.key}>{accompanimentOptionLabel(option, recipes, foods)}</option>
            ))}
          </select>
          <p className="text-[11px] text-slate-500">Pour les profils qui n'ont pas de préférence. Chacun peut la changer dans ses préférences ou pour un repas.</p>
        </section>
      </div>

      <div className="flex flex-col gap-2 px-5 py-4 border-t border-slate-100 shrink-0 pb-[max(1rem,env(safe-area-inset-bottom))]">
        {error && <p className="text-xs font-semibold text-red-600">{error}</p>}
        <div className="flex items-center gap-2">
          {draft.id && (
            <button
              type="button"
              disabled={busy}
              onClick={() => setConfirmDelete(true)}
              aria-label="Supprimer l'accompagnement"
              className="p-2.5 rounded-xl text-slate-400 hover:text-red-500 hover:bg-muted transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            disabled={busy}
            onClick={onDone}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:bg-muted transition-colors disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={save}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-bold hover:bg-orange-600 transition-colors disabled:opacity-50"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Enregistrer
          </button>
        </div>
      </div>

      {confirmDelete && (
        <ConfirmActionModal
          title="Supprimer l'accompagnement"
          intro={`« ${draft.name.trim() || "Sans nom"} » sera supprimé.`}
          consequence="Les préférences des profils et les choix déjà faits sur les repas planifiés pour cet accompagnement seront aussi supprimés."
          confirmLabel="Supprimer"
          danger
          onConfirm={remove}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </>
  );
};
