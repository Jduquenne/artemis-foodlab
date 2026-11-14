import { DecimalInput } from '../../../../shared/components/ui/DecimalInput';

export interface PriceEntryRowProps {
    label: string;
    suffix: string;
    value: number | null;
    computed: boolean;
    autoFocus?: boolean;
    onChange: (value: number | null) => void;
}

export const PriceEntryRow = ({ label, suffix, value, computed, autoFocus, onChange }: PriceEntryRowProps) => (
    <label className="flex items-center justify-between gap-3">
        <span className="flex-1 min-w-0 text-[15px] font-semibold text-slate-900">{label}</span>
        <span className="flex items-center w-40 shrink-0 rounded-xl border-2 border-slate-200 bg-subtle focus-within:border-orange-500 overflow-hidden">
            <DecimalInput
                value={value}
                onValueChange={onChange}
                placeholder="0"
                autoFocus={autoFocus}
                aria-label={label}
                className={`flex-1 min-w-0 bg-transparent text-right text-lg font-bold tabular-nums py-2 pl-2.5 pr-1.5 outline-none ${computed ? 'text-orange-600' : 'text-slate-900'}`}
            />
            <span className="pr-2.5 text-xs text-slate-400 whitespace-nowrap">{suffix}</span>
        </span>
    </label>
);
