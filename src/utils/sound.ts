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
  leverPull: () => tone({ freq: 220, slideTo: 80, duration: 0.28, type: 'sawtooth', volume: 0.18 }),
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
