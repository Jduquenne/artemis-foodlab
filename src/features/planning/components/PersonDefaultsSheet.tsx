import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { DAYS, MEAL_SLOTS } from '../../../core/domain/planningConfig';
import { SLOT_SHORT_LABELS } from '../../../core/domain/slotLabels';
import { PERSON_DEFAULT_MAX, PersonDefault } from '../../../core/domain/personDefaults';
import { defaultPersonsFor, isValidPersonDefault, setPersonDefault } from '../../../core/logic/planning/personDefaultsLogic';
import { DecimalInput } from '../../../shared/components/ui/DecimalInput';
import { Sheet } from '../../../shared/components/ui/Sheet';
import { usePendingKey } from '../../../shared/hooks/usePendingKey';
import { usePersonDefaultsStore } from '../../../shared/store/usePersonDefaultsStore';
import { withPending } from '../../../shared/utils/withPending';

const PENDING_KEY = 'planning-person-defaults';

export interface PersonDefaultsSheetProps {
    onClose: () => void;
}

export const PersonDefaultsSheet = ({ onClose }: PersonDefaultsSheetProps) => {
    const saved = usePersonDefaultsStore((s) => s.defaults);
    const saveDefaults = usePersonDefaultsStore((s) => s.saveDefaults);
    const [draft, setDraft] = useState<PersonDefault[]>(saved);
    const pending = usePendingKey(PENDING_KEY);
    const valid = draft.every((entry) => isValidPersonDefault(entry.persons));

    const save = () => {
        if (!valid) return;
        withPending(PENDING_KEY, async () => {
            await saveDefaults(draft);
            return true;
        }).then((done) => { if (done) onClose(); }, () => undefined);
    };

    return (
        <Sheet
            title="Personnes par défaut"
            subtitle="Utilisé pour un repas dont le nombre de personnes n'est pas réglé. Vide = celui de la recette. Partagé par le foyer."
            onClose={onClose}
        >
            <div className="grid grid-cols-[auto_repeat(4,minmax(0,1fr))] gap-x-2 gap-y-1.5 items-center">
                <span />
                {MEAL_SLOTS.map((def) => (
                    <span key={def.id} className="text-[10px] font-black uppercase tracking-wide text-slate-400 text-center truncate">{SLOT_SHORT_LABELS[def.id]}</span>
                ))}
                {DAYS.map((day) => (
                    <div key={day} className="contents">
                        <span className="text-xs font-bold text-slate-600 pr-1">{day.slice(0, 3)}.</span>
                        {MEAL_SLOTS.map((def) => (
                            <DecimalInput
                                key={def.id}
                                value={defaultPersonsFor(draft, day, def.id) ?? null}
                                onValueChange={(value) => setDraft(setPersonDefault(draft, day, def.id, value))}
                                integer
                                placeholder="—"
                                aria-label={`${day} · ${SLOT_SHORT_LABELS[def.id]} : personnes par défaut`}
                                className="w-full px-1 py-1.5 bg-surface border border-slate-200 rounded-lg text-sm font-semibold text-slate-800 text-center focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
                            />
                        ))}
                    </div>
                ))}
            </div>
            {!valid && <p className="text-xs text-red-600">Chaque valeur doit être entre 1 et {PERSON_DEFAULT_MAX}.</p>}
            <button
                type="button"
                onClick={save}
                disabled={!valid || pending}
                className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-orange-500 text-white font-bold disabled:opacity-50"
            >
                {pending && <Loader2 className="w-4 h-4 animate-spin" />}
                Enregistrer
            </button>
        </Sheet>
    );
};
