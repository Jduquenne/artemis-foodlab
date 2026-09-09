const WEBP_QUALITY = 0.95;

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function encodeWebp(img: HTMLImageElement): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no 2d context");
  ctx.drawImage(img, 0, 0);
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("toBlob failed"))),
      "image/webp",
      WEBP_QUALITY,
    );
  });
}

function extensionOf(source: File | string): string {
  const name = typeof source === "string" ? source.split("?")[0] : source.name;
  const match = /\.([a-z0-9]+)$/i.exec(name);
  return match ? match[1].toLowerCase() : "jpg";
}

export async function downloadImageAsWebp(source: File | string, filename: string): Promise<void> {
  let objectUrl: string | null = null;
  let rawBlob: Blob | null = null;
  try {
    let src: string;
    if (typeof source === "string") {
      const resp = await fetch(source);
      if (!resp.ok) throw new Error(`fetch ${resp.status}`);
      rawBlob = await resp.blob();
      objectUrl = URL.createObjectURL(rawBlob);
      src = objectUrl;
    } else {
      rawBlob = source;
      objectUrl = URL.createObjectURL(source);
      src = objectUrl;
    }
    const img = await loadImage(src);
    const webp = await encodeWebp(img);
    triggerDownload(webp, `${filename}.webp`);
  } catch {
    if (rawBlob) {
      triggerDownload(rawBlob, `${filename}.${extensionOf(source)}`);
    } else {
      throw new Error("image export failed");
    }
  } finally {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
  }
}
