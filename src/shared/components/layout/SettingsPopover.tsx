import { lazy, Suspense, useRef, useState } from "react";
import { Settings, Download, Upload, RefreshCw } from "lucide-react";
import { applyImport, detectScopes, SyncPayload } from "../../../core/utils/syncSerializer";
import { exportData } from "../../../core/services/backupService";
import { ThemeToggle } from "./ThemeToggle";

const SyncModal = lazy(() => import("../../../features/sync/SyncModal").then(m => ({ default: m.SyncModal })));
const ScopeSelectorModal = lazy(() => import("../../../features/sync/components/ScopeSelectorModal").then(m => ({ default: m.ScopeSelectorModal })));

export const SettingsPopover = () => {
  const [open, setOpen] = useState(false);
  const [syncOpen, setSyncOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [importModalData, setImportModalData] = useState<SyncPayload | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text) as SyncPayload;
      setImportModalData(data);
    } catch {
      alert("Impossible de lire ce fichier de sauvegarde.");
    }
    e.target.value = "";
  };

  return (
    <>
      <div className="relative">
        <input
          type="file"
          accept=".json"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
        />
        <button
          onClick={() => setOpen((o) => !o)}
          title="Paramètres"
          className={`p-2.5 tablet:p-3 rounded-xl transition-colors ${
            open
              ? "bg-orange-100 dark:bg-orange-900/40 text-orange-600"
              : "text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-200 hover:text-slate-600"
          }`}
        >
          <Settings className="w-5 h-5" />
        </button>

        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <div className="absolute bottom-0 left-full ml-3 z-50 bg-white dark:bg-slate-100 border border-slate-200 rounded-2xl shadow-xl overflow-hidden w-52">
              <button
                onClick={() => { setExportModalOpen(true); setOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-200 transition-colors"
              >
                <Download className="w-4 h-4 text-slate-400 shrink-0" />
                Sauvegarder
              </button>
              <button
                onClick={() => { fileInputRef.current?.click(); setOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-200 transition-colors border-t border-slate-100"
              >
                <Upload className="w-4 h-4 text-slate-400 shrink-0" />
                Importer
              </button>
              <button
                onClick={() => { setSyncOpen(true); setOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-200 transition-colors border-t border-slate-100"
              >
                <RefreshCw className="w-4 h-4 text-slate-400 shrink-0" />
                Synchroniser
              </button>
              <div className="flex items-center justify-between px-4 py-1.5 border-t border-slate-100">
                <span className="text-sm text-slate-700">Thème</span>
                <ThemeToggle />
              </div>
              <div className="px-4 py-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400">Artemis Foodlab</span>
                <span className="text-xs font-mono text-slate-400">v{__APP_VERSION__}</span>
              </div>
            </div>
          </>
        )}
      </div>

      <Suspense>
        {syncOpen && <SyncModal onClose={() => setSyncOpen(false)} />}

        {exportModalOpen && (
          <ScopeSelectorModal
            mode="export"
            onConfirm={async (scope) => { await exportData(scope); setExportModalOpen(false); }}
            onClose={() => setExportModalOpen(false)}
          />
        )}

        {importModalData && (
          <ScopeSelectorModal
            mode="import"
            availableScopes={detectScopes(importModalData)}
            onConfirm={async (scope) => {
              await applyImport(importModalData, scope);
              window.location.reload();
            }}
            onClose={() => setImportModalData(null)}
          />
        )}
      </Suspense>
    </>
  );
};
