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

/* ---------- Meta 个人偏差 ---------- */

/**
 * - normal     : meta 按审稿人均分给结论
 * - asshole    : 傻逼 meta — 高分也拒（reviewer 共识被强行下调一档）
 * - godfather  : 亲爹 meta — 低分也收（强行上调一档）
 */
export type MetaFlavor = 'normal' | 'asshole' | 'godfather';

export interface MetaResult {
  verdict: MetaId;
  flavor: MetaFlavor;
}

const ASSHOLE_RATE = 0.06; // 高分被傻逼 meta 拒
const GODFATHER_RATE = 0.06; // 低分被亲爹 meta 收

function naturalVerdict(scores: number[]): MetaId {
  if (scores.length === 0) return 'reject';
  const avg = scores.reduce((s, x) => s + x, 0) / scores.length;
  if (avg >= 9) return 'best';
  if (avg >= 6) return 'accept';
  return 'reject';
}

/**
 * 三档裁决，但 meta 有 ~6%/6% 的几率推翻审稿人共识：
 *   - asshole : best → accept / accept → reject
 *   - godfather : reject → accept / accept → best
 */
export function deriveFinalVerdict(scores: number[]): MetaResult {
  const natural = naturalVerdict(scores);
  const roll = Math.random();

  if (natural === 'best' && roll < ASSHOLE_RATE) {
    return { verdict: 'accept', flavor: 'asshole' };
  }
  if (natural === 'accept' && roll < ASSHOLE_RATE) {
    return { verdict: 'reject', flavor: 'asshole' };
  }
  if (natural === 'reject' && roll < GODFATHER_RATE) {
    return { verdict: 'accept', flavor: 'godfather' };
  }
  if (natural === 'accept' && roll < ASSHOLE_RATE + GODFATHER_RATE) {
    return { verdict: 'best', flavor: 'godfather' };
  }
  return { verdict: natural, flavor: 'normal' };
}
