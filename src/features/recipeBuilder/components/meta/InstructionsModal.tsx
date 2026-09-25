import { useEffect, useRef } from "react";
import { X, Plus, ChevronUp, ChevronDown } from "lucide-react";
import { splitPastedInstructionLines, spliceInstructionPaste } from "../../../../core/logic/recipeBuilder/instructionsLogic";

export interface InstructionsModalProps {
  instructions: string[];
  onChange: (instructions: string[]) => void;
  onClose: () => void;
}

const autoResize = (el: HTMLTextAreaElement) => {
  el.style.height = "auto";
  el.style.height = `${el.scrollHeight}px`;
};

export const InstructionsModal = ({ instructions, onChange, onClose }: InstructionsModalProps) => {
  const steps = instructions.length > 0 ? instructions : [""];
  const focusIndexRef = useRef<number | null>(null);
  const rowRefs = useRef<(HTMLTextAreaElement | null)[]>([]);

  useEffect(() => {
    if (focusIndexRef.current === null) return;
    rowRefs.current[focusIndexRef.current]?.focus();
    focusIndexRef.current = null;
  }, [steps.length]);

  const update = (i: number, value: string) => {
    const next = [...steps];
    next[i] = value;
    onChange(next);
  };

  const insertAfter = (i: number) => {
    const next = [...steps];
    next.splice(i + 1, 0, "");
    focusIndexRef.current = i + 1;
    onChange(next);
  };

  const remove = (i: number) => {
    if (steps.length === 1) {
      onChange([]);
      return;
    }
    onChange(steps.filter((_, idx) => idx !== i));
  };

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= steps.length) return;
    const next = [...steps];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>, i: number) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      insertAfter(i);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>, i: number) => {
    const lines = splitPastedInstructionLines(e.clipboardData.getData("text"));
    if (lines.length <= 1) return;
    e.preventDefault();
    const el = e.currentTarget;
    const before = steps[i].slice(0, el.selectionStart);
    const after = steps[i].slice(el.selectionEnd);
    focusIndexRef.current = i + lines.length - 1;
    onChange(spliceInstructionPaste(steps, i, before, after, lines));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-0 sm:px-4">
      <div className="w-full sm:max-w-2xl bg-slate-50 rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col max-h-[85dvh] modal-enter sm:modal-center-enter">
        <div className="flex items-center justify-between px-5 pt-5 pb-4 shrink-0">
          <h2 className="text-base font-black text-slate-900">Instructions</h2>
          <button
            aria-label="Fermer"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-5 pb-3 flex flex-col gap-2">
          {steps.map((step, i) => (
            <div key={i} className="flex items-start gap-2 group">
              <span className="shrink-0 mt-2 w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs font-black flex items-center justify-center">
                {i + 1}
              </span>
              <textarea
                ref={(el) => {
                  rowRefs.current[i] = el;
                  if (el) autoResize(el);
                }}
                value={step}
                onChange={(e) => {
                  update(i, e.target.value);
                  autoResize(e.target);
                }}
                onKeyDown={(e) => handleKeyDown(e, i)}
                onPaste={(e) => handlePaste(e, i)}
                placeholder="Décris cette étape…"
                rows={1}
                className="flex-1 min-w-0 resize-none px-3 py-2 bg-white dark:bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 leading-relaxed"
              />
              <div className="shrink-0 flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  className="p-0.5 rounded text-slate-400 hover:text-orange-500 disabled:opacity-20 disabled:pointer-events-none"
                  title="Monter"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => move(i, 1)}
                  disabled={i === steps.length - 1}
                  className="p-0.5 rounded text-slate-400 hover:text-orange-500 disabled:opacity-20 disabled:pointer-events-none"
                  title="Descendre"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
              <button
                type="button"
                onClick={() => remove(i)}
                className="shrink-0 mt-2 p-1 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                title="Supprimer l'étape"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={() => insertAfter(steps.length - 1)}
            className="self-start flex items-center gap-1.5 mt-1 px-3 py-1.5 text-xs font-bold text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-xl transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Ajouter une étape
          </button>
        </div>

        <div className="shrink-0 px-5 py-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white text-sm font-black rounded-xl transition-colors"
          >
            Terminé
          </button>
        </div>
      </div>
    </div>
  );
};
