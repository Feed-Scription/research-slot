export type Rarity = 'legendary' | 'epic' | 'rare' | 'uncommon' | 'common' | 'cursed';

/**
 * 评级结构化数据：只保留与语言无关的字段。
 * 标签/副标题走 i18n（`ratings.{id}.label` / `ratings.{id}.tagline`）。
 */
export interface Rating {
  id: 'best' | 'strong_accept' | 'weak_accept' | 'borderline' | 'weak_reject' | 'strong_reject';
  score: number;
  rarity: Rarity;
  weight: number;
  color: string;
}

/**
 * 单审稿人评级权重（普通模式）。
 * 期望值 ≈ 5.26，三审平均 ≥6 的概率 ~23%，折算到 meta 三档裁决时
 * 进一步受 asshole/godfather 6% 概率调制，普通玩家实测 accept ≈ 25%。
 */
export const RATINGS: Rating[] = [
  { id: 'best', score: 10, rarity: 'legendary', weight: 1, color: '#d9a441' },
  { id: 'strong_accept', score: 8, rarity: 'epic', weight: 12, color: '#2e4a3e' },
  { id: 'weak_accept', score: 6, rarity: 'rare', weight: 31, color: '#24406b' },
  { id: 'borderline', score: 5, rarity: 'common', weight: 26, color: '#6a5f52' },
  { id: 'weak_reject', score: 4, rarity: 'uncommon', weight: 20, color: '#8a5a2a' },
  { id: 'strong_reject', score: 2, rarity: 'cursed', weight: 10, color: '#b7312b' },
];

export function getRatingById(id: Rating['id']): Rating {
  return RATINGS.find((r) => r.id === id) ?? RATINGS[3];
}

/**
 * 每档评级的匹配表情池。表情与评语与评级会被同时锁定，观感一致。
 */
export const EMOJIS_BY_RATING: Record<Rating['id'], string[]> = {
  best: ['🏆', '🎉', '👑', '💎', '🚀', '✨', '🥇'],
  strong_accept: ['🔥', '💡', '🎓', '🌟', '📈', '🫡'],
  weak_accept: ['👍', '🙂', '🫠', '🤝', '☕'],
  borderline: ['🤔', '🤷', '😐', '🧠', '😵‍💫', '🙃'],
  weak_reject: ['😤', '📉', '😮‍💨', '🤨', '🙄', '🥴'],
  strong_reject: ['💀', '☠️', '🤡', '🗑️', '🤬', '🥶', '🫥'],
};

export const ALL_EMOJIS: string[] = Object.values(EMOJIS_BY_RATING).flat();

/* ---------- 最终裁决（meta-reviewer 收成 3 档）---------- */

export type MetaId = 'best' | 'accept' | 'reject';

export interface MetaRating {
  id: MetaId;
  rarity: Rarity;
  color: string;
}

export const META_RATINGS: Record<MetaId, MetaRating> = {
  best:   { id: 'best',   rarity: 'legendary', color: '#d9a441' }, // 金
  accept: { id: 'accept', rarity: 'rare',      color: '#2e4a3e' }, // 森林
  reject: { id: 'reject', rarity: 'cursed',    color: '#b7312b' }, // 血红
};

export function getMetaRatingById(id: MetaId): MetaRating {
  return META_RATINGS[id] ?? META_RATINGS.reject;
}

/* ---------- Meta 偏差 ---------- */

/**
 * AC 的最终裁决相对于审稿人共识的偏移：
 * - normal            : 按审稿人均分给结论
 * - asshole           : 下调一档（best→accept / accept→reject）
 * - asshole_extreme   : 从 best 直接降到 reject
 * - godfather         : 上调一档（reject→accept / accept→best）
 * - godfather_extreme : 从 reject 直接升到 best
 * 命名来自社区俗语，含义仅指行为方向，不做评价。
 */
export type MetaFlavor =
  | 'normal'
  | 'asshole'
  | 'asshole_extreme'
  | 'godfather'
  | 'godfather_extreme';

export interface MetaResult {
  verdict: MetaId;
  flavor: MetaFlavor;
}

/** AC 下调一档 / 上调一档 的基础概率。 */
const ASSHOLE_RATE = 0.15;
const GODFATHER_RATE = 0.15;
/** 在 natural=accept 时把结果升到 best 的条件概率——保持 Best 稀有。 */
const GODFATHER_PROMOTE_RATE = 0.03;

/** 跨两档的极端偏移，仅在对应 natural 档触发。 */
const BEST_TO_REJECT_RATE = 0.1; // 在 natural=best 时触发，整体 ~0.01%
const REJECT_TO_BEST_RATE = 0.01; // 在 natural=reject 时触发，整体 ~0.72%

function naturalVerdict(scores: number[]): MetaId {
  if (scores.length === 0) return 'reject';
  const avg = scores.reduce((s, x) => s + x, 0) / scores.length;
  if (avg >= 9) return 'best';
  if (avg >= 6) return 'accept';
  return 'reject';
}

/**
 * AC 最终裁决映射。三档 natural 各自独立抛骰：
 *   natural=best   : 10% → reject (extreme) / 15% → accept (asshole) / 75% → best
 *   natural=accept : 15% → reject (asshole)  /  3% → best (godfather)  / 82% → accept
 *   natural=reject :  1% → best (extreme)    / 15% → accept (godfather)/ 84% → reject
 */
export function deriveFinalVerdict(scores: number[]): MetaResult {
  const natural = naturalVerdict(scores);

  if (natural === 'best') {
    const r = Math.random();
    if (r < BEST_TO_REJECT_RATE) return { verdict: 'reject', flavor: 'asshole_extreme' };
    if (r < BEST_TO_REJECT_RATE + ASSHOLE_RATE) return { verdict: 'accept', flavor: 'asshole' };
    return { verdict: 'best', flavor: 'normal' };
  }
  if (natural === 'accept') {
    const r = Math.random();
    if (r < ASSHOLE_RATE) return { verdict: 'reject', flavor: 'asshole' };
    if (r < ASSHOLE_RATE + GODFATHER_PROMOTE_RATE) return { verdict: 'best', flavor: 'godfather' };
    return { verdict: 'accept', flavor: 'normal' };
  }
  // natural === 'reject'
  const r = Math.random();
  if (r < REJECT_TO_BEST_RATE) return { verdict: 'best', flavor: 'godfather_extreme' };
  if (r < REJECT_TO_BEST_RATE + GODFATHER_RATE) return { verdict: 'accept', flavor: 'godfather' };
  return { verdict: 'reject', flavor: 'normal' };
}
