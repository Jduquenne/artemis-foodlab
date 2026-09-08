import { ReactNode, RefObject, useEffect } from "react";
import { createPortal } from "react-dom";
import { useFloatingMenuPosition } from "../../hooks/useFloatingMenuPosition";

export interface FloatingMenuProps {
    open: boolean;
    anchorRef: RefObject<HTMLElement | null>;
    onClose: () => void;
    children: ReactNode;
    className?: string;
}

export const FloatingMenu = ({ open, anchorRef, onClose, children, className }: FloatingMenuProps) => {
    const menuRef = useFloatingMenuPosition(anchorRef, open);

    useEffect(() => {
        if (!open) return;
        window.addEventListener("scroll", onClose, true);
        window.addEventListener("resize", onClose);
        return () => {
            window.removeEventListener("scroll", onClose, true);
            window.removeEventListener("resize", onClose);
        };
    }, [open, onClose]);

    if (!open) return null;

    return createPortal(
        <>
            <div className="fixed inset-0 z-40" onClick={onClose} />
            <div
                ref={menuRef}
                onClick={(e) => e.stopPropagation()}
                className={`fixed top-0 left-0 invisible z-50 bg-white dark:bg-slate-100 border border-slate-200 rounded-2xl shadow-lg overflow-hidden min-w-44 ${className ?? ""}`}
            >
                {children}
            </div>
        </>,
        document.body,
    );
};
