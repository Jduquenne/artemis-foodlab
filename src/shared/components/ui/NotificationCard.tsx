import { useCallback, useEffect, useRef, useState } from "react";
import { X, Bell } from "lucide-react";
import { useNotificationStore, AppNotification } from "../../store/useNotificationStore";

export interface NotificationCardProps {
    notification: AppNotification;
}

export const NotificationCard = ({ notification }: NotificationCardProps) => {
    const dismiss = useNotificationStore((s) => s.dismiss);
    const barRef = useRef<HTMLDivElement>(null);
    const rafRef = useRef<number>(0);
    const [isLeaving, setIsLeaving] = useState(false);
    const leavingRef = useRef(false);

    const handleDismiss = useCallback(() => {
        if (leavingRef.current) return;
        leavingRef.current = true;
        setIsLeaving(true);
        setTimeout(dismiss, 280);
    }, [dismiss]);

    useEffect(() => {
        const start = Date.now();
        const { duration } = notification;

        const tick = () => {
            const pct = Math.max(0, 1 - (Date.now() - start) / duration);
            if (barRef.current) barRef.current.style.width = `${pct * 100}%`;
            if (pct > 0) {
                rafRef.current = requestAnimationFrame(tick);
            } else {
                handleDismiss();
            }
        };

        rafRef.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(rafRef.current);
    }, [notification, handleDismiss]);

    const handleAction = (onClick: () => void) => {
        onClick();
        handleDismiss();
    };

    return (
        <div className="fixed top-0 inset-x-0 z-50 flex justify-center items-start pt-3 px-4 pointer-events-none">
            <div className={`w-full max-w-115 bg-white dark:bg-slate-100 rounded-2xl shadow-2xl border border-slate-200 overflow-hidden pointer-events-auto ${isLeaving ? 'notif-exit' : 'notif-enter'}`}>
                <div className="flex items-start gap-3 px-4 pt-4 pb-3">
                    <Bell className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                    <p className="flex-1 text-sm font-medium text-slate-700 leading-snug">
                        {notification.message}
                    </p>
                    <button
                        onClick={handleDismiss}
                        className="shrink-0 p-0.5 text-slate-400 hover:text-slate-600 transition-colors rounded-lg"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="flex gap-2 px-4 pb-4">
                    <button
                        onClick={() => handleAction(notification.actions[0].onClick)}
                        className="flex-1 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-xl transition-colors"
                    >
                        {notification.actions[0].label}
                    </button>
                    <button
                        onClick={() => handleAction(notification.actions[1].onClick)}
                        className="flex-1 py-2 bg-slate-100 dark:bg-slate-200 hover:bg-slate-200 dark:hover:bg-slate-300 text-slate-600 text-sm font-bold rounded-xl transition-colors"
                    >
                        {notification.actions[1].label}
                    </button>
                </div>

                <div className="h-1 bg-slate-100 dark:bg-slate-200">
                    <div ref={barRef} className="h-full bg-orange-400" style={{ width: "100%" }} />
                </div>
            </div>
        </div>
    );
};
