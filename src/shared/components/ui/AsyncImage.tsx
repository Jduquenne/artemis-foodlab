import { useCallback, useState } from "react";
import { ImageOff } from "lucide-react";
import { RecipeAsset } from "../../../core/domain/types";
import { useMediaSrc } from "../../hooks/useMediaSrc";
import { useMediaStore } from "../../store/useMediaStore";

export interface AsyncImageProps {
  src?: string | undefined;
  asset?: RecipeAsset;
  alt: string;
  className?: string;
  wrapperClassName?: string;
  eager?: boolean;
  fill?: boolean;
}

export const AsyncImage = ({ src, asset, alt, className = "", wrapperClassName = "", eager = false, fill = false }: AsyncImageProps) => {
  const [loadedSrc, setLoadedSrc] = useState<string>();
  const [erroredSrc, setErroredSrc] = useState<string>();

  const resolvedSrc = useMediaSrc(asset) ?? src;

  const measure = useCallback(
    (node: HTMLImageElement | null) => {
      if (!node?.complete || !resolvedSrc) return;
      if (node.naturalWidth > 0) setLoadedSrc(resolvedSrc);
      else setErroredSrc(resolvedSrc);
    },
    [resolvedSrc],
  );

  const handleError = useCallback(() => {
    setErroredSrc(resolvedSrc);
    useMediaStore.getState().reportFailure(asset?.key);
  }, [resolvedSrc, asset?.key]);

  const status = !resolvedSrc ? "error" : loadedSrc === resolvedSrc ? "loaded" : erroredSrc === resolvedSrc ? "error" : "loading";
  const position = fill ? "absolute inset-0" : "relative";

  return (
    <div className={`${position} overflow-hidden bg-slate-200 ${wrapperClassName}`}>
      {status === "loading" && <div className="absolute inset-0 animate-pulse bg-slate-200" />}
      {status === "error" ? (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100 text-slate-300">
          <ImageOff className="h-1/3 w-1/3" />
        </div>
      ) : (
        <img
          ref={measure}
          src={resolvedSrc}
          alt={alt}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          onLoad={() => setLoadedSrc(resolvedSrc)}
          onError={handleError}
          className={`absolute inset-0 h-full w-full transition-opacity duration-500 ${status === "loaded" ? "opacity-100" : "opacity-0"} ${className}`}
        />
      )}
    </div>
  );
};
