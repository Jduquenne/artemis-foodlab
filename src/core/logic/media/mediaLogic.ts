import { RecipeAsset, RecipeAssetKey } from "../../domain/recipe";

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

export function earliestExpiry(current: string | null, next: string | null): string | null {
  if (!current) return next || null;
  if (!next) return current;
  return new Date(current).getTime() <= new Date(next).getTime() ? current : next;
}

export function refreshDelayMs(expiresAt: string, now: number = Date.now()): number {
  const target = new Date(expiresAt).getTime() - MEDIA_REFRESH_MARGIN_MS;
  return Math.max(MEDIA_REFRESH_MIN_MS, target - now);
}

export function isMediaRefreshDue(expiresAt: string, now: number = Date.now()): boolean {
  return now >= new Date(expiresAt).getTime() - MEDIA_REFRESH_MARGIN_MS;
}

export function isMediaExpired(expiresAt: string | null, now: number = Date.now()): boolean {
  return expiresAt !== null && now >= new Date(expiresAt).getTime();
}

export const MAX_PHOTO_SIZE = 10 * 1024 * 1024;

export function validatePhotoFile(file: Pick<File, "type" | "size">): string | null {
  if (!file.type.startsWith("image/")) return "Le fichier doit être une image.";
  if (file.size > MAX_PHOTO_SIZE) return "Image trop lourde (10 Mo max).";
  return null;
}
