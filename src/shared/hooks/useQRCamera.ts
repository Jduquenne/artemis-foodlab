import { useEffect, useRef, useCallback, useState } from "react";
import type { RefObject } from "react";
import QrScanner from "qr-scanner";

export interface UseQRCameraResult {
  videoRef: RefObject<HTMLVideoElement | null>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  cameraError: string | null;
  onRetry: () => void;
}

export function useQRCamera(active: boolean, onScan: (data: string) => void): UseQRCameraResult {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  const scannedRef = useRef(false);
  const engineRef = useRef(QrScanner.createQrEngine());
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const engine = engineRef.current;
    return () => {
      engine.then(e => { if (e instanceof Worker) e.terminate(); });
    };
  }, []);

  const stopStream = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => {
    if (!active) { stopStream(); return; }
    scannedRef.current = false;

    const startCamera = async () => {
      const constraints: MediaStreamConstraints[] = [
        { video: { facingMode: "environment" } },
        { video: { facingMode: "user" } },
        { video: true },
      ];

      let stream: MediaStream | null = null;
      for (const c of constraints) {
        try { stream = await navigator.mediaDevices.getUserMedia(c); break; }
        catch { continue; }
      }

      if (!stream) {
        setCameraError("Impossible d'accéder à la caméra. Vérifie que Chrome est bien autorisé à utiliser la caméra dans les paramètres de l'application.");
        return;
      }
      setCameraError(null);

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      const scan = () => {
        if (scannedRef.current) return;
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
          rafRef.current = requestAnimationFrame(scan);
          return;
        }
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        QrScanner.scanImage(canvas, { returnDetailedScanResult: true, qrEngine: engineRef.current })
          .then(result => {
            if (scannedRef.current) return;
            scannedRef.current = true;
            stopStream();
            onScan(result.data);
          })
          .catch(() => {
            if (!scannedRef.current) rafRef.current = requestAnimationFrame(scan);
          });
      };

      rafRef.current = requestAnimationFrame(scan);
    };

    startCamera();
    return stopStream;
  }, [active, onScan, stopStream, retry]);

  return { videoRef, canvasRef, cameraError, onRetry: () => setRetry(r => r + 1) };
}
