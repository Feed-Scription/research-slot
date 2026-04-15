let ctx: AudioContext | null = null;
let muted = false;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

/* ---------- MP3 一次性加载 + 缓存 ---------- */

const bufferCache = new Map<string, Promise<AudioBuffer | null>>();

function loadBuffer(url: string): Promise<AudioBuffer | null> {
  if (bufferCache.has(url)) return bufferCache.get(url)!;
  const c = getCtx();
  if (!c) {
    const fail = Promise.resolve<AudioBuffer | null>(null);
    bufferCache.set(url, fail);
    return fail;
  }
  const p = fetch(url)
    .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error('fetch failed'))))
    .then((buf) => c.decodeAudioData(buf))
    .catch(() => null);
  bufferCache.set(url, p);
  return p;
}

async function playSample(url: string, volume = 0.6) {
  const c = getCtx();
  if (!c || muted) return;
  const buf = await loadBuffer(url);
  if (!buf) return;
  const src = c.createBufferSource();
  src.buffer = buf;
  const gain = c.createGain();
  gain.gain.value = volume;
  src.connect(gain);
  gain.connect(c.destination);
  src.start();
}

/** 预取拉杆音效，避免第一次点击时延迟。在用户首次交互后调用。 */
export function prewarmSfx() {
  void loadBuffer('/sounds/lever-pull.mp3');
}

type ToneOpts = {
  freq: number;
  duration?: number;
  type?: OscillatorType;
  volume?: number;
  attack?: number;
  release?: number;
  slideTo?: number;
};

function tone({ freq, duration = 0.12, type = 'square', volume = 0.15, attack = 0.005, release = 0.06, slideTo }: ToneOpts) {
  const c = getCtx();
  if (!c || muted) return;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, c.currentTime);
  if (slideTo !== undefined) {
    osc.frequency.linearRampToValueAtTime(slideTo, c.currentTime + duration);
  }
  gain.gain.setValueAtTime(0, c.currentTime);
  gain.gain.linearRampToValueAtTime(volume, c.currentTime + attack);
  gain.gain.linearRampToValueAtTime(0, c.currentTime + duration + release);
  osc.connect(gain);
  gain.connect(c.destination);
  osc.start();
  osc.stop(c.currentTime + duration + release + 0.02);
}

export const sfx = {
  leverPull: () => void playSample('/sounds/lever-pull.mp3', 0.6),
  reelTick: () => tone({ freq: 520, duration: 0.04, type: 'square', volume: 0.08 }),
  reelStop: () => tone({ freq: 180, duration: 0.08, type: 'square', volume: 0.12 }),
  winLegendary: () => {
    [523, 659, 784, 1046].forEach((f, i) =>
      setTimeout(() => tone({ freq: f, duration: 0.16, type: 'triangle', volume: 0.2 }), i * 90)
    );
  },
  winEpic: () => {
    [440, 554, 659].forEach((f, i) =>
      setTimeout(() => tone({ freq: f, duration: 0.14, type: 'triangle', volume: 0.18 }), i * 80)
    );
  },
  winRare: () => {
    [392, 523].forEach((f, i) =>
      setTimeout(() => tone({ freq: f, duration: 0.12, type: 'triangle', volume: 0.16 }), i * 70)
    );
  },
  winCommon: () => tone({ freq: 440, duration: 0.1, type: 'triangle', volume: 0.12 }),
  lose: () => tone({ freq: 180, slideTo: 80, duration: 0.5, type: 'sawtooth', volume: 0.18 }),
  curse: () => {
    [200, 150, 90].forEach((f, i) =>
      setTimeout(() => tone({ freq: f, duration: 0.18, type: 'sawtooth', volume: 0.16 }), i * 100)
    );
  },
};

export function setMuted(m: boolean) {
  muted = m;
}
export function isMuted() {
  return muted;
}
