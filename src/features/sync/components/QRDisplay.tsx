import { useEffect, useRef } from "react";
import QRCode from "qrcode";

interface QRDisplayProps {
  value: string;
  size?: number;
}

export const QRDisplay = ({ value, size = 240 }: QRDisplayProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !value) return;
    QRCode.toCanvas(canvasRef.current, value, {
      width: size,
      margin: 2,
      color: { dark: "#1c1917", light: "#faf6ef" },
    });
  }, [value, size]);

  return (
    <div className="flex items-center justify-center p-3 bg-white dark:bg-slate-100 rounded-2xl shadow-inner">
      <canvas ref={canvasRef} />
    </div>
  );
};
