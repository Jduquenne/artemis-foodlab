import { useRef, useState } from "react";
import { Settings, Download, Upload, RefreshCw } from "lucide-react";
import { exportData, importData } from "../../../core/services/dataService";
import { ThemeToggle } from "./ThemeToggle";
import { SyncModal } from "../../../features/sync/SyncModal";

export const SettingsPopover = () => {
  const [open, setOpen] = useState(false);
  const [syncOpen, setSyncOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <div className="relative">
        <input
          type="file"
          accept=".json"
          ref={fileInputRef}
          className="hidden"
          onChange={(e) => e.target.files && importData(e.target.files[0])}
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
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <div className="absolute bottom-0 left-full ml-3 z-20 bg-white dark:bg-slate-100 border border-slate-200 rounded-2xl shadow-xl overflow-hidden w-52">
              <button
                onClick={() => { exportData(); setOpen(false); }}
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
            </div>
          </>
        )}
      </div>

      {syncOpen && <SyncModal onClose={() => setSyncOpen(false)} />}
    </>
  );
};
