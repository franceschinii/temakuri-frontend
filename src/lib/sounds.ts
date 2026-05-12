export type SoundName = 'play' | 'pass' | 'wipe' | 'sabor' | 'round_end' | 'game_over' | 'your_turn' | 'countdown_tick' | 'countdown_go';

// Initialize muted state from localStorage on module load
let muted = localStorage.getItem('soundEnabled') === 'false';
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
  // Noticeably louder double-beep for "your turn"
  your_turn: () => {
    beep(660, 0.1, 0.2);
    setTimeout(() => beep(880, 0.15, 0.2), 100);
  },

  countdown_tick: () => {
    try {
      const c = getCtx();
      const buf = c.createBuffer(1, Math.floor(c.sampleRate * 0.06), c.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      const src = c.createBufferSource();
      src.buffer = buf;
      const filt = c.createBiquadFilter();
      filt.type = 'bandpass';
      filt.frequency.value = 900;
      filt.Q.value = 2;
      const g = c.createGain();
      g.gain.setValueAtTime(0.35, c.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.09);
      src.connect(filt);
      filt.connect(g);
      g.connect(c.destination);
      src.start();
    } catch {}
  },

  countdown_go: () => {
    [329.63, 415.30, 493.88, 659.25].forEach((freq, i) => {
      setTimeout(() => beep(freq, 0.22, 0.2, 'triangle'), i * 85);
    });
  },
};

export function playSound(name: SoundName) {
  if (muted) return;
  sounds[name]?.();
}
