import { useState } from "react";
import { FlaskConical, LogOut } from "lucide-react";
import { logout } from "../../../core/services/authService";
import { formatDemoRemaining } from "../../../core/logic/auth/demoLogic";
import { useDemoCountdown } from "../../hooks/useDemoCountdown";
import { useAuthStore } from "../../store/useAuthStore";

export interface DemoBannerProps {
  expiresAt: string;
}

export const DemoBanner = ({ expiresAt }: DemoBannerProps) => {
  const remainingMs = useDemoCountdown(expiresAt);
  const setUser = useAuthStore((s) => s.setUser);
  const setStatus = useAuthStore((s) => s.setStatus);
  const [leaving, setLeaving] = useState(false);

  const leaveDemo = async () => {
    setLeaving(true);
    await logout().catch(() => undefined);
    setUser(null);
    setStatus("unauthenticated");
  };

  return (
    <div className="shrink-0 flex items-center gap-2 px-3 sm:px-4 py-1.5 bg-amber-100 dark:bg-amber-900/40 border-b border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200">
      <FlaskConical size={14} className="shrink-0" />
      <p className="flex-1 min-w-0 text-xs font-medium truncate">
        <span className="font-bold">Mode démo</span>
        <span className="hidden sm:inline"> · tes modifications seront effacées</span>
        <span> · reste {formatDemoRemaining(remainingMs)}</span>
      </p>
      <button
        type="button"
        onClick={leaveDemo}
        disabled={leaving}
        className="shrink-0 flex items-center gap-1 text-xs font-bold hover:text-amber-950 dark:hover:text-amber-50 transition-colors disabled:opacity-50"
      >
        <LogOut size={13} />
        <span className="hidden sm:inline">Quitter la démo</span>
        <span className="sm:hidden">Quitter</span>
      </button>
    </div>
  );
};
