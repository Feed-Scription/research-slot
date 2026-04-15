import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  getActiveVenues,
  getDefaultEnabledPackIds,
  type Venue,
} from '../data/venues';
import { COMMENT_COUNTS } from '../data/comments';
import {
  RATINGS,
  type Rating,
  type MetaId,
  deriveFinalVerdict,
  EMOJIS_BY_RATING,
} from '../data/ratings';

export interface Reviewer {
  /** 审稿人逾期未提交。其它字段在 missing 时无意义（保留只为序列化稳定）。 */
  missing: boolean;
  emoji: string;
  /** 评级 id（决定 emoji 和评语的池子） */
  ratingId: Rating['id'];
  /** 索引进该评级池（i18n `commentsByRating.{ratingId}[commentIndex]`） */
  commentIndex: number;
}

export interface SpinResult {
  id: string;
  timestamp: number;
  venue: Venue;
  reviewers: [Reviewer, Reviewer, Reviewer];
  /** Meta-reviewer 的三档裁决：'best' | 'accept' | 'reject' */
  finalVerdict: MetaId;
}

type Phase = 'idle' | 'spinning' | 'revealed';

interface GameState {
  phase: Phase;
  pending: SpinResult | null;
  result: SpinResult | null;
  history: SpinResult[];
  totalSpins: number;
  enabledPackIds: string[];
  /** 许愿模式：天命所归，95% accept + 仅顶刊顶会 + 审稿人不缺席。 */
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

/** 审稿人未提交评审的概率。学术圈常态。 */
const MISSING_RATE = 0.12;

/**
 * 许愿模式权重：累计 95% accept（best/strong/weak），其余 5% 是 borderline + 拒。
 * 故意保留极小概率诅咒，提供反差喜剧效果。
 */
const WISH_WEIGHTS: Record<Rating['id'], number> = {
  best: 30,
  strong_accept: 40,
  weak_accept: 25,
  borderline: 3,
  weak_reject: 1.5,
  strong_reject: 0.5,
};

function rollReviewer(wishMode: boolean): Reviewer {
  // 许愿模式下审稿人天命般地按时提交
  const missingRate = wishMode ? 0.02 : MISSING_RATE;
  if (Math.random() < missingRate) {
    return { missing: true, emoji: '', ratingId: 'borderline', commentIndex: 0 };
  }
  const ratingsPool = wishMode
    ? RATINGS.map((r) => ({ ...r, weight: WISH_WEIGHTS[r.id] }))
    : RATINGS;
  const rating = weightedPick(ratingsPool);
  const emoji = pick(EMOJIS_BY_RATING[rating.id]);
  const commentIndex = Math.floor(Math.random() * COMMENT_COUNTS[rating.id]);
  return { missing: false, emoji, ratingId: rating.id, commentIndex };
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
        // 许愿模式：只挑顶刊顶会（god + top）；若过滤后为空再降级到完整池
        const wished = wish ? fallback.filter((v) => v.tier === 'god' || v.tier === 'top') : fallback;
        const venuePool = wished.length > 0 ? wished : fallback;
        const reviewers = [rollReviewer(wish), rollReviewer(wish), rollReviewer(wish)] as [
          Reviewer,
          Reviewer,
          Reviewer,
        ];
        const submitted = reviewers.filter((r) => !r.missing);
        // 全员不交 → AC 单独决定，默认 reject；否则按交了的人均分映射到 3 档
        const finalVerdict = deriveFinalVerdict(
          submitted.map((r) => RATINGS.find((x) => x.id === r.ratingId)?.score ?? 5)
        ).id;
        const result: SpinResult = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          timestamp: Date.now(),
          venue: pick(venuePool),
          reviewers,
          finalVerdict,
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
      name: 'research-slot-v6',
      partialize: (s) => ({
        history: s.history,
        totalSpins: s.totalSpins,
        enabledPackIds: s.enabledPackIds,
        wishMode: s.wishMode,
      }),
    }
  )
);
