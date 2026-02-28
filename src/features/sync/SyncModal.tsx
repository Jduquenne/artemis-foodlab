import { useState, useEffect, useRef, useCallback } from "react";
import { X, Send, Download, Loader2, CheckCircle2 } from "lucide-react";
import { QRDisplay } from "./components/QRDisplay";
import { QRScanner } from "./components/QRScanner";
import { createSenderSession, createReceiverSession, SenderSession, ReceiverSession } from "../../core/services/syncService";
import { useNotificationStore } from "../../shared/store/useNotificationStore";

type SyncStep =
  | "ROLE_SELECT"
  | "SENDER_OFFER"
  | "SENDER_SCAN"
  | "SENDER_TRANSFER"
  | "RECEIVER_SCAN"
  | "RECEIVER_ANSWER"
  | "RECEIVER_WAIT"
  | "DONE";

const STEP_LABELS: Record<SyncStep, string> = {
  ROLE_SELECT: "Choisir le rôle",
  SENDER_OFFER: "Préparation",
  SENDER_SCAN: "Échange des codes",
  SENDER_TRANSFER: "Transfert en cours",
  RECEIVER_SCAN: "Scanner le code",
  RECEIVER_ANSWER: "Génération de réponse",
  RECEIVER_WAIT: "En attente",
  DONE: "Terminé",
};

export interface SyncModalProps {
  onClose: () => void;
}

