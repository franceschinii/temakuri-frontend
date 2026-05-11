// Procedural ambient music via Web Audio API
// Three modes: 'landing' (oriental koto), 'lobby' (slow pads), 'game' (rhythmic)
//
// Isolation model:
//   masterGain  — stays at target volume, only mute/unmute changes it
//   sessionGain — created fresh per mode; all new oscillators connect here
//                 On mode change the old sessionGain fades to 0 and is
//                 disconnected — old oscillators play silently then die.
//   generation  — prevents zombie loops from scheduling new oscillators.

let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let sessionGain: GainNode | null = null;
let muted = false;
let currentMode: 'landing' | 'lobby' | 'game' | null = null;
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

// Returns the current session gain — all oscillators should connect here.
function getSession(): GainNode {
  if (!sessionGain) {
    const c = getCtx();
    sessionGain = c.createGain();
    sessionGain.gain.value = 1;
    sessionGain.connect(getMaster());
  }
  return sessionGain;
}

// Orphan the current sessionGain: fade to 0 then disconnect.
// Returns a new clean GainNode for the next session.
function rotateSession(): GainNode {
  const c = getCtx();
  if (sessionGain) {
    const old = sessionGain;
    const now = c.currentTime;
    old.gain.cancelScheduledValues(now);
    old.gain.setValueAtTime(old.gain.value, now);
    old.gain.linearRampToValueAtTime(0, now + 0.5);
    setTimeout(() => { try { old.disconnect(); } catch {} }, 600);
    sessionGain = null;
  }
  const sg = c.createGain();
  sg.gain.value = 0;
  sg.connect(getMaster());
  sg.gain.linearRampToValueAtTime(1, c.currentTime + 0.45);
  sessionGain = sg;
  return sg;
}

export function setMusicMuted(v: boolean) {
  muted = v;
  if (masterGain && ctx) {
    masterGain.gain.linearRampToValueAtTime(v ? 0 : 0.18, ctx.currentTime + 0.5);
  }
}

export function isMusicMuted() { return muted; }

// ─── Helpers (all connect to sessionGain, passed as `sg`) ───────────────────

const PENTA = [82.41, 98, 110, 130.81, 164.81, 196, 220, 261.63];

function pad(freq: number, duration: number, sg: GainNode, gain = 0.08): void {
  const c = getCtx();
  const osc1 = c.createOscillator();
  const osc2 = c.createOscillator();
  const g = c.createGain();
  osc1.type = 'sine';
  osc2.type = 'triangle';
  osc1.frequency.value = freq;
  osc2.frequency.value = freq * 2.002;
  osc1.connect(g); osc2.connect(g); g.connect(sg);
  g.gain.setValueAtTime(0, c.currentTime);
  g.gain.linearRampToValueAtTime(gain, c.currentTime + 0.6);
  g.gain.setValueAtTime(gain, c.currentTime + duration - 0.8);
  g.gain.linearRampToValueAtTime(0, c.currentTime + duration);
  osc1.start(c.currentTime); osc2.start(c.currentTime);
  osc1.stop(c.currentTime + duration); osc2.stop(c.currentTime + duration);
}

function kick(time: number, sg: GainNode) {
  const c = getCtx();
  const osc = c.createOscillator(); const g = c.createGain();
  osc.connect(g); g.connect(sg);
  osc.frequency.setValueAtTime(120, time);
  osc.frequency.exponentialRampToValueAtTime(40, time + 0.15);
  g.gain.setValueAtTime(0.25, time);
  g.gain.exponentialRampToValueAtTime(0.001, time + 0.3);
  osc.start(time); osc.stop(time + 0.35);
}

