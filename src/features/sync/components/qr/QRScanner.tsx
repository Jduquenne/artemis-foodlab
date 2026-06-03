import { CameraOff, RefreshCw } from "lucide-react";
import { useQRCamera } from "../../../../shared/hooks/useQRCamera";

export interface QRScannerProps {
    onScan: (data: string) => void;
    active: boolean;
}

export const QRScanner = ({ onScan, active }: QRScannerProps) => {
    const { videoRef, canvasRef, cameraError, onRetry } = useQRCamera(active, onScan);

    if (cameraError) {
        return (
            <div className="w-full max-w-xs mx-auto aspect-square rounded-2xl bg-slate-100 dark:bg-slate-200 flex flex-col items-center justify-center gap-4 p-5 text-center">
                <CameraOff className="w-10 h-10 text-slate-400" />
                <p className="text-sm text-slate-600 font-medium">{cameraError}</p>
                <button
                    onClick={onRetry}
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
