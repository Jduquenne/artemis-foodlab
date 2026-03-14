import { useNotificationStore } from "../../store/useNotificationStore";
import { NotificationCard } from "./NotificationCard";

export const NotificationBanner = () => {
    const current = useNotificationStore((s) => s.current);
    if (!current) return null;
    return <NotificationCard key={current.id} notification={current} />;
};
