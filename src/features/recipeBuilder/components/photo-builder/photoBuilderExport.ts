import JSZip from "jszip";

async function svgToWebpBlob(svgString: string, width: number, height: number): Promise<Blob> {
  const pixelRatio = 3;
  const canvas = document.createElement("canvas");
  canvas.width = width * pixelRatio;
  canvas.height = height * pixelRatio;
  const ctx = canvas.getContext("2d")!;

  const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
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
      0.95
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

export async function downloadCardPack(cards: CardExportSpec[], baseName: string): Promise<void> {
  const zip = new JSZip();
  for (const card of cards) {
    const b = await svgToWebpBlob(card.svg, card.w, card.h);
    zip.file(`${baseName}_${card.suffix}.webp`, b);
  }
  const zipBlob = await zip.generateAsync({ type: "blob" });
  triggerDownload(zipBlob, `${baseName}.zip`);
}
