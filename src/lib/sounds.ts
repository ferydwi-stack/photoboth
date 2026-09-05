// Sound effects using Web Audio API
// Generates pleasant tones without needing audio files

const audioCtxRef: { current: AudioContext | null } = { current: null };

function getAudioCtx(): AudioContext | null {
  try {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }
    return audioCtxRef.current;
  } catch {
    return null;
  }
}

function playTone(freq: number, duration: number, volume: number = 0.2, type: OscillatorType = "sine") {
  const ctx = getAudioCtx();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.frequency.value = freq;
  osc.type = type;
  gain.gain.value = volume;
  osc.start(ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.stop(ctx.currentTime + duration);
}

export function playShutter() {
  // Quick snap sound - two tones
  playTone(1200, 0.08, 0.15, "square");
  setTimeout(() => playTone(800, 0.06, 0.1, "square"), 30);
}

export function playCountdownBeep() {
  // Short beep
  playTone(880, 0.1, 0.12, "sine");
}

export function playCountdownFinal() {
  // Higher pitch for final beep
  playTone(1320, 0.15, 0.18, "sine");
}

export function playSuccess() {
  // Happy ascending two-note chime
  playTone(523, 0.15, 0.12, "sine"); // C5
  setTimeout(() => playTone(659, 0.2, 0.12, "sine"), 120); // E5
  setTimeout(() => playTone(784, 0.3, 0.15, "sine"), 240); // G5
}

export function playClick() {
  playTone(600, 0.04, 0.08, "square");
}
