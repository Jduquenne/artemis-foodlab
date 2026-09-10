import { RecipeAsset } from "../../core/domain/types";
import { useMediaStore } from "../store/useMediaStore";

export function useMediaSrc(asset: RecipeAsset | undefined): string | undefined {
  const override = useMediaStore((state) => (asset?.key ? state.overrides[asset.key] : undefined));
  return override ?? asset?.url;
}
