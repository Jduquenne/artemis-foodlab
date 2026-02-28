import { useEffect, useRef, useCallback, useState } from "react";
import { CameraOff, Camera } from "lucide-react";
import jsQR from "jsqr";

interface QRScannerProps {
  onScan: (data: string) => void;
  active: boolean;
}

export const QRScanner = ({ onScan, active }: QRScannerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  const scannedRef = useRef(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);

  const stopStream = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => {
    if (!active) { stopStream(); return; }
    scannedRef.current = false;
    setCameraError(null);
    setPhotoError(null);

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment" } })
      .then(stream => {
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        const scan = () => {
          if (scannedRef.current) return;
          const video = videoRef.current;
          const canvas = canvasRef.current;
          if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext("2d")!;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height);
            if (code?.data) {
              scannedRef.current = true;
              stopStream();
              onScan(code.data);
              return;
            }
          }
          rafRef.current = requestAnimationFrame(scan);
        };
        rafRef.current = requestAnimationFrame(scan);
      })
      .catch((err: unknown) => {
        const name = err instanceof DOMException ? err.name : "";
        if (name === "NotFoundError") {
          setCameraError("Aucune caméra détectée sur cet appareil.");
        } else {
          setCameraError("Accès direct à la caméra non disponible.");
        }
      });

    return stopStream;
  }, [active, onScan, stopStream]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoError(null);

    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);

      const tryDecode = (w: number, h: number): string | null => {
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, w, h);
        const imageData = ctx.getImageData(0, 0, w, h);
        return jsQR(imageData.data, imageData.width, imageData.height)?.data ?? null;
      };

      const scales = [1, 0.5, 0.25];
      for (const s of scales) {
        const w = Math.round(img.width * s);
        const h = Math.round(img.height * s);
        if (Math.max(w, h) < 200) continue;
        const result = tryDecode(w, h);
        if (result) {
          if (fileInputRef.current) fileInputRef.current.value = "";
          onScan(result);
          return;
        }
      }

      setPhotoError("Aucun QR code détecté. Rapproche-toi du QR code et assure-toi qu'il est bien net et entièrement visible.");
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      setPhotoError("Impossible de lire l'image.");
    };
    img.src = url;
  }, [onScan]);

  if (cameraError) {
    return (
      <div className="w-full max-w-xs mx-auto flex flex-col gap-3">
        <div className="aspect-square rounded-2xl bg-slate-100 dark:bg-slate-200 flex flex-col items-center justify-center gap-3 p-5 text-center">
          <CameraOff className="w-10 h-10 text-slate-400" />
          <p className="text-sm text-slate-600 font-medium">{cameraError}</p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileChange}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center justify-center gap-2 w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl transition-colors"
        >
          <Camera size={18} />
          Prendre une photo du QR code
        </button>
        {photoError && (
          <p className="text-sm text-red-600 font-medium text-center">{photoError}</p>
        )}
      </div>
    );
  }

  return (
    <div className="w-full max-w-xs mx-auto flex flex-col gap-3">
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-900">
        <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
        <canvas ref={canvasRef} className="hidden" />
        <div className="absolute inset-6 border-2 border-orange-400 rounded-xl pointer-events-none opacity-70" />
        <div className="absolute inset-0 flex items-end justify-center pb-3">
          <p className="text-white text-xs font-medium bg-black/50 px-3 py-1.5 rounded-full">
            Pointer la caméra vers le QR code
          </p>
        </div>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        className="flex items-center justify-center gap-2 w-full py-2.5 bg-slate-100 dark:bg-slate-200 hover:bg-slate-200 dark:hover:bg-slate-300 text-slate-600 font-bold rounded-2xl transition-colors text-sm"
      >
        <Camera size={16} />
        Utiliser l'appareil photo
      </button>
      {photoError && (
        <p className="text-sm text-red-600 font-medium text-center">{photoError}</p>
      )}
    </div>
  );
};
