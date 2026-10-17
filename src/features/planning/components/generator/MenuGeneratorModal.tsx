import { useState } from "react";
import { CalendarPlus, Loader2, RefreshCw, Sparkles, X } from "lucide-react";
import { MenuGeneratorSettings } from "../../../../core/domain/menuGenerator";
import { BulkPlanningResult } from "../../../../core/domain/planning";
import {
  defaultGeneratorSettings,
  sameGeneratorSettings,
  validateGeneratorSettings,
} from "../../../../core/logic/menuGenerator/generatorSettingsLogic";
import { countGeneratedMeals } from "../../../../core/logic/menuGenerator/menuPreviewLogic";
import { MENU_GENERATOR_PENDING_KEY, MENU_GENERATOR_WRITE_PENDING_KEY, useMenuGenerator } from "../../../../shared/hooks/useMenuGenerator";
import { usePendingKey } from "../../../../shared/hooks/usePendingKey";
import { ChoicePills } from "./ChoicePills";
import { GeneratorPreview } from "./GeneratorPreview";
import { GeneratorSettingsForm } from "./GeneratorSettingsForm";

export interface MenuGeneratorModalProps {
  startDate: string;
  onClose: () => void;
  onAdded: (result: BulkPlanningResult, startDate: string) => void;
}

type MobileView = "settings" | "preview";

const MOBILE_VIEWS: readonly { id: MobileView; label: string }[] = [
  { id: "settings", label: "Réglages" },
  { id: "preview", label: "Aperçu" },
];

export const MenuGeneratorModal = ({ startDate, onClose, onAdded }: MenuGeneratorModalProps) => {
  const [settings, setSettings] = useState<MenuGeneratorSettings>(() => defaultGeneratorSettings(startDate));
  const [error, setError] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<MobileView>("settings");
  const { run, generate, reshuffle, regenerateMeal, toggleLock, write } = useMenuGenerator();
  const pending = usePendingKey(MENU_GENERATOR_PENDING_KEY);
  const writing = usePendingKey(MENU_GENERATOR_WRITE_PENDING_KEY);
  const mealCount = run ? countGeneratedMeals(run.meals) : 0;
  const stale = run !== null && !sameGeneratorSettings(run.settings, settings);
  const busy = pending || writing;

  const launch = async () => {
    const problem = validateGeneratorSettings(settings);
    setError(problem);
    if (problem) return;
    await generate(settings);
    setMobileView("preview");
  };

  const addToPlanning = async () => {
    if (!run) return;
    const result = await write();
    if (result) onAdded(result, run.settings.startDate);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center sm:p-4">
      <div className="bg-surface sm:rounded-2xl shadow-2xl w-full h-dvh sm:h-[92dvh] sm:max-w-[1600px] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between gap-3 px-5 pt-4 pb-3 border-b border-slate-100 shrink-0">
          <div className="min-w-0">
            <p className="text-xs font-black text-orange-600 uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles size={12} /> Générer des menus
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {run ? `${mealCount} repas proposés` : "Déjeuners et dîners de la période"}
            </p>
          </div>
          <div className="sm:hidden">
            <ChoicePills options={MOBILE_VIEWS} isActive={(id) => id === mobileView} onToggle={setMobileView} />
          </div>
          <button onClick={onClose} disabled={writing} aria-label="Fermer" className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-muted transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 min-h-0 flex tablet:flex-col">
          <aside
            className={`${mobileView === "settings" ? "flex" : "hidden"} sm:flex w-full sm:w-80 lg:w-96 shrink-0 flex-col gap-3 p-4 sm:border-r border-slate-100 tablet:w-full tablet:border-r-0 tablet:border-b tablet:max-h-[45dvh]`}
          >
            <div className="flex-1 min-h-0">
              <GeneratorSettingsForm settings={settings} disabled={busy} onChange={setSettings} />
            </div>
            {error && <p className="text-xs font-semibold text-red-500">{error}</p>}
            <button
              onClick={launch}
              disabled={busy}
              className="shrink-0 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-bold hover:bg-orange-600 transition-colors disabled:opacity-50"
            >
              {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles size={15} />}
              {run ? "Régénérer" : "Générer"}
            </button>
          </aside>

          <section className={`${mobileView === "preview" ? "flex" : "hidden"} sm:flex flex-1 min-w-0 min-h-0 flex-col`}>
            <div className="flex-1 min-h-0 overflow-y-auto sm:overflow-hidden p-4">
              {run ? (
                <GeneratorPreview
                  days={run.context.days}
                  slots={run.settings.slots}
                  meals={run.meals}
                  existing={run.context.existing}
                  onToggleLock={toggleLock}
                  onRegenerate={regenerateMeal}
                />
              ) : (
                <div className="h-full flex flex-col items-center justify-center gap-2 text-center text-slate-400">
                  <Sparkles size={28} className="text-orange-300" />
                  <p className="text-sm font-semibold">Règle tes options puis lance « Générer ».</p>
                  <p className="text-xs">L'aperçu s'affiche ici. Rien n'est écrit dans le planning avant « Ajouter au planning ».</p>
                </div>
              )}
            </div>

            <div className="shrink-0 flex flex-wrap items-center gap-2 px-4 py-3 border-t border-slate-100">
              <p className="flex-1 min-w-0 text-[11px] font-semibold text-amber-600">
                {stale && "Réglages modifiés : « Régénérer » pour les appliquer."}
              </p>
              <button
                onClick={reshuffle}
                disabled={!run || busy}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-muted transition-colors disabled:opacity-50"
              >
                <RefreshCw size={15} />
                <span className="hidden sm:inline">Autre proposition</span>
              </button>
              <button
                onClick={addToPlanning}
                disabled={!run || busy || mealCount === 0}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-bold hover:bg-orange-600 transition-colors disabled:opacity-50"
              >
                {writing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CalendarPlus size={15} />}
                Ajouter au planning ({mealCount})
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
