// Sound effects using Web Audio API with sound toggle check
import { usePhotoboothStore } from "@/store/photobooth-store";

const audioCtxRef: { current: AudioContext | null } = { current: null };

function getAudioCtx(): AudioContext | null {
  try {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  } catch {
    return null;
  }
}

function playTone(freq: number, duration: number, volume: number = 0.2, type: OscillatorType = "sine") {
  if (typeof window === "undefined") return;
  const isEnabled = usePhotoboothStore.getState().soundEnabled;
  if (!isEnabled) return;

  const ctx = getAudioCtx();
  if (!ctx) return;

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = freq;
    osc.type = type;
    gain.gain.value = volume;
    osc.start(ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    osc.stop(ctx.currentTime + duration);
  } catch {
    // ignore audio playback errors
  }
}

export function playShutter() {
  playTone(1200, 0.08, 0.2, "square");
  setTimeout(() => playTone(800, 0.06, 0.15, "square"), 30);
}

export function playCountdownBeep() {
  playTone(880, 0.1, 0.15, "sine");
}

export function playCountdownFinal() {
  playTone(1320, 0.15, 0.22, "sine");
}

export function playSuccess() {
  playTone(523, 0.15, 0.15, "sine");
  setTimeout(() => playTone(659, 0.2, 0.15, "sine"), 120);
  setTimeout(() => playTone(784, 0.3, 0.18, "sine"), 240);
}

export function playClick() {
  playTone(600, 0.04, 0.1, "square");
}
