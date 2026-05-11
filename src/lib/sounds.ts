export type SoundName = 'play' | 'pass' | 'wipe' | 'sabor' | 'round_end' | 'game_over' | 'your_turn';

let muted = false;
export function setMuted(v: boolean) { muted = v; }
export function isMuted() { return muted; }

const AudioContext = window.AudioContext ?? (window as any).webkitAudioContext;

let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function beep(freq: number, duration: number, gain = 0.15, type: OscillatorType = 'sine') {
  try {
    const c = getCtx();
    const osc = c.createOscillator();
    const gainNode = c.createGain();
    osc.connect(gainNode);
    gainNode.connect(c.destination);
    osc.frequency.value = freq;
    osc.type = type;
    gainNode.gain.setValueAtTime(gain, c.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
    osc.start(c.currentTime);
    osc.stop(c.currentTime + duration);
  } catch {
    // AudioContext blocked or unavailable — silent fail
  }
}

const sounds: Record<SoundName, () => void> = {
  play: () => beep(440, 0.08, 0.1),
  pass: () => beep(280, 0.12, 0.08),
  wipe: () => {
    beep(523, 0.1, 0.15);
    setTimeout(() => beep(659, 0.1, 0.15), 100);
    setTimeout(() => beep(784, 0.15, 0.15), 200);
  },
  sabor: () => {
    beep(600, 0.08, 0.12, 'square');
    setTimeout(() => beep(750, 0.12, 0.12, 'square'), 90);
  },
  round_end: () => {
    beep(392, 0.1, 0.1);
    setTimeout(() => beep(330, 0.15, 0.1), 120);
  },
  game_over: () => {
    beep(523, 0.12, 0.15);
    setTimeout(() => beep(659, 0.12, 0.15), 130);
    setTimeout(() => beep(784, 0.2, 0.15), 260);
  },
  your_turn: () => beep(660, 0.07, 0.08),
};

export function playSound(name: SoundName) {
  if (muted) return;
  sounds[name]?.();
}
