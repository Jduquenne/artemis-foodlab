import { chunkMediaKeys } from "../logic/media/mediaLogic";
import { apiFetchJson } from "./apiClient";

interface MediaResolveResponse {
  urls: Record<string, string>;
  expiresAt: string;
}

export interface MediaResolveResult {
  urls: Record<string, string>;
  expiresAt: string;
  attemptedKeys: string[];
}

export async function resolveMediaKeys(keys: string[]): Promise<MediaResolveResult> {
  const chunks = chunkMediaKeys(keys);
  if (chunks.length === 0) return { urls: {}, expiresAt: "", attemptedKeys: [] };

  const settled = await Promise.all(
    chunks.map(async (chunk) => {
      try {
        const response = await apiFetchJson<MediaResolveResponse>("/media/resolve", {
          method: "POST",
          body: { keys: chunk },
          suppressGlobalError: true,
        });
        return { ok: true, chunk, urls: response.urls, expiresAt: response.expiresAt };
      } catch {
        return { ok: false, chunk, urls: {} as Record<string, string>, expiresAt: "" };
      }
    }),
  );

  const urls = Object.assign({}, ...settled.map((entry) => entry.urls));
  const attemptedKeys = settled.filter((entry) => entry.ok).flatMap((entry) => entry.chunk);
  const expiresAt = settled
    .map((entry) => entry.expiresAt)
    .filter(Boolean)
    .sort()[0] ?? "";

  return { urls, expiresAt, attemptedKeys };
}
