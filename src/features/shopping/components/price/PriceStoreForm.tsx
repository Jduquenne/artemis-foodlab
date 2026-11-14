import { FormEvent, useState } from 'react';
import { MAX_PRICE_STORE_TEXT, PriceStoreInput } from '../../../../core/domain/price';
import { usePendingKey } from '../../../../shared/hooks/usePendingKey';
import { FORM_INPUT_CLASS } from '../../../../shared/components/ui/formStyles';

export interface PriceStoreFormProps {
    initial?: PriceStoreInput;
    pendingKey: string;
    submitLabel: string;
    onSubmit: (input: PriceStoreInput) => Promise<boolean>;
    onCancel?: () => void;
}

export const PriceStoreForm = ({ initial, pendingKey, submitLabel, onSubmit, onCancel }: PriceStoreFormProps) => {
    const [name, setName] = useState(initial?.name ?? '');
    const [city, setCity] = useState(initial?.city ?? '');
    const pending = usePendingKey(pendingKey);
    const valid = name.trim().length > 0 && city.trim().length > 0;

    const submit = (e: FormEvent) => {
        e.preventDefault();
        if (!valid || pending) return;
        onSubmit({ name: name.trim(), city: city.trim() }).then((saved) => {
            if (saved && !initial) {
                setName('');
                setCity('');
            }
        }, () => undefined);
    };

    return (
        <form onSubmit={submit} className="flex flex-col gap-2">
            <div className="grid grid-cols-2 gap-2">
                <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={MAX_PRICE_STORE_TEXT}
                    placeholder="Magasin (ex. Leclerc)"
                    aria-label="Nom du magasin"
                    className={`${FORM_INPUT_CLASS} min-w-0`}
                />
                <input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    maxLength={MAX_PRICE_STORE_TEXT}
                    placeholder="Ville"
                    aria-label="Ville du magasin"
                    className={`${FORM_INPUT_CLASS} min-w-0`}
                />
            </div>
            <div className="flex gap-2 justify-end">
                {onCancel && (
                    <button type="button" onClick={onCancel} className="px-3 py-1.5 text-sm font-semibold text-slate-500 hover:text-slate-700">
                        Annuler
                    </button>
                )}
                <button
                    type="submit"
                    disabled={!valid || pending}
                    className={`px-4 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold transition-colors disabled:opacity-50 ${pending ? 'animate-pulse' : ''}`}
                >
                    {submitLabel}
                </button>
            </div>
        </form>
    );
};
