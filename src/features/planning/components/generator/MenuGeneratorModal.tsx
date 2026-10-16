import { useState } from "react";
import { ArrowLeft, Loader2, RefreshCw, Sparkles, X } from "lucide-react";
import { MenuGeneratorSettings } from "../../../../core/domain/menuGenerator";
import { defaultGeneratorSettings, validateGeneratorSettings } from "../../../../core/logic/menuGenerator/generatorSettingsLogic";
import { countGeneratedMeals } from "../../../../core/logic/menuGenerator/menuPreviewLogic";
import { MENU_GENERATOR_PENDING_KEY, useMenuGenerator } from "../../../../shared/hooks/useMenuGenerator";
import { usePendingKey } from "../../../../shared/hooks/usePendingKey";
import { GeneratorSettingsForm } from "./GeneratorSettingsForm";
import { GeneratorPreview } from "./GeneratorPreview";

export interface MenuGeneratorModalProps {
  startDate: string;
  onClose: () => void;
}

export const MenuGeneratorModal = ({ startDate, onClose }: MenuGeneratorModalProps) => {
  const [settings, setSettings] = useState<MenuGeneratorSettings>(() => defaultGeneratorSettings(startDate));
  const [error, setError] = useState<string | null>(null);
  const { run, generate, reset } = useMenuGenerator();
  const pending = usePendingKey(MENU_GENERATOR_PENDING_KEY);

  const launch = async () => {
    const problem = validateGeneratorSettings(settings);
    setError(problem);
    if (!problem) await generate(settings);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90dvh]">
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-slate-100">
          <div>
            <p className="text-xs font-black text-orange-600 uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles size={12} /> Générer des menus
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {run ? `${countGeneratedMeals(run.meals)} repas proposés` : "Déjeuners et dîners de la période"}
            </p>
          </div>
          <button onClick={onClose} aria-label="Fermer" className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-muted transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4">
          {run ? (
            <GeneratorPreview meals={run.meals} />
          ) : (
            <GeneratorSettingsForm settings={settings} disabled={pending} onChange={setSettings} />
          )}
          {error && <p className="mt-3 text-xs font-semibold text-red-500">{error}</p>}
        </div>

        <div className="flex gap-2 px-5 pb-5 pt-3 border-t border-slate-100">
          {run ? (
            <>
              <button
                onClick={reset}
                disabled={pending}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-muted transition-colors disabled:opacity-50"
              >
                <ArrowLeft size={15} /> Réglages
              </button>
              <button
                onClick={() => generate(run.settings)}
                disabled={pending}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-bold hover:bg-orange-600 transition-colors disabled:opacity-50"
              >
                {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw size={15} />}
                Autre proposition
              </button>
            </>
          ) : (
            <button
              onClick={launch}
              disabled={pending}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-bold hover:bg-orange-600 transition-colors disabled:opacity-50"
            >
              {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles size={15} />}
              Générer
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