function hihat(time: number, sg: GainNode, gain = 0.04) {
  const c = getCtx();
  const buf = c.createBuffer(1, Math.floor(c.sampleRate * 0.05), c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buf;
  const filt = c.createBiquadFilter();
  filt.type = 'highpass'; filt.frequency.value = 8000;
  const g = c.createGain();
  src.connect(filt); filt.connect(g); g.connect(sg);
  g.gain.setValueAtTime(gain, time);
  g.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
  src.start(time);
}

// ─── LOBBY: slow pad chords ──────────────────────────────────────────────────

function startLobbyMusic(gen: number, sg: GainNode): void {
  const chords = [
    [PENTA[0], PENTA[2], PENTA[4]],
    [PENTA[1], PENTA[3], PENTA[5]],
    [PENTA[2], PENTA[4], PENTA[6]],
    [PENTA[0], PENTA[3], PENTA[5]],
  ];
  let chordIdx = 0;
  const CHORD_DUR = 4.0;

  const playChord = () => {
    if (generation !== gen) return;
    const chord = chords[chordIdx % chords.length];
    chord.forEach(f => pad(f, CHORD_DUR + 0.5, sg, 0.06));
    chordIdx++;
    setTimeout(playChord, (CHORD_DUR - 0.2) * 1000);
  };

  playChord();
}

// ─── GAME: rhythmic tension ──────────────────────────────────────────────────

function startGameMusic(gen: number, sg: GainNode): void {
  const c = getCtx();
  const BEAT = 0.42;
  const BAR = BEAT * 4;
  let bar = 0;

  const scheduleBar = () => {
    if (generation !== gen) return;
    const now = c.currentTime;
    kick(now, sg); kick(now + BEAT * 2, sg);
    for (let i = 0; i < 4; i++) hihat(now + BEAT * i, sg, 0.035);
    if (bar % 2 === 0) pad(PENTA[bar % PENTA.length], BAR * 2 + 0.3, sg, 0.055);
    bar++;
    setTimeout(scheduleBar, BAR * 1000 - 30);
  };

  scheduleBar();
}

// ─── LANDING: oriental koto + shakuhachi (Hirajoshi) ────────────────────────

const HIRA = [110, 116.54, 146.83, 164.81, 174.61];

function kotoPluck(freq: number, sg: GainNode, gain = 0.13): void {
  const c = getCtx();
  const osc = c.createOscillator(); const g = c.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(freq * 1.018, c.currentTime);
  osc.frequency.exponentialRampToValueAtTime(freq, c.currentTime + 0.04);
  g.gain.setValueAtTime(gain, c.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 2.2);
  osc.connect(g); g.connect(sg);
  osc.start(c.currentTime); osc.stop(c.currentTime + 2.3);
}

function shakuhachi(freq: number, duration: number, sg: GainNode, gain = 0.055): void {
  const c = getCtx();
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
  noise.connect(nf); nf.connect(ng); ng.connect(sg);
  const g = c.createGain();
  g.gain.setValueAtTime(0, c.currentTime);
  g.gain.linearRampToValueAtTime(gain, c.currentTime + 0.55);
  g.gain.setValueAtTime(gain, c.currentTime + duration - 0.7);
  g.gain.linearRampToValueAtTime(0, c.currentTime + duration);
  osc.connect(g); g.connect(sg);
  osc.start(c.currentTime); lfo.start(c.currentTime); noise.start(c.currentTime);
  osc.stop(c.currentTime + duration);
  lfo.stop(c.currentTime + duration);
  noise.stop(c.currentTime + duration);
}

function startLandingMusic(gen: number, sg: GainNode): void {
  const seq: Array<{ delay: number; fn: () => void }> = [
    { delay: 0,     fn: () => kotoPluck(HIRA[0], sg) },
    { delay: 1400,  fn: () => kotoPluck(HIRA[2], sg) },
    { delay: 2600,  fn: () => kotoPluck(HIRA[4] * 2, sg) },
    { delay: 3800,  fn: () => shakuhachi(HIRA[3] * 2, 4.5, sg) },
    { delay: 5000,  fn: () => kotoPluck(HIRA[1] * 2, sg) },
    { delay: 6200,  fn: () => { kotoPluck(HIRA[0], sg); kotoPluck(HIRA[2] * 2, sg); } },
    { delay: 8000,  fn: () => kotoPluck(HIRA[3] * 2, sg) },
    { delay: 9000,  fn: () => shakuhachi(HIRA[0] * 2, 5.5, sg, 0.06) },
    { delay: 10500, fn: () => kotoPluck(HIRA[4], sg) },
    { delay: 11800, fn: () => kotoPluck(HIRA[2], sg) },
    { delay: 13000, fn: () => kotoPluck(HIRA[0], sg) },
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
      const wait = LOOP_MS - s.delay + 800;
      setTimeout(() => { if (generation !== gen) return; step = 0; run(); }, wait);
    }
  };

  run();
}

// ─── Public API ──────────────────────────────────────────────────────────────

export function startMusic(mode: 'landing' | 'lobby' | 'game') {
  if (currentMode === mode) return;
  currentMode = mode;

  // Increment generation — all old loops will bail on next iteration.
  generation++;
  const gen = generation;

  try {
    const c = getCtx();
    if (c.state === 'suspended') {
      c.resume().catch(() => {});
    }

    // Orphan old session gain (fades silently), get fresh one for this session.
    const sg = rotateSession();

    if (mode === 'landing') startLandingMusic(gen, sg);
    else if (mode === 'lobby') startLobbyMusic(gen, sg);
    else startGameMusic(gen, sg);
  } catch {
    // AudioContext blocked before user interaction
  }
}

export function stopMusic() {
  generation++;
  currentMode = null;

  if (sessionGain && ctx) {
    const old = sessionGain;
    const now = ctx.currentTime;
    old.gain.cancelScheduledValues(now);
    old.gain.setValueAtTime(old.gain.value, now);
    old.gain.linearRampToValueAtTime(0, now + 0.3);
    setTimeout(() => { try { old.disconnect(); } catch {} }, 400);
    sessionGain = null;
  }
}
