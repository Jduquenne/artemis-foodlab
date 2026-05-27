const EXPORT_PIXEL_RATIO = 3;
const WEBP_QUALITY = 0.95;

const fontDataCache = new Map<string, string>();

async function fetchFontDataUrl(url: string): Promise<string | null> {
  if (fontDataCache.has(url)) return fontDataCache.get(url)!;
  try {
    const resp = await fetch(url);
    if (!resp.ok) return null;
    const blob = await resp.blob();
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    fontDataCache.set(url, dataUrl);
    return dataUrl;
  } catch {
    return null;
  }
}

async function buildFontStyleTag(): Promise<string> {
  await document.fonts.ready;
  const rules: string[] = [];
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      for (const rule of Array.from(sheet.cssRules)) {
        if (!rule.cssText.startsWith("@font-face")) continue;
        let cssText = rule.cssText;
        const urlMatches = [...cssText.matchAll(/url\(["']?([^"')]+)["']?\)/g)];
        for (const match of urlMatches) {
          const absoluteUrl = new URL(match[1], window.location.href).href;
          const dataUrl = await fetchFontDataUrl(absoluteUrl);
          if (dataUrl) cssText = cssText.replace(match[0], `url("${dataUrl}")`);
        }
        rules.push(cssText);
      }
    } catch { /* feuille cross-origin inaccessible */ }
  }
  return rules.length ? `<style>${rules.join("\n")}</style>` : "";
}

async function svgToWebpBlob(svgString: string, width: number, height: number): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = width * EXPORT_PIXEL_RATIO;
  canvas.height = height * EXPORT_PIXEL_RATIO;
  const ctx = canvas.getContext("2d")!;

  const fontStyle = await buildFontStyleTag();
  const enrichedSvg = fontStyle ? svgString.replace("<defs>", `<defs>${fontStyle}`) : svgString;

  const svgBlob = new Blob([enrichedSvg], { type: "image/svg+xml;charset=utf-8" });
  const blobUrl = URL.createObjectURL(svgBlob);
  try {
    await new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve();
      };
      img.onerror = reject;
      img.src = blobUrl;
    });
  } finally {
    URL.revokeObjectURL(blobUrl);
  }

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("toBlob failed"))),
      "image/webp",
      WEBP_QUALITY
    );
  });
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function downloadSingleCard(
  svgString: string,
  width: number,
  height: number,
  filename: string
): Promise<void> {
  const blob = await svgToWebpBlob(svgString, width, height);
  triggerDownload(blob, `${filename}.webp`);
}

export interface CardExportSpec {
  svg: string;
  w: number;
  h: number;
  suffix: string;
}

export async function downloadAllCards(cards: CardExportSpec[], baseName: string): Promise<void> {
  const results: { blob: Blob; filename: string }[] = [];
  for (const card of cards) {
    const blob = await svgToWebpBlob(card.svg, card.w, card.h);
    results.push({ blob, filename: `${baseName}_${card.suffix}.webp` });
  }
  results.forEach(({ blob, filename }, i) => {
    setTimeout(() => triggerDownload(blob, filename), i * 150);
  });
}
