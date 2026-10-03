import { RefCallback, useCallback } from "react";

export function useImageErrorCapture(onError: (src: string) => void): RefCallback<HTMLElement> {
  return useCallback(
    (node: HTMLElement | null) => {
      if (!node) return;
      const handler = (event: Event) => {
        const target = event.target;
        if (!(target instanceof Element)) return;
        const src = target.getAttribute("href") ?? target.getAttribute("src");
        if (src) onError(src);
      };
      node.addEventListener("error", handler, true);
      return () => node.removeEventListener("error", handler, true);
    },
    [onError],
  );
}
