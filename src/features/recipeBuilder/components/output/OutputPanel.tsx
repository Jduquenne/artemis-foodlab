import { useState } from "react";
import { Copy, Check, X, FileCode2, CloudUpload, Loader2 } from "lucide-react";
import { RecipeBuilderState } from "../../../../core/domain/recipeBuilderTypes";
import { buildImageName, builderStateToRecipe, generateCsvOutput, generateIngredientListOutput } from "../../../../core/logic/recipeBuilder/recipeBuilderLogic";
import { useAdminAuthStore } from "../../../../shared/store/useAdminAuthStore";
import { saveRecipe } from "../../../../core/services/sheetsGatewayService";
import { syncFromGateway } from "../../../../core/services/recipesSyncService";

export interface OutputPanelProps {
  state: RecipeBuilderState;
}

interface OutputItem {
  key: string;
  label: string;
  value: string;
}


export const OutputPanel = ({ state }: OutputPanelProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const adminToken = useAdminAuthStore((s) => s.adminToken);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "done" | "error">("idle");

  const handleSave = async () => {
    if (!adminToken) return;
    setSaveState("saving");
    try {
      await saveRecipe(builderStateToRecipe(state), adminToken);
      await syncFromGateway();
      setSaveState("done");
      setTimeout(() => setSaveState("idle"), 2000);
    } catch {
      setSaveState("error");
      setTimeout(() => setSaveState("idle"), 3000);
    }
  };

  const outputs: OutputItem[] = [
    { key: "csv", label: "CSV", value: generateCsvOutput(state) },
    { key: "liste", label: "Liste ingrédients", value: generateIngredientListOutput(state) },
    { key: "photo", label: "Photo", value: buildImageName(state.categoryId, state.recipeNumber, state.name, "Photo") },
    { key: "recette", label: "Recette", value: buildImageName(state.categoryId, state.recipeNumber, state.name, "Recette") },
    { key: "ingredients", label: "Ingrédients", value: buildImageName(state.categoryId, state.recipeNumber, state.name, "Ingrédients") },
  ];

  const copy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => { setIsOpen(false); setIsClosing(false); }, 220);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        title="Sorties générées"
        className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-500 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-xl transition-colors"
      >
        <FileCode2 className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Sortie</span>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <div
            className={`w-full max-w-lg bg-white dark:bg-slate-100 rounded-2xl shadow-2xl flex flex-col overflow-hidden ${isClosing ? "modal-center-exit" : "modal-center-enter"}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-slate-100">
              <p className="text-xs font-black text-orange-600 uppercase tracking-widest">
                Sorties générées
              </p>
              <button
                type="button"
                onClick={handleClose}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {adminToken && (
              <div className="px-5 pt-4 shrink-0">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saveState === "saving"}
                  className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                    saveState === "error"
                      ? "bg-red-50 text-red-600 dark:bg-red-900/20"
                      : saveState === "done"
                        ? "bg-green-50 text-green-600 dark:bg-green-900/20"
                        : "bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-60"
                  }`}
                >
                  {saveState === "saving" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : saveState === "done" ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <CloudUpload className="w-4 h-4" />
                  )}
                  {saveState === "saving"
                    ? "Enregistrement…"
                    : saveState === "done"
                      ? "Enregistré"
                      : saveState === "error"
                        ? "Échec — réessayer"
                        : "Enregistrer dans le tableur"}
                </button>
              </div>
            )}

            <div className="px-5 py-4 flex flex-col gap-4 overflow-y-auto">
              {outputs.map(({ key, label, value }) => (
                <div key={key} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-wide">{label}</span>
                    <button
                      type="button"
                      onClick={() => copy(value, key)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${copiedKey === key
                          ? "text-green-600 bg-green-50 dark:bg-green-900/20"
                          : "text-slate-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                        }`}
                    >
                      {copiedKey === key ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {copiedKey === key ? "Copié" : "Copier"}
                    </button>
                  </div>
                  <div className="px-3 py-2 bg-slate-50 dark:bg-slate-200 border border-slate-200 rounded-xl text-[11px] font-mono text-slate-700 break-all whitespace-pre-wrap">
                    {value || <span className="text-slate-400 italic">—</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
