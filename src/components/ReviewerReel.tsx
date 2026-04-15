import { useEffect, useMemo, useRef } from 'react';
import { motion, useMotionValue, animate } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { EMOJIS_BY_RATING, RATINGS, getRatingById, type Rating } from '../data/ratings';
import type { Reviewer } from '../store/gameStore';

interface Props {
  index: number; // 0..2
  finalReviewer: Reviewer | null;
  spinning: boolean;
  spinDurationMs: number;
  onStop?: () => void;
}

const ROMAN = ['I', 'II', 'III'];
const ITEM_H = 148;
const FILLER = 24;
const EASE: [number, number, number, number] = [0.08, 0.55, 0.2, 1];

type StripItem =
  | { kind: 'normal'; emoji: string; comment: string; rating: Rating }
  | { kind: 'missing' };

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function ReviewerReel({ index, finalReviewer, spinning, spinDurationMs, onStop }: Props) {
  const { t } = useTranslation();
  const commentsByRating =
    (t('commentsByRating', { returnObjects: true }) as Record<string, string[]>) || {};

  const y = useMotionValue(0);
  const stoppedRef = useRef(false);

  // 每次 spin 重新生成 filler（key 基于 finalReviewer 身份）
  const fillers: StripItem[] = useMemo(() => {
    return Array.from({ length: FILLER }, () => {
      const r = pick(RATINGS);
      const pool = commentsByRating[r.id] ?? [];
      return {
        kind: 'normal' as const,
        emoji: pick(EMOJIS_BY_RATING[r.id]),
        comment: pool[Math.floor(Math.random() * Math.max(1, pool.length))] ?? '',
        rating: r,
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finalReviewer?.emoji, finalReviewer?.commentIndex, finalReviewer?.ratingId, finalReviewer?.missing]);

  const finalItem: StripItem = useMemo(() => {
    if (!finalReviewer) return fillers[0];
    if (finalReviewer.missing) return { kind: 'missing' };
    const pool = commentsByRating[finalReviewer.ratingId] ?? [];
    return {
      kind: 'normal',
      emoji: finalReviewer.emoji,
      comment: pool[finalReviewer.commentIndex] ?? '',
      rating: getRatingById(finalReviewer.ratingId),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finalReviewer, fillers]);

  const strip: StripItem[] = [...fillers, finalItem];

  useEffect(() => {
    if (!spinning) return;
    stoppedRef.current = false;
    y.set(0);
    const controls = animate(y, -FILLER * ITEM_H, {
      duration: spinDurationMs / 1000,
      ease: EASE,
      onComplete: () => {
        if (stoppedRef.current) return;
        stoppedRef.current = true;
        onStop?.();
      },
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spinning, spinDurationMs]);

  return (
    <div className="specimen relative">
      <span className="specimen-label">{t('reels.reviewer', { n: ROMAN[index] })}</span>
      <div className="specimen-inner relative overflow-hidden">
        <motion.div className="absolute inset-x-0 top-0" style={{ y }}>
          {strip.map((item, i) => (
            <div
              key={i}
              style={{ height: ITEM_H }}
              className="relative"
            >
              {item.kind === 'missing' ? (
                <MissingCard />
              ) : (
                <NormalCard item={item} rotate={index % 2 === 0 ? -3 : 4} />
              )}
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

function NormalCard({
  item,
  rotate,
}: {
  item: { emoji: string; comment: string; rating: Rating };
  rotate: number;
}) {
  const { t } = useTranslation();
  return (
    <>
      <div className="absolute inset-x-0 top-0 h-1/2 flex items-center justify-center">
        <div className="text-5xl md:text-[54px] leading-none select-none">{item.emoji}</div>
      </div>
      <div className="absolute inset-x-3 top-1/2 h-px border-t border-dashed border-ink/30" />
      <div className="absolute inset-x-0 top-1/2 bottom-0 flex flex-col items-center justify-center gap-1.5 px-2">
        <div className="font-italic-display text-[14px] md:text-base leading-tight text-ink text-center">
          「{item.comment}」
        </div>
        <div
          className="stamp-text text-[13px] tracking-[0.06em] px-2 py-0.5 border-[2.5px] inline-block"
          style={{
            color: item.rating.color,
            borderColor: item.rating.color,
            background: 'rgba(241,234,216,0.8)',
            boxShadow: `inset 0 0 0 1px ${item.rating.color}`,
            transform: `rotate(${rotate}deg)`,
          }}
        >
          {t(`ratings.${item.rating.id}.label`)}
        </div>
      </div>
    </>
  );
}

function MissingCard() {
  const { t } = useTranslation();
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-3">
      <div className="text-3xl md:text-4xl leading-none opacity-30">⌛</div>
      <div
        className="stamp-text text-[16px] md:text-[18px] tracking-[0.06em] text-oxblood border-[3px] border-oxblood px-3 py-0.5"
        style={{ boxShadow: 'inset 0 0 0 1.5px var(--oxblood)', transform: 'rotate(-8deg)' }}
      >
        {t('reels.reviewMissing')}
      </div>
      <div className="font-italic-display italic text-[10px] md:text-[11px] text-ink-muted text-center">
        {t('reels.reviewMissingNote')}
      </div>
    </div>
  );
}
