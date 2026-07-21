import { useState } from "react";
import { X, KeyRound, Check } from "lucide-react";
import { useAdminAuthStore } from "../../store/useAdminAuthStore";

export interface AdminAccessModalProps {
  onClose: () => void;
}

export const AdminAccessModal = ({ onClose }: AdminAccessModalProps) => {
  const [isClosing, setIsClosing] = useState(false);
  const { adminToken, setAdminToken } = useAdminAuthStore();
  const [draft, setDraft] = useState(adminToken ?? "");

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 300);
  };

  const handleSave = () => {
    setAdminToken(draft.trim() || null);
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
      <div
        className={`bg-white dark:bg-slate-100 w-full max-w-sm rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden ${isClosing ? "modal-exit sm:modal-center-exit" : "modal-enter sm:modal-center-enter"}`}
      >
        <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-orange-50 dark:bg-orange-950/30 shrink-0">
          <div>
            <h2 className="text-lg font-black text-slate-900">Accès admin</h2>
            <p className="text-orange-600 dark:text-orange-400 font-bold uppercase text-xs tracking-widest">
              Écriture sur le tableur
            </p>
          </div>
          <button aria-label="Fermer" onClick={handleClose} className="p-2 hover:bg-black/5 rounded-full transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-3">
          <div className="relative">
            <KeyRound size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="password"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Token admin"
              className="w-full pl-9 pr-3 py-3 bg-slate-50 dark:bg-slate-200 border border-slate-200 rounded-2xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
            />
          </div>
          <p className="text-xs text-slate-400">
            Laisse vide pour repasser en lecture seule.
          </p>
          <button
            onClick={handleSave}
            className="w-full flex items-center justify-center gap-2 px-3 py-3 bg-orange-500 text-white font-bold rounded-2xl hover:bg-orange-600 transition-colors"
          >
            <Check size={16} />
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
};
