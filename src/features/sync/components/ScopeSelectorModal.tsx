import { useState } from "react";
import { X, Download, Upload } from "lucide-react";
import { SyncScope, ALL_SCOPES } from "../../../core/services/dataService";
import { ScopeSelector } from "./ScopeSelector";

export interface ScopeSelectorModalProps {
  mode: "export" | "import";
  availableScopes?: SyncScope[];
  onConfirm: (scope: SyncScope[]) => void | Promise<void>;
  onClose: () => void;
}

export const ScopeSelectorModal = ({ mode, availableScopes = ALL_SCOPES, onConfirm, onClose }: ScopeSelectorModalProps) => {
  const [selected, setSelected] = useState<SyncScope[]>(availableScopes);

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-100 w-full max-w-sm rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[90dvh]">
        <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-orange-50 dark:bg-orange-950/30 shrink-0">
          <div>
            <h2 className="text-lg font-black text-slate-900">
              {mode === "export" ? "Sauvegarder" : "Importer"}
            </h2>
            <p className="text-orange-600 dark:text-orange-400 font-bold uppercase text-xs tracking-widest">
              Choisir les données
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>
        <div className="p-5 flex flex-col gap-4 overflow-y-auto">
          <p className="text-sm text-slate-500">
            {mode === "export"
              ? "Sélectionne les données à inclure dans la sauvegarde."
              : "Sélectionne les données à importer. Les autres resteront inchangées."}
          </p>
          <ScopeSelector selected={selected} available={availableScopes} onChange={setSelected} />
          <button
            onClick={() => onConfirm(selected)}
            disabled={selected.length === 0}
            className="w-full py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-2xl transition-colors flex items-center justify-center gap-2"
          >
            {mode === "export" ? <Download size={18} /> : <Upload size={18} />}
            {mode === "export" ? "Télécharger" : "Importer"}
          </button>
        </div>
      </div>
    </div>
  );
};
