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

export const RATINGS: Rating[] = [
  { id: 'best', score: 10, rarity: 'legendary', weight: 1, color: '#d9a441' },
  { id: 'strong_accept', score: 8, rarity: 'epic', weight: 5, color: '#2e4a3e' },
  { id: 'weak_accept', score: 6, rarity: 'rare', weight: 20, color: '#24406b' },
  { id: 'borderline', score: 5, rarity: 'common', weight: 34, color: '#6a5f52' },
  { id: 'weak_reject', score: 4, rarity: 'uncommon', weight: 25, color: '#8a5a2a' },
  { id: 'strong_reject', score: 2, rarity: 'cursed', weight: 15, color: '#b7312b' },
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

/**
 * 三档裁决：avg ≥ 9 → Best Paper；6 ≤ avg < 9 → Accept；avg < 6 → Reject。
 * 单条 Best Paper（10）自动收为 Best；3 个 Strong Accept (8) 平均 8 → Accept；
 * 任意 borderline-下 → Reject（meta 不再有"边缘"出口）。
 */
export function deriveFinalVerdict(scores: number[]): MetaRating {
  if (scores.length === 0) return META_RATINGS.reject;
  const avg = scores.reduce((s, x) => s + x, 0) / scores.length;
  if (avg >= 9) return META_RATINGS.best;
  if (avg >= 6) return META_RATINGS.accept;
  return META_RATINGS.reject;
}
