import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  getActiveVenues,
  getDefaultEnabledPackIds,
  ALL_PACKS,
  type Venue,
  type Locale,
} from '../data/venues';
import {
  RATINGS,
  type Rating,
  type MetaId,
  type MetaFlavor,
  deriveFinalVerdict,
  EMOJIS_BY_RATING,
} from '../data/ratings';
import i18n from '../i18n';

export interface Reviewer {
  /** 审稿人逾期未提交。其它字段在 missing 时无意义。 */
  missing: boolean;
  emoji: string;
  ratingId: Rating['id'];
  /** spin 时解析好的评语文本（来自 pack 专属池或全局 i18n 池）。 */
  comment: string;
}

export interface SpinResult {
  id: string;
  timestamp: number;
  venue: Venue;
  reviewers: [Reviewer, Reviewer, Reviewer];
  finalVerdict: MetaId;
  metaFlavor: MetaFlavor;
}

type Phase = 'idle' | 'spinning' | 'revealed';

interface GameState {
  phase: Phase;
  pending: SpinResult | null;
  result: SpinResult | null;
  history: SpinResult[];
  totalSpins: number;
  enabledPackIds: string[];
  wishMode: boolean;

  spin: () => SpinResult;
  reveal: () => void;
  reset: () => void;
  clearHistory: () => void;
  togglePack: (id: string) => void;
  toggleWishMode: () => void;
}

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function weightedPick<T extends { weight: number }>(arr: readonly T[]): T {
  const total = arr.reduce((s, x) => s + x.weight, 0);
  let r = Math.random() * total;
  for (const item of arr) {
    r -= item.weight;
    if (r <= 0) return item;
  }
  return arr[arr.length - 1];
}

const MISSING_RATE = 0.12;

const WISH_WEIGHTS: Record<Rating['id'], number> = {
  best: 30,
  strong_accept: 40,
  weak_accept: 25,
  borderline: 3,
  weak_reject: 1.5,
  strong_reject: 0.5,
};

/* ---------- 评语池解析 ---------- */

function getLang(): Locale {
  return (i18n.language?.startsWith('zh') ? 'zh-CN' : 'en') as Locale;
}

/**
 * 给定 venue 所在 pack + 当前语言 + 评级，返回应该使用的评语字符串池。
 * pack 有自定义 → 用 pack 的；否则 fallback 全局 i18n。
 */
function getCommentPool(venue: Venue, ratingId: Rating['id']): string[] {
  const lang = getLang();
  // 找到 venue 所属的 pack
  const pack = ALL_PACKS.find((p) => p.venues.some((v) => v.name === venue.name));
  const packPool = pack?.commentsByRating?.[lang]?.[ratingId];
  if (packPool && packPool.length > 0) return packPool;
  // fallback: 全局 i18n
  const global = i18n.t(`commentsByRating.${ratingId}`, { returnObjects: true });
  return Array.isArray(global) && global.length > 0 ? (global as string[]) : ['...'];
}

function rollReviewer(wishMode: boolean, venue: Venue): Reviewer {
  const missingRate = wishMode ? 0.02 : MISSING_RATE;
  if (Math.random() < missingRate) {
    return { missing: true, emoji: '', ratingId: 'borderline', comment: '' };
  }
  const ratingsPool = wishMode
    ? RATINGS.map((r) => ({ ...r, weight: WISH_WEIGHTS[r.id] }))
    : RATINGS;
  const rating = weightedPick(ratingsPool);
  const emoji = pick(EMOJIS_BY_RATING[rating.id]);
  const pool = getCommentPool(venue, rating.id);
  const comment = pick(pool);
  return { missing: false, emoji, ratingId: rating.id, comment };
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      phase: 'idle',
      pending: null,
      result: null,
      history: [],
      totalSpins: 0,
      enabledPackIds: getDefaultEnabledPackIds(),
      wishMode: false,

      spin: () => {
        const wish = get().wishMode;
        const venues = getActiveVenues(get().enabledPackIds);
        const fallback = venues.length > 0 ? venues : getActiveVenues(getDefaultEnabledPackIds());
        const wished = wish ? fallback.filter((v) => v.tier === 'god' || v.tier === 'top') : fallback;
        const venuePool = wished.length > 0 ? wished : fallback;
        const venue = pick(venuePool);
        const reviewers = [
          rollReviewer(wish, venue),
          rollReviewer(wish, venue),
          rollReviewer(wish, venue),
        ] as [Reviewer, Reviewer, Reviewer];
        const submitted = reviewers.filter((r) => !r.missing);
        const meta = deriveFinalVerdict(
          submitted.map((r) => RATINGS.find((x) => x.id === r.ratingId)?.score ?? 5),
          { suppressAsshole: wish }
        );
        const result: SpinResult = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          timestamp: Date.now(),
          venue,
          reviewers,
          finalVerdict: meta.verdict,
          metaFlavor: meta.flavor,
        };
        set({ phase: 'spinning', pending: result, result: null });
        return result;
      },

      reveal: () => {
        const { pending, history, totalSpins } = get();
        if (!pending) return;
        set({
          phase: 'revealed',
          result: pending,
          pending: null,
          totalSpins: totalSpins + 1,
          history: [pending, ...history].slice(0, 50),
        });
      },

      reset: () => set({ phase: 'idle', pending: null, result: null }),

      clearHistory: () => set({ history: [], totalSpins: 0 }),

      togglePack: (id) => {
        const ids = get().enabledPackIds;
        set({
          enabledPackIds: ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id],
        });
      },

      toggleWishMode: () => set({ wishMode: !get().wishMode }),
    }),
    {
      name: 'research-slot-v8',
      partialize: (s) => ({
        history: s.history,
        totalSpins: s.totalSpins,
        enabledPackIds: s.enabledPackIds,
        wishMode: s.wishMode,
      }),
    }
  )
);
