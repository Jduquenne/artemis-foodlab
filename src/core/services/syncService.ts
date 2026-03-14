import { serializeData, applyImport, SyncPayload, SyncScope, ALL_SCOPES } from "../utils/syncSerializer";

const CHUNK_SIZE = 16_000;
const ICE_TIMEOUT_MS = 10_000;
const ICE_SERVERS: RTCIceServer[] = [{ urls: "stun:stun.l.google.com:19302" }];

function trimSdp(sdp: string): string {
  return sdp.split('\r\n').filter(line => {
    if (line.startsWith('a=candidate:') && (line.includes('typ srflx') || line.includes('typ relay'))) return false;
    if (line === 'a=extmap-allow-mixed') return false;
    if (line.startsWith('a=msid-semantic:')) return false;
    return true;
  }).join('\r\n');
}

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

export async function createSenderSession(scope: SyncScope[] = ALL_SCOPES, callbacks: SenderCallbacks): Promise<SenderSession> {
  const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
  const channel = pc.createDataChannel("sync", { ordered: true });

  channel.onopen = async () => {
    try {
      const payload = await serializeData(scope);
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
    offerSdp: trimSdp(pc.localDescription!.sdp),
    applyAnswer: async (answerSdp: string) => {
      await pc.setRemoteDescription({ type: "answer", sdp: answerSdp });
    },
    cleanup: () => {
      try { channel.close(); } catch { /* already closed */ }
      try { pc.close(); } catch { /* already closed */ }
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
    answerSdp: trimSdp(pc.localDescription!.sdp),
    cleanup: () => {
      try { pc.close(); } catch { /* empty */ }
    },
  };
}
