// Procedural ambient music via Web Audio API
// Three distinct modes: 'landing' (oriental), 'lobby' (calm pads), 'game' (rhythmic)
// Robust stop: generation counter prevents zombie timers after mode changes.

let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let muted = false;
let currentMode: 'landing' | 'lobby' | 'game' | null = null;

// Incremented every time startMusic / stopMusic is called.
// Each music loop captures its generation at start — exits if stale.
let generation = 0;

function getCtx(): AudioContext {
  if (!ctx) {
    ctx = new (window.AudioContext ?? (window as any).webkitAudioContext)();
  }
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
  if (masterGain && ctx) {
    masterGain.gain.linearRampToValueAtTime(v ? 0 : 0.18, ctx.currentTime + 0.5);
  }
}

export function isMusicMuted() { return muted; }

// ─── Helpers ────────────────────────────────────────────────────────────────

const PENTA = [82.41, 98, 110, 130.81, 164.81, 196, 220, 261.63];

function safeStop(node: AudioScheduledSourceNode) {
  try { node.stop(); } catch {}
}

function pad(freq: number, duration: number, gain = 0.08): void {
  const c = getCtx();
  const m = getMaster();
  const osc1 = c.createOscillator();
  const osc2 = c.createOscillator();
  const g = c.createGain();
  osc1.type = 'sine';
  osc2.type = 'triangle';
  osc1.frequency.value = freq;
  osc2.frequency.value = freq * 2.002;
  osc1.connect(g); osc2.connect(g); g.connect(m);
  g.gain.setValueAtTime(0, c.currentTime);
  g.gain.linearRampToValueAtTime(gain, c.currentTime + 0.6);
  g.gain.setValueAtTime(gain, c.currentTime + duration - 0.8);
  g.gain.linearRampToValueAtTime(0, c.currentTime + duration);
  osc1.start(c.currentTime); osc2.start(c.currentTime);
  osc1.stop(c.currentTime + duration); osc2.stop(c.currentTime + duration);
}

function kick(time: number) {
  const c = getCtx(); const m = getMaster();
  const osc = c.createOscillator(); const g = c.createGain();
  osc.connect(g); g.connect(m);
  osc.frequency.setValueAtTime(120, time);
  osc.frequency.exponentialRampToValueAtTime(40, time + 0.15);
  g.gain.setValueAtTime(0.25, time);
  g.gain.exponentialRampToValueAtTime(0.001, time + 0.3);
  osc.start(time); osc.stop(time + 0.35);
}