export const SyncModal = ({ onClose }: SyncModalProps) => {
  const [step, setStep] = useState<SyncStep>("ROLE_SELECT");
  const [offerQr, setOfferQr] = useState("");
  const [answerQr, setAnswerQr] = useState("");
  const [progress, setProgress] = useState({ sent: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);

  const senderRef = useRef<SenderSession | null>(null);
  const receiverRef = useRef<ReceiverSession | null>(null);
  const push = useNotificationStore(s => s.push);

  const handleError = useCallback((msg: string) => setError(msg), []);

  const handleDone = useCallback(() => {
    setStep("DONE");
    push({
      message: "Synchronisation réussie !",
      duration: 6000,
      actions: [
        { label: "Recharger", onClick: () => window.location.reload() },
        { label: "Fermer", onClick: () => {} },
      ],
    });
  }, [push]);

  const startSender = useCallback(async () => {
    setStep("SENDER_OFFER");
    setError(null);
    try {
      const session = await createSenderSession({
        onProgress: (sent, total) => setProgress({ sent, total }),
        onDone: handleDone,
        onError: handleError,
      });
      senderRef.current = session;
      setOfferQr(session.offerSdp);
      setStep("SENDER_SCAN");
    } catch {
      handleError("Impossible de créer la connexion WebRTC.");
    }
  }, [handleDone, handleError]);

  const handleAnswerScanned = useCallback(async (answerSdp: string) => {
    if (!senderRef.current) return;
    setStep("SENDER_TRANSFER");
    try {
      await senderRef.current.applyAnswer(answerSdp);
    } catch {
      handleError("Réponse invalide — connexion échouée.");
    }
  }, [handleError]);

  const handleOfferScanned = useCallback(async (offerSdp: string) => {
    setStep("RECEIVER_ANSWER");
    setError(null);
    try {
      const session = await createReceiverSession(offerSdp, {
        onProgress: (received, total) => setProgress({ sent: received, total }),
        onDone: handleDone,
        onError: handleError,
      });
      receiverRef.current = session;
      setAnswerQr(session.answerSdp);
      setStep("RECEIVER_WAIT");
    } catch {
      handleError("QR invalide ou offre expirée.");
    }
  }, [handleDone, handleError]);

  useEffect(() => {
    return () => {
      senderRef.current?.cleanup();
      receiverRef.current?.cleanup();
    };
  }, []);

  const pct = progress.total > 0 ? Math.round((progress.sent / progress.total) * 100) : 0;

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-100 w-full max-w-sm rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[90dvh]">
        <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-orange-50 dark:bg-orange-950/30 shrink-0">
          <div>
            <h2 className="text-lg font-black text-slate-900">Synchronisation</h2>
            <p className="text-orange-600 dark:text-orange-400 font-bold uppercase text-xs tracking-widest">
              {STEP_LABELS[step]}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4 overflow-y-auto">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 text-sm font-medium rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          {step === "ROLE_SELECT" && <RoleSelect onSend={startSender} onReceive={() => setStep("RECEIVER_SCAN")} />}

          {step === "SENDER_OFFER" && <Spinner label="Préparation de la connexion..." />}

          {step === "SENDER_SCAN" && (
            <div className="flex flex-col gap-4">
              <StepInstruction num={1} text="Montre ce QR code à l'autre appareil (en mode Recevoir)" />
              {offerQr && <QRDisplay value={offerQr} />}
              <StepInstruction num={2} text="Puis scanne le QR code affiché par l'autre appareil" />
              <QRScanner active={step === "SENDER_SCAN"} onScan={handleAnswerScanned} />
            </div>
          )}

          {step === "SENDER_TRANSFER" && (
            <ProgressView label="Envoi des données en cours..." pct={pct} detail={`${progress.sent} / ${progress.total} blocs`} />
          )}

          {step === "RECEIVER_SCAN" && (
            <div className="flex flex-col gap-4">
              <StepInstruction num={1} text="Scanne le QR code affiché par l'appareil qui envoie" />
              <QRScanner active={step === "RECEIVER_SCAN"} onScan={handleOfferScanned} />
            </div>
          )}

          {step === "RECEIVER_ANSWER" && <Spinner label="Génération de la réponse..." />}

          {step === "RECEIVER_WAIT" && (
            <div className="flex flex-col gap-4">
              <StepInstruction num={1} text="Montre ce QR code à l'appareil qui envoie pour finaliser la connexion" />
              {answerQr && <QRDisplay value={answerQr} />}
              <ProgressView
                label="En attente des données..."
                pct={pct}
                detail={progress.total > 0 ? `${progress.sent} / ${progress.total} blocs` : ""}
              />
            </div>
          )}

          {step === "DONE" && (
            <div className="flex flex-col items-center gap-4 py-4">
              <CheckCircle2 className="w-14 h-14 text-green-500" />
              <p className="font-black text-slate-900 text-lg text-center">Synchronisation réussie !</p>
              <p className="text-slate-500 text-sm text-center">Recharge la page pour voir les données mises à jour.</p>
              <button
                onClick={() => window.location.reload()}
                className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl transition-colors"
              >
                Recharger la page
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface RoleSelectProps { onSend: () => void; onReceive: () => void; }
const RoleSelect = ({ onSend, onReceive }: RoleSelectProps) => (
  <div className="flex flex-col gap-3">
    <p className="text-slate-500 text-sm text-center">
      Choisis le rôle de cet appareil. La synchronisation remplacera les données de l'appareil qui reçoit.
    </p>
    <button
      onClick={onSend}
      className="flex items-center gap-3 w-full p-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-bold transition-colors text-left"
    >
      <Send size={20} className="shrink-0" />
      <div>
        <p className="font-black">Envoyer</p>
        <p className="text-xs font-normal opacity-80">Cet appareil envoie ses données vers l'autre</p>
      </div>
    </button>
    <button
      onClick={onReceive}
      className="flex items-center gap-3 w-full p-4 bg-slate-100 dark:bg-slate-200 hover:bg-slate-200 dark:hover:bg-slate-300 text-slate-700 rounded-2xl font-bold transition-colors text-left"
    >
      <Download size={20} className="shrink-0" />
      <div>
        <p className="font-black">Recevoir</p>
        <p className="text-xs font-normal text-slate-500">Cet appareil reçoit les données de l'autre</p>
      </div>
    </button>
  </div>
);

interface StepInstructionProps { num: number; text: string; }
const StepInstruction = ({ num, text }: StepInstructionProps) => (
  <div className="flex items-start gap-3">
    <div className="shrink-0 w-6 h-6 rounded-full bg-orange-500 text-white text-xs font-black flex items-center justify-center">
      {num}
    </div>
    <p className="text-slate-600 text-sm font-medium">{text}</p>
  </div>
);

interface ProgressViewProps { label: string; pct: number; detail?: string; }
const ProgressView = ({ label, pct, detail }: ProgressViewProps) => (
  <div className="flex flex-col gap-2">
    <p className="text-slate-600 text-sm font-medium">{label}</p>
    <div className="w-full bg-slate-200 dark:bg-slate-300 rounded-full h-2">
      <div className="bg-orange-500 h-2 rounded-full transition-all duration-200" style={{ width: `${pct}%` }} />
    </div>
    {detail && <p className="text-slate-400 text-xs">{detail}</p>}
  </div>
);

const Spinner = ({ label }: { label: string }) => (
  <div className="flex flex-col items-center gap-4 py-6">
    <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
    <p className="text-slate-500 text-sm">{label}</p>
  </div>
);
