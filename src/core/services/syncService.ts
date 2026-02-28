import { serializeData, applyImport, SyncPayload } from "./dataService";

const CHUNK_SIZE = 16_000;
const ICE_TIMEOUT_MS = 10_000;
const ICE_SERVERS: RTCIceServer[] = [{ urls: "stun:stun.l.google.com:19302" }];

interface SyncChunk {
  i: number;
  total: number;
  data: string;
}

function waitForIceComplete(pc: RTCPeerConnection): Promise<void> {
  return new Promise((resolve) => {
    if (pc.iceGatheringState === "complete") { resolve(); return; }

    const done = () => { clearTimeout(timer); resolve(); };

    pc.addEventListener("icecandidate", (e) => {
      if (e.candidate === null) done();
    });

    pc.addEventListener("icegatheringstatechange", () => {
      if (pc.iceGatheringState === "complete") done();
    });

    const timer = setTimeout(resolve, ICE_TIMEOUT_MS);
  });
}

export interface SenderCallbacks {
  onProgress: (sent: number, total: number) => void;
  onDone: () => void;
  onError: (msg: string) => void;
}

export interface SenderSession {
  offerSdp: string;
  applyAnswer: (answerSdp: string) => Promise<void>;
  cleanup: () => void;
}

export async function createSenderSession(callbacks: SenderCallbacks): Promise<SenderSession> {
  const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
  const channel = pc.createDataChannel("sync", { ordered: true });

  channel.onopen = async () => {
    try {
      const payload = await serializeData();
      const json = JSON.stringify(payload);
      const total = Math.ceil(json.length / CHUNK_SIZE);
      for (let i = 0; i < total; i++) {
        const chunk: SyncChunk = { i, total, data: json.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE) };
        channel.send(JSON.stringify(chunk));
        callbacks.onProgress(i + 1, total);
        await new Promise(r => setTimeout(r, 0));
      }
      callbacks.onDone();
      channel.close();
    } catch {
      callbacks.onError("Erreur pendant l'envoi des données.");
    }
  };

  channel.onerror = () => callbacks.onError("Erreur de canal de données.");

  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  await waitForIceComplete(pc);

  return {
    offerSdp: pc.localDescription!.sdp,
    applyAnswer: async (answerSdp: string) => {
      await pc.setRemoteDescription({ type: "answer", sdp: answerSdp });
    },
    cleanup: () => {
      try { channel.close(); } catch { /* empty */ }
      try { pc.close(); } catch { /* empty */ }
    },
  };
}

export interface ReceiverCallbacks {
  onProgress: (received: number, total: number) => void;
  onDone: () => void;
  onError: (msg: string) => void;
}

export interface ReceiverSession {
  answerSdp: string;
  cleanup: () => void;
}

export async function createReceiverSession(offerSdp: string, callbacks: ReceiverCallbacks): Promise<ReceiverSession> {
  const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
  const chunks = new Map<number, string>();

  pc.ondatachannel = (event) => {
    const channel = event.channel;
    channel.onmessage = async (e) => {
      try {
        const chunk: SyncChunk = JSON.parse(e.data);
        chunks.set(chunk.i, chunk.data);
        callbacks.onProgress(chunks.size, chunk.total);
        if (chunks.size === chunk.total) {
          const json = Array.from({ length: chunk.total }, (_, i) => chunks.get(i)!).join("");
          const payload: SyncPayload = JSON.parse(json);
          await applyImport(payload);
          callbacks.onDone();
          channel.close();
        }
      } catch {
        callbacks.onError("Erreur lors de la réception des données.");
      }
    };
    channel.onerror = () => callbacks.onError("Erreur de canal de données.");
  };

  await pc.setRemoteDescription({ type: "offer", sdp: offerSdp });
  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);
  await waitForIceComplete(pc);

  return {
    answerSdp: pc.localDescription!.sdp,
    cleanup: () => {
      try { pc.close(); } catch { /* empty */ }
    },
  };
}
