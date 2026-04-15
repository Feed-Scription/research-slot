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

/** Vite 在 GH Pages 上 base=/research-slot/，在 Vercel 上 base=/。拼路径时用它。 */
const BASE = import.meta.env.BASE_URL;
const asset = (p: string) => `${BASE}${p.replace(/^\//, '')}`;

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

export interface SampleHandle {
  /** 淡出后停止（默认 600ms 指数淡出）。 */
  stop: (fadeMs?: number) => void;
}

function playSample(url: string, volume = 0.6, opts?: { loop?: boolean }): SampleHandle {
  const c = getCtx();
  const handle: SampleHandle = { stop: () => {} };
  if (!c || muted) return handle;
  let stopped = false;
  let src: AudioBufferSourceNode | null = null;
  let gain: GainNode | null = null;
  void loadBuffer(url).then((buf) => {
    if (!buf || stopped) return;
    const cc = getCtx();
    if (!cc) return;
    src = cc.createBufferSource();
    src.buffer = buf;
    src.loop = !!opts?.loop;
    gain = cc.createGain();
    gain.gain.value = volume;
    src.connect(gain);
    gain.connect(cc.destination);
    src.start();
  });
  handle.stop = (fadeMs = 600) => {
    stopped = true;
    const fade = Math.max(0, fadeMs) / 1000;
    if (gain && c) {
      const now = c.currentTime;
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(gain.gain.value, now);
      // 指数曲线听起来更自然（避开 0 值用微小起点）
      gain.gain.exponentialRampToValueAtTime(0.0001, now + fade);
      gain.gain.linearRampToValueAtTime(0, now + fade + 0.02);
    }
    if (src) {
      try {
        src.stop(c ? c.currentTime + fade + 0.05 : undefined);
      } catch {
        /* ignore */
      }
    }
  };
  return handle;
}

/** 预取音效文件，避免第一次触发时的解码延迟。 */
export function prewarmSfx() {
  void loadBuffer(asset('sounds/lever-pull.mp3'));
  void loadBuffer(asset('sounds/reel-spin.mp3'));
  void loadBuffer(asset('sounds/stamp.mp3'));
  void loadBuffer(asset('sounds/happy.mp3'));
  void loadBuffer(asset('sounds/crowd-cheer.mp3'));
  void loadBuffer(asset('sounds/sad.mp3'));
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
  leverPull: () => void playSample(asset('sounds/lever-pull.mp3'), 0.6),
  reelSpin: (): SampleHandle => playSample(asset('sounds/reel-spin.mp3'), 0.45, { loop: false }),
  winAccept: () => {
    void playSample(asset('sounds/stamp.mp3'), 0.7);
    void playSample(asset('sounds/happy.mp3'), 0.55);
  },
  /** Best Paper：stamp + 全场欢呼叠加。 */
  winBestPaper: () => {
    void playSample(asset('sounds/stamp.mp3'), 0.7);
    void playSample(asset('sounds/crowd-cheer.mp3'), 0.55);
  },
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
    void playSample(asset('sounds/stamp.mp3'), 0.7);
    void playSample(asset('sounds/sad.mp3'), 0.7);
  },
};

export function setMuted(m: boolean) {
  muted = m;
}
export function isMuted() {
  return muted;
}
