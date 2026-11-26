import { MouseEvent, PointerEvent, useEffect, useRef } from "react";

export interface ModalBackdropProps {
  onPointerDown: (event: PointerEvent<HTMLElement>) => void;
  onClick: (event: MouseEvent<HTMLElement>) => void;
}

const openModals: symbol[] = [];

export function useModalDismiss(onDismiss: () => void, enabled = true): ModalBackdropProps {
  const latest = useRef({ onDismiss, enabled });
  const pressedOnBackdrop = useRef(false);

  useEffect(() => {
    latest.current = { onDismiss, enabled };
  });

  useEffect(() => {
    const token = Symbol("modal");
    openModals.push(token);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || openModals[openModals.length - 1] !== token) return;
      if (event.defaultPrevented || !latest.current.enabled) return;
      event.preventDefault();
      latest.current.onDismiss();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      openModals.splice(openModals.indexOf(token), 1);
    };
  }, []);

  return {
    onPointerDown: (event) => {
      pressedOnBackdrop.current = event.target === event.currentTarget;
    },
    onClick: (event) => {
      const fromBackdrop = pressedOnBackdrop.current && event.target === event.currentTarget;
      pressedOnBackdrop.current = false;
      if (fromBackdrop && latest.current.enabled) latest.current.onDismiss();
    },
  };
}
