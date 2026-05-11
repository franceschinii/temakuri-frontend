// Procedural ambient music via Web Audio API
// Two modes: 'lobby' (calm pentatonic pads) and 'game' (rhythmic tension)

let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let stopFn: (() => void) | null = null;
let muted = false;
let currentMode: 'lobby' | 'game' | null = null;

function getCtx(): AudioContext {
  if (!ctx) ctx = new (window.AudioContext ?? (window as any).webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function getMaster(): GainNode {
  const c = getCtx();
  if (!masterGain) {
    masterGain = c.createGain();
    masterGain.gain.value = muted ? 0 : 0.18;
    masterGain.connect(c.destination);
  }
  return masterGain;
}

export function setMusicMuted(v: boolean) {
  muted = v;
  if (masterGain) {
    masterGain.gain.linearRampToValueAtTime(v ? 0 : 0.18, getCtx().currentTime + 0.5);
  }
}

export function isMusicMuted() { return muted; }

// Pentatonic scale in Hz (E minor pentatonic, low register)
const PENTA = [82.41, 98, 110, 130.81, 164.81, 196, 220, 261.63];

function pad(freq: number, duration: number, gain = 0.08): () => void {
  const c = getCtx();
  const m = getMaster();
  const osc1 = c.createOscillator();
  const osc2 = c.createOscillator();
  const g = c.createGain();

  osc1.type = 'sine';
  osc2.type = 'triangle';
  osc1.frequency.value = freq;
  osc2.frequency.value = freq * 2.002; // slight detune for warmth

  osc1.connect(g);
  osc2.connect(g);
  g.connect(m);

  g.gain.setValueAtTime(0, c.currentTime);
  g.gain.linearRampToValueAtTime(gain, c.currentTime + 0.6);
  g.gain.setValueAtTime(gain, c.currentTime + duration - 0.8);
  g.gain.linearRampToValueAtTime(0, c.currentTime + duration);

  osc1.start(c.currentTime);
  osc2.start(c.currentTime);
  osc1.stop(c.currentTime + duration);
  osc2.stop(c.currentTime + duration);

  return () => { try { osc1.stop(); osc2.stop(); } catch {} };
}

function kick(time: number) {
  const c = getCtx();
  const m = getMaster();
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.connect(g);
  g.connect(m);
  osc.frequency.setValueAtTime(120, time);
  osc.frequency.exponentialRampToValueAtTime(40, time + 0.15);
  g.gain.setValueAtTime(0.25, time);
  g.gain.exponentialRampToValueAtTime(0.001, time + 0.3);
  osc.start(time);
  osc.stop(time + 0.35);
}

function hihat(time: number, gain = 0.04) {
  const c = getCtx();
  const m = getMaster();
  const buf = c.createBuffer(1, c.sampleRate * 0.05, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buf;
  const filt = c.createBiquadFilter();
  filt.type = 'highpass';
  filt.frequency.value = 8000;
  const g = c.createGain();
  src.connect(filt);
  filt.connect(g);
  g.connect(m);
  g.gain.setValueAtTime(gain, time);
  g.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
  src.start(time);
}

// ─── LOBBY: slow pad chords ─────────────────────────────────────────────────

function startLobbyMusic(): () => void {
  let running = true;
  const stops: (() => void)[] = [];

  const chords = [
    [PENTA[0], PENTA[2], PENTA[4]],
    [PENTA[1], PENTA[3], PENTA[5]],
    [PENTA[2], PENTA[4], PENTA[6]],
    [PENTA[0], PENTA[3], PENTA[5]],
  ];
  let chordIdx = 0;
  const CHORD_DUR = 4.0;

  const playChord = () => {
    if (!running) return;
    const chord = chords[chordIdx % chords.length];
    chord.forEach(f => stops.push(pad(f, CHORD_DUR + 0.5, 0.06)));
    chordIdx++;
    setTimeout(playChord, (CHORD_DUR - 0.2) * 1000);
  };

  playChord();

  return () => {
    running = false;
    stops.forEach(s => { try { s(); } catch {} });
  };
}

// ─── GAME: rhythmic pulse with pads ─────────────────────────────────────────

function startGameMusic(): () => void {
  let running = true;
  const c = getCtx();

  const BEAT = 0.42; // seconds per beat (~143bpm)
  const BAR = BEAT * 4;

  let bar = 0;
  let timerId: ReturnType<typeof setTimeout>;

  const scheduleBar = () => {
    if (!running) return;
    const now = c.currentTime;

    // Kick: beats 1 and 3
    kick(now);
    kick(now + BEAT * 2);

    // Hi-hats: every beat
    for (let i = 0; i < 4; i++) hihat(now + BEAT * i, 0.035);

    // Pad every 2 bars
    if (bar % 2 === 0) {
      const note = PENTA[bar % PENTA.length];
      pad(note, BAR * 2 + 0.3, 0.055);
    }

    bar++;
    timerId = setTimeout(scheduleBar, BAR * 1000 - 30);
  };

  scheduleBar();

  return () => {
    running = false;
    clearTimeout(timerId);
  };
}

// ─── Public API ──────────────────────────────────────────────────────────────

export async function startMusic(mode: 'lobby' | 'game') {
  if (currentMode === mode) return;
  stopMusic();
  currentMode = mode;
  try {
    const c = getCtx();
    if (c.state === 'suspended') await c.resume();
    stopFn = mode === 'lobby' ? startLobbyMusic() : startGameMusic();
  } catch {
    // AudioContext may be blocked before user interaction — silent fail
  }
}

export function stopMusic() {
  if (stopFn) { try { stopFn(); } catch {} stopFn = null; }
  currentMode = null;
}
