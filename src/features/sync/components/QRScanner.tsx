import { useEffect, useRef, useCallback, useState } from "react";
import { CameraOff, RefreshCw } from "lucide-react";
import jsQR from "jsqr";

interface QRScannerProps {
  onScan: (data: string) => void;
  active: boolean;
}

export const QRScanner = ({ onScan, active }: QRScannerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  const scannedRef = useRef(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);

  const stopStream = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => {
    if (!active) { stopStream(); return; }
    scannedRef.current = false;
    setCameraError(null);

    const startCamera = async () => {
      const constraints: MediaStreamConstraints[] = [
        { video: { facingMode: "environment" } },
        { video: { facingMode: "user" } },
        { video: true },
      ];

      let stream: MediaStream | null = null;
      for (const c of constraints) {
        try {
          stream = await navigator.mediaDevices.getUserMedia(c);
          break;
        } catch {
          continue;
        }
      }

      if (!stream) {
        setCameraError("Impossible d'accéder à la caméra. Vérifie que Chrome est bien autorisé à utiliser la caméra dans les paramètres de l'application.");
        return;
      }

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
    };

    startCamera();
    return stopStream;
  }, [active, onScan, stopStream, retry]);

  if (cameraError) {
    return (
      <div className="w-full max-w-xs mx-auto aspect-square rounded-2xl bg-slate-100 dark:bg-slate-200 flex flex-col items-center justify-center gap-4 p-5 text-center">
        <CameraOff className="w-10 h-10 text-slate-400" />
        <p className="text-sm text-slate-600 font-medium">{cameraError}</p>
        <button
          onClick={() => setRetry(r => r + 1)}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-xl transition-colors"
        >
          <RefreshCw size={15} />
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-square max-w-xs mx-auto rounded-2xl overflow-hidden bg-slate-900">
      <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
      <canvas ref={canvasRef} className="hidden" />
      <div className="absolute inset-6 border-2 border-orange-400 rounded-xl pointer-events-none opacity-70" />
      <div className="absolute inset-0 flex items-end justify-center pb-3">
        <p className="text-white text-xs font-medium bg-black/50 px-3 py-1.5 rounded-full">
          Pointer la caméra vers le QR code
        </p>
      </div>
    </div>
  );
};
