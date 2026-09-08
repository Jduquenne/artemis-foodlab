import { RefObject, useLayoutEffect, useRef } from "react";

const VIEWPORT_MARGIN = 8;
const ANCHOR_GAP = 4;

export const useFloatingMenuPosition = (anchorRef: RefObject<HTMLElement | null>, open: boolean) => {
    const menuRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        const menu = menuRef.current;
        const anchor = anchorRef.current;
        if (!open || !menu || !anchor) return;

        const anchorRect = anchor.getBoundingClientRect();
        const menuRect = menu.getBoundingClientRect();

        const spaceBelow = window.innerHeight - anchorRect.bottom;
        const openUpward = spaceBelow < menuRect.height + ANCHOR_GAP + VIEWPORT_MARGIN
            && anchorRect.top > menuRect.height + ANCHOR_GAP + VIEWPORT_MARGIN;

        const left = Math.min(
            Math.max(VIEWPORT_MARGIN, anchorRect.right - menuRect.width),
            window.innerWidth - menuRect.width - VIEWPORT_MARGIN,
        );
        const top = openUpward
            ? anchorRect.top - menuRect.height - ANCHOR_GAP
            : anchorRect.bottom + ANCHOR_GAP;

        menu.style.top = `${top}px`;
        menu.style.left = `${left}px`;
        menu.style.visibility = "visible";
    }, [open, anchorRef]);

    return menuRef;
};
