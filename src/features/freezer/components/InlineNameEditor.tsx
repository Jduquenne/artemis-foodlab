import { Check, Loader2, X } from "lucide-react";

export interface InlineNameEditorProps {
  value: string;
  onChange: (value: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  inputClassName?: string;
  className?: string;
  pending?: boolean;
}

export const InlineNameEditor = ({
  value,
  onChange,
  onConfirm,
  onCancel,
  inputClassName,
  className,
  pending,
}: InlineNameEditorProps) => (
  <div className={`flex-1 flex items-center gap-2 min-w-0 ${className ?? ""}`}>
    <input
      autoFocus
      value={value}
      onChange={e => onChange(e.target.value)}
      onKeyDown={e => {
        if (e.key === "Enter") onConfirm();
        if (e.key === "Escape") onCancel();
      }}
      onClick={e => e.stopPropagation()}
      disabled={pending}
      className={`flex-1 min-w-0 bg-transparent border-b-2 border-orange-400 text-slate-900 focus:outline-none disabled:opacity-50 ${inputClassName ?? ""}`}
    />
    <button
      aria-label="Confirmer"
      onClick={e => { e.stopPropagation(); onConfirm(); }}
      disabled={pending}
      className="p-1.5 rounded-lg text-orange-500 hover:bg-orange-50 transition-colors shrink-0 disabled:opacity-50"
    >
      {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
    </button>
    <button
      aria-label="Annuler"
      onClick={e => { e.stopPropagation(); onCancel(); }}
      disabled={pending}
      className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-200 transition-colors shrink-0 disabled:opacity-50"
    >
      <X className="w-4 h-4" />
    </button>
  </div>
);
