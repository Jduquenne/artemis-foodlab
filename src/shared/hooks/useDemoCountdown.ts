import { useEffect, useState } from "react";
import { logout } from "../../core/services/authService";
import { DEMO_COUNTDOWN_TICK_MS, demoRemainingMs } from "../../core/logic/auth/demoLogic";
import { useAuthStore } from "../store/useAuthStore";
import { useNotificationStore } from "../store/useNotificationStore";

export function useDemoCountdown(expiresAt: string): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), DEMO_COUNTDOWN_TICK_MS);
    const expiry = setTimeout(async () => {
      await logout().catch(() => undefined);
      const { setUser, setStatus } = useAuthStore.getState();
      setUser(null);
      setStatus("unauthenticated");
      useNotificationStore.getState().push({
        message: "La démo est terminée, ses données ont été effacées. Tu peux en relancer une.",
        variant: "info",
        duration: 10000,
      });
    }, demoRemainingMs(expiresAt, Date.now()));
    return () => {
      clearInterval(tick);
      clearTimeout(expiry);
    };
  }, [expiresAt]);

  return demoRemainingMs(expiresAt, now);
}
