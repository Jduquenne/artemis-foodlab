import { lazy, Suspense, useRef, useState } from "react";
import { Settings, Upload, Bell, UserCircle } from "lucide-react";
import { isValidSyncPayload, SyncPayload } from "../../../core/logic/sync/syncPayload";
import { ThemeToggle } from "./ThemeToggle";

const ImportModal = lazy(() => import("../../../features/sync/ImportModal").then(m => ({ default: m.ImportModal })));
const NotificationSettingsModal = lazy(() => import("../ui/NotificationSettingsModal").then(m => ({ default: m.NotificationSettingsModal })));
const AccountModal = lazy(() => import("../ui/AccountModal").then(m => ({ default: m.AccountModal })));

export const SettingsPopover = () => {
  const [open, setOpen] = useState(false);
  const [importModalData, setImportModalData] = useState<unknown>(null);
  const [notifSettingsOpen, setNotifSettingsOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      if (!isValidSyncPayload(parsed)) {
        alert("Ce fichier n'est pas une sauvegarde Artemis Foodlab valide.");
        return;
      }
      setImportModalData(parsed);
    } catch {
      alert("Impossible de lire ce fichier de sauvegarde.");
    } finally {
      e.target.value = "";
    }
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
                onClick={() => { setAccountOpen(true); setOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-200 transition-colors"
              >
                <UserCircle className="w-4 h-4 text-slate-400 shrink-0" />
                Compte
              </button>
              <button
                onClick={() => { fileInputRef.current?.click(); setOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-200 transition-colors border-t border-slate-100"
              >
                <Upload className="w-4 h-4 text-slate-400 shrink-0" />
                Importer des données
              </button>
              <button
                onClick={() => { setNotifSettingsOpen(true); setOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-200 transition-colors border-t border-slate-100"
              >
                <Bell className="w-4 h-4 text-slate-400 shrink-0" />
                Notifications
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
        {!!importModalData && isValidSyncPayload(importModalData) && (
          <ImportModal
            payload={importModalData as SyncPayload}
            onClose={() => setImportModalData(null)}
          />
        )}

        {notifSettingsOpen && <NotificationSettingsModal onClose={() => setNotifSettingsOpen(false)} />}

        {accountOpen && <AccountModal onClose={() => setAccountOpen(false)} />}
      </Suspense>
    </>
  );
};
