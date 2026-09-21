import { RecetteCardData, RecetteBookCardData } from "../../../core/domain/cardTypes";
import { buildRecetteSvg, buildRecetteBookSvg } from "./cardSvg";

const EXPORT_SCALE = 3;
const CARD_WIDTH = 559;
const CARD_HEIGHT = 397;

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
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function readAsDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function toDataUrl(source: File | string): Promise<string> {
  if (typeof source !== "string") return readAsDataUrl(source);
  if (!source || source.startsWith("data:")) return source;
  const resp = await fetch(source);
  if (!resp.ok) throw new Error(`fetch ${resp.status}`);
  return readAsDataUrl(await resp.blob());
}

async function rasterizeSvg(svgContent: string): Promise<Blob> {
  const svgBlob = new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);
  try {
    const img = await loadImage(url);
    const canvas = document.createElement("canvas");
    canvas.width = CARD_WIDTH * EXPORT_SCALE;
    canvas.height = CARD_HEIGHT * EXPORT_SCALE;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("no 2d context");
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return new Promise((resolve, reject) => {
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/png");
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function downloadRecetteCard(
  data: RecetteCardData,
  imageSource: File | string,
  filename: string,
): Promise<void> {
  const imageHref = imageSource ? await toDataUrl(imageSource) : "";
  const svg = buildRecetteSvg({ ...data, imageHref });
  const blob = await rasterizeSvg(svg);
  triggerDownload(blob, `${filename}.png`);
}

export async function downloadRecetteBookCard(
  data: RecetteBookCardData,
  imageSource: File | string,
  bookImageSource: File | string,
  filename: string,
): Promise<void> {
  const [imageHref, bookImageHref] = await Promise.all([
    imageSource ? toDataUrl(imageSource) : "",
    bookImageSource ? toDataUrl(bookImageSource) : "",
  ]);
  const svg = buildRecetteBookSvg({ ...data, imageHref, bookImageHref });
  const blob = await rasterizeSvg(svg);
  triggerDownload(blob, `${filename}.png`);
}
