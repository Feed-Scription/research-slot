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

export function deriveMetaRating(scores: number[]): Rating {
  const avg = scores.reduce((s, x) => s + x, 0) / scores.length;
  let best = RATINGS[0];
  let bestDiff = Math.abs(best.score - avg);
  for (const r of RATINGS) {
    const d = Math.abs(r.score - avg);
    if (d < bestDiff) {
      best = r;
      bestDiff = d;
    }
  }
  return best;
}
