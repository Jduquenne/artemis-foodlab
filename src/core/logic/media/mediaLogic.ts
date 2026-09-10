import { RecipeAsset, RecipeAssetKey } from "../../domain/types";

export const MEDIA_RESOLVE_MAX_KEYS = 200;
export const MEDIA_REFRESH_MARGIN_MS = 5 * 60 * 1000;
export const MEDIA_REFRESH_MIN_MS = 60 * 1000;

export function chunkMediaKeys(keys: string[]): string[][] {
  const unique = [...new Set(keys.filter(Boolean))];
  const chunks: string[][] = [];
  for (let i = 0; i < unique.length; i += MEDIA_RESOLVE_MAX_KEYS) {
    chunks.push(unique.slice(i, i + MEDIA_RESOLVE_MAX_KEYS));
  }
  return chunks;
}

export function collectAssetKeys(
  assetsList: Partial<Record<RecipeAssetKey, RecipeAsset>>[],
): string[] {
  const keys: string[] = [];
  for (const assets of assetsList) {
    for (const asset of Object.values(assets)) {
      if (asset?.key) keys.push(asset.key);
    }
  }
  return keys;
}

export function refreshDelayMs(expiresAt: string, now: number = Date.now()): number {
  const target = new Date(expiresAt).getTime() - MEDIA_REFRESH_MARGIN_MS;
  return Math.max(MEDIA_REFRESH_MIN_MS, target - now);
}
