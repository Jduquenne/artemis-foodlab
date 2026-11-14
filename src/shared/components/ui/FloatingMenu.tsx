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
        const closeOnOutsideScroll = (event: Event) => {
            if (event.target instanceof Node && menuRef.current?.contains(event.target)) return;
            onClose();
        };
        window.addEventListener("scroll", closeOnOutsideScroll, true);
        window.addEventListener("resize", onClose);
        return () => {
            window.removeEventListener("scroll", closeOnOutsideScroll, true);
            window.removeEventListener("resize", onClose);
        };
    }, [open, onClose, menuRef]);

    if (!open) return null;

    return createPortal(
        <>
            <div className="fixed inset-0 z-40" onClick={onClose} />
            <div
                ref={menuRef}
                onClick={(e) => e.stopPropagation()}
                className={`fixed top-0 left-0 invisible z-50 bg-surface border border-slate-200 rounded-2xl shadow-lg overflow-hidden min-w-44 ${className ?? ""}`}
            >
                {children}
            </div>
        </>,
        document.body,
    );
};
