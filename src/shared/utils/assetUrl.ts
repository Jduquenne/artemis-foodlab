export function buildAssetUrl(path: string): string {
  return `${import.meta.env.BASE_URL}assets/${path}`;
}

export const LOGO_URL = buildAssetUrl("logo/logo-256.png");
