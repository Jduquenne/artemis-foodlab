import { useState } from "react";
import { X, Bell, HardDrive, RefreshCw } from "lucide-react";
import { useNotificationSettingsStore } from "../../store/useNotificationSettingsStore";

export interface NotificationSettingsModalProps {
  onClose: () => void;
}

interface ToggleRowProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

const ToggleRow = ({ icon, label, description, enabled, onChange }: ToggleRowProps) => (
  <div className="flex items-center gap-4 py-4">
    <div className="shrink-0 w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-200 flex items-center justify-center text-slate-500">
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-slate-800">{label}</p>
      <p className="text-xs text-slate-400 mt-0.5">{description}</p>
    </div>
    <button
      onClick={() => onChange(!enabled)}
      aria-pressed={enabled}
      className={`shrink-0 relative w-11 h-6 rounded-full transition-colors duration-200 ${enabled ? "bg-orange-500" : "bg-slate-200 dark:bg-slate-300"}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${enabled ? "translate-x-5" : "translate-x-0"}`}
      />
    </button>
  </div>
);

export const NotificationSettingsModal = ({ onClose }: NotificationSettingsModalProps) => {
  const [isClosing, setIsClosing] = useState(false);
  const { backupReminderEnabled, versionCheckEnabled, setBackupReminderEnabled, setVersionCheckEnabled } =
    useNotificationSettingsStore();

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 300);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
      <div
        className={`bg-white dark:bg-slate-100 w-full max-w-sm rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden ${isClosing ? "modal-exit sm:modal-center-exit" : "modal-enter sm:modal-center-enter"}`}
      >
        <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-orange-50 dark:bg-orange-950/30 shrink-0">
          <div>
            <h2 className="text-lg font-black text-slate-900">Notifications</h2>
            <p className="text-orange-600 dark:text-orange-400 font-bold uppercase text-xs tracking-widest">
              Préférences
            </p>
          </div>
          <button aria-label="Fermer" onClick={handleClose} className="p-2 hover:bg-black/5 rounded-full transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <div className="px-5 divide-y divide-slate-100">
          <ToggleRow
            icon={<HardDrive size={18} />}
            label="Rappel de sauvegarde"
            description="Toutes les 30 minutes"
            enabled={backupReminderEnabled}
            onChange={setBackupReminderEnabled}
          />
          <ToggleRow
            icon={<RefreshCw size={18} />}
            label="Mise à jour disponible"
            description="Vérification toutes les 15 minutes"
            enabled={versionCheckEnabled}
            onChange={setVersionCheckEnabled}
          />
        </div>

        <div className="p-5 pt-3">
          <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 dark:bg-slate-200 rounded-xl">
            <Bell size={14} className="text-slate-400 shrink-0" />
            <p className="text-xs text-slate-400">Les modifications sont appliquées immédiatement.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
