import { useState } from "react";
import { X, Upload, Loader2, RotateCw, AlertTriangle } from "lucide-react";
import { SyncScope, SyncPayload, detectScopes, SCOPE_LABELS } from "../../core/logic/sync/syncPayload";
import { importToApi, ImportResult } from "../../core/services/importService";
import { ScopeSelector } from "./components/scope/ScopeSelector";

export interface ImportModalProps {
  payload: SyncPayload;
  onClose: () => void;
}

const summaryLine = ({ summary }: ImportResult): string => {
  const parts: string[] = [];
  if (summary.planning) parts.push(`${summary.planning.slots} créneaux (${summary.planning.items} plats)`);
  if (summary.freezer) parts.push(`${summary.freezer.categories} catégories congélateur (${summary.freezer.items} items)`);
  if (summary.household) parts.push(`${summary.household.flags} articles ménagers`);
  return parts.length > 0 ? parts.join(" · ") : "Aucune donnée importée.";
};

export const ImportModal = ({ payload, onClose }: ImportModalProps) => {
  const available = detectScopes(payload);
  const [selected, setSelected] = useState<SyncScope[]>(available);
  const [isClosing, setIsClosing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  const handleClose = () => {
    if (submitting) return;
    setIsClosing(true);
    setTimeout(onClose, 300);
  };

  const handleImport = async () => {
    setSubmitting(true);
    try {
      const summary = await importToApi(payload, selected);
      setResult(summary);
    } catch {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
      <div className={`bg-white dark:bg-slate-100 w-full max-w-sm rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[90dvh] ${isClosing ? "modal-exit sm:modal-center-exit" : "modal-enter sm:modal-center-enter"}`}>
        <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-orange-50 dark:bg-orange-950/30 shrink-0">
          <div>
            <h2 className="text-lg font-black text-slate-900">{result ? "Import terminé" : "Importer"}</h2>
            <p className="text-orange-600 dark:text-orange-400 font-bold uppercase text-xs tracking-widest">
              {result ? "Résumé" : "Choisir les données"}
            </p>
          </div>
          <button aria-label="Fermer" onClick={handleClose} disabled={submitting} className="p-2 hover:bg-black/5 rounded-full transition-colors disabled:opacity-40">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        {result ? (
          <div className="p-5 flex flex-col gap-4 overflow-y-auto">
            <p className="text-sm text-slate-700 font-medium">{summaryLine(result)}</p>
            {result.anomalies.length > 0 && (
              <div className="flex flex-col gap-1.5 px-3 py-2.5 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                <span className="flex items-center gap-1.5 text-xs font-bold text-amber-700">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  {result.anomalies.length} ligne{result.anomalies.length > 1 ? "s" : ""} ignorée{result.anomalies.length > 1 ? "s" : ""}
                </span>
                <ul className="text-xs text-amber-700/90 list-disc pl-4 flex flex-col gap-0.5 max-h-40 overflow-y-auto">
                  {result.anomalies.map((a, i) => <li key={i}>{a}</li>)}
                </ul>
              </div>
            )}
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl transition-colors flex items-center justify-center gap-2"
            >
              <RotateCw size={18} />
              Recharger l'application
            </button>
          </div>
        ) : (
          <div className="p-5 flex flex-col gap-4 overflow-y-auto">
            <p className="text-sm text-slate-500">
              L'import <strong>remplace</strong> les données des domaines sélectionnés (planning, congélateur, ménager). Les domaines non cochés ne sont pas touchés.
            </p>
            <ScopeSelector selected={selected} available={available} onChange={setSelected} />
            {available.length === 0 && (
              <p className="text-xs text-slate-400">Ce fichier ne contient aucune donnée importable.</p>
            )}
            <button
              onClick={handleImport}
              disabled={selected.length === 0 || submitting}
              className="w-full py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-2xl transition-colors flex items-center justify-center gap-2"
            >
              {submitting ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
              {submitting ? "Import en cours…" : `Remplacer ${selected.map(s => SCOPE_LABELS[s].label.toLowerCase()).join(", ") || "les données"}`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