function hihat(time: number, gain = 0.04) {
  const c = getCtx(); const m = getMaster();
  const buf = c.createBuffer(1, Math.floor(c.sampleRate * 0.05), c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buf;
  const filt = c.createBiquadFilter();
  filt.type = 'highpass'; filt.frequency.value = 8000;
  const g = c.createGain();
  src.connect(filt); filt.connect(g); g.connect(m);
  g.gain.setValueAtTime(gain, time);
  g.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
  src.start(time);
}

// ─── LOBBY: slow pad chords ──────────────────────────────────────────────────

function startLobbyMusic(gen: number): void {
  const chords = [
    [PENTA[0], PENTA[2], PENTA[4]],
    [PENTA[1], PENTA[3], PENTA[5]],
    [PENTA[2], PENTA[4], PENTA[6]],
    [PENTA[0], PENTA[3], PENTA[5]],
  ];
  let chordIdx = 0;
  const CHORD_DUR = 4.0;

  const playChord = () => {
    if (generation !== gen) return; // stale — bail out
    const chord = chords[chordIdx % chords.length];
    chord.forEach(f => pad(f, CHORD_DUR + 0.5, 0.06));
    chordIdx++;
    setTimeout(playChord, (CHORD_DUR - 0.2) * 1000);
  };

  playChord();
}

// ─── GAME: rhythmic tension ──────────────────────────────────────────────────

function startGameMusic(gen: number): void {
  const c = getCtx();
  const BEAT = 0.42;
  const BAR = BEAT * 4;
  let bar = 0;

  const scheduleBar = () => {
    if (generation !== gen) return;
    const now = c.currentTime;
    kick(now); kick(now + BEAT * 2);
    for (let i = 0; i < 4; i++) hihat(now + BEAT * i, 0.035);
    if (bar % 2 === 0) pad(PENTA[bar % PENTA.length], BAR * 2 + 0.3, 0.055);
    bar++;
    setTimeout(scheduleBar, BAR * 1000 - 30);
  };

  scheduleBar();
}

// ─── LANDING: oriental koto + shakuhachi (Hirajoshi scale) ──────────────────

const HIRA = [110, 116.54, 146.83, 164.81, 174.61];

function kotoPluck(freq: number, gain = 0.13): void {
  const c = getCtx(); const m = getMaster();
  const osc = c.createOscillator(); const g = c.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(freq * 1.018, c.currentTime);
  osc.frequency.exponentialRampToValueAtTime(freq, c.currentTime + 0.04);
  g.gain.setValueAtTime(gain, c.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 2.2);
  osc.connect(g); g.connect(m);
  osc.start(c.currentTime); osc.stop(c.currentTime + 2.3);
}

function shakuhachi(freq: number, duration: number, gain = 0.055): void {
  const c = getCtx(); const m = getMaster();
  const osc = c.createOscillator();
  osc.type = 'sine'; osc.frequency.value = freq;
  const lfo = c.createOscillator();
  lfo.type = 'sine'; lfo.frequency.value = 4.8;
  const lfoGain = c.createGain();
  lfoGain.gain.value = freq * 0.007;
  lfo.connect(lfoGain); lfoGain.connect(osc.frequency);
  const bufLen = Math.floor(c.sampleRate * 0.12);
  const buf = c.createBuffer(1, bufLen, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const noise = c.createBufferSource();
  noise.buffer = buf; noise.loop = true;
  const nf = c.createBiquadFilter();
  nf.type = 'bandpass'; nf.frequency.value = freq; nf.Q.value = 25;
  const ng = c.createGain(); ng.gain.value = gain * 0.18;
  noise.connect(nf); nf.connect(ng); ng.connect(m);
  const g = c.createGain();
  g.gain.setValueAtTime(0, c.currentTime);
  g.gain.linearRampToValueAtTime(gain, c.currentTime + 0.55);
  g.gain.setValueAtTime(gain, c.currentTime + duration - 0.7);
  g.gain.linearRampToValueAtTime(0, c.currentTime + duration);
  osc.connect(g); g.connect(m);
  osc.start(c.currentTime); lfo.start(c.currentTime); noise.start(c.currentTime);
  osc.stop(c.currentTime + duration);
  lfo.stop(c.currentTime + duration);
  noise.stop(c.currentTime + duration);
}

function startLandingMusic(gen: number): void {
  const seq: Array<{ delay: number; fn: () => void }> = [
    { delay: 0,     fn: () => kotoPluck(HIRA[0]) },
    { delay: 1400,  fn: () => kotoPluck(HIRA[2]) },
    { delay: 2600,  fn: () => kotoPluck(HIRA[4] * 2) },
    { delay: 3800,  fn: () => shakuhachi(HIRA[3] * 2, 4.5) },
    { delay: 5000,  fn: () => kotoPluck(HIRA[1] * 2) },
    { delay: 6200,  fn: () => { kotoPluck(HIRA[0]); kotoPluck(HIRA[2] * 2); } },
    { delay: 8000,  fn: () => kotoPluck(HIRA[3] * 2) },
    { delay: 9000,  fn: () => shakuhachi(HIRA[0] * 2, 5.5, 0.06) },
    { delay: 10500, fn: () => kotoPluck(HIRA[4]) },
    { delay: 11800, fn: () => kotoPluck(HIRA[2]) },
    { delay: 13000, fn: () => kotoPluck(HIRA[0]) },
  ];
  const LOOP_MS = 15000;

  let step = 0;

  const run = () => {
    if (generation !== gen) return;
    const s = seq[step];
    try { s.fn(); } catch {}
    step++;
    if (step < seq.length) {
      const wait = seq[step].delay - s.delay;
      setTimeout(run, wait);
    } else {
      // Wait until loop restarts
      const wait = LOOP_MS - s.delay + 800;
      setTimeout(() => { if (generation !== gen) return; step = 0; run(); }, wait);
    }
  };

  run();
}

// ─── Public API ──────────────────────────────────────────────────────────────

export async function startMusic(mode: 'landing' | 'lobby' | 'game') {
  if (currentMode === mode) return;

  // Fade out current music
  if (masterGain && ctx && currentMode !== null) {
    const now = ctx.currentTime;
    masterGain.gain.cancelScheduledValues(now);
    masterGain.gain.setValueAtTime(masterGain.gain.value, now);
    masterGain.gain.linearRampToValueAtTime(0, now + 0.4);
    await new Promise(r => setTimeout(r, 420));
  }

  // Invalidate all running loops
  generation++;
  const gen = generation;
  currentMode = mode;

  try {
    const c = getCtx();
    if (c.state === 'suspended') await c.resume();

    // Restore master gain
    if (masterGain) {
      const now = c.currentTime;
      masterGain.gain.cancelScheduledValues(now);
      masterGain.gain.setValueAtTime(0, now);
      masterGain.gain.linearRampToValueAtTime(muted ? 0 : 0.18, now + 0.5);
    }

    if (mode === 'landing') startLandingMusic(gen);
    else if (mode === 'lobby') startLobbyMusic(gen);
    else startGameMusic(gen);
  } catch {
    // AudioContext blocked before user interaction
  }
}

export function stopMusic() {
  generation++; // invalidates all loops immediately
  currentMode = null;

  if (masterGain && ctx) {
    const now = ctx.currentTime;
    masterGain.gain.cancelScheduledValues(now);
    masterGain.gain.setValueAtTime(masterGain.gain.value, now);
    masterGain.gain.linearRampToValueAtTime(0, now + 0.3);
  }
}
