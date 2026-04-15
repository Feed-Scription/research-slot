import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import type { SpinResult } from '../store/gameStore';
import { getRatingById, getMetaRatingById, type Rarity } from '../data/ratings';

interface ResultBurstProps {
  result: SpinResult | null;
  onClose: () => void;
}

const STAMP_ROTATE: Record<Rarity, number> = {
  legendary: -6,
  epic: -9,
  rare: -5,
  uncommon: 7,
  common: -3,
  cursed: 11,
};

function InkSplatter({ color, seed }: { color: string; seed: number }) {
  const rnd = (i: number) => {
    const x = Math.sin(seed * 9301 + i * 49297) * 233280;
    return x - Math.floor(x);
  };
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 400">
      {Array.from({ length: 38 }).map((_, i) => {
        const angle = rnd(i) * Math.PI * 2;
        const r = 40 + rnd(i + 100) * 180;
        const cx = 200 + Math.cos(angle) * r;
        const cy = 200 + Math.sin(angle) * r;
        const rr = 1.5 + rnd(i + 200) * 6;
        return <circle key={i} cx={cx} cy={cy} r={rr} fill={color} opacity={0.55 + rnd(i + 300) * 0.4} />;
      })}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = rnd(i + 500) * Math.PI * 2;
        const r = 80 + rnd(i + 600) * 140;
        const cx = 200 + Math.cos(angle) * r;
        const cy = 200 + Math.sin(angle) * r;
        return (
          <ellipse
            key={`e-${i}`}
            cx={cx}
            cy={cy}
            rx={10 + rnd(i + 700) * 20}
            ry={3 + rnd(i + 800) * 6}
            transform={`rotate(${rnd(i + 900) * 360} ${cx} ${cy})`}
            fill={color}
            opacity={0.4}
          />
        );
      })}
    </svg>
  );
}

export function ResultBurst({ result, onClose }: ResultBurstProps) {
  const { t } = useTranslation();
  const commentsByRating = (t('commentsByRating', { returnObjects: true }) as Record<string, string[]>) || {};
  const finalRating = result ? getMetaRatingById(result.finalVerdict) : null;

  return (
    <AnimatePresence>
      {result && finalRating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(26,22,19,0.72)' }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 22 }}
            onClick={(e) => e.stopPropagation()}
            className="sheet paper-shake relative max-w-xl w-full p-5 sm:p-8"
            style={{ background: 'var(--paper)' }}
          >
            <div className="text-center">
              <div className="font-mono text-[10px] tracking-[0.4em] uppercase text-ink-soft">
                {t('burst.certificateOf')}
              </div>
              <div className="mt-1 rule-fancy">
                <span className="font-italic-display text-xl italic">{t('burst.decision')}</span>
              </div>
              <div className="font-display italic font-black text-3xl mt-2" style={{ fontVariationSettings: '"opsz" 144' }}>
                {result.venue.name}
              </div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-1.5 sm:gap-2">
              {result.reviewers.map((r, i) => {
                if (r.missing) {
                  return (
                    <div
                      key={i}
                      className="border-2 border-dashed border-oxblood/70 bg-paper-warm/40 p-1.5 sm:p-2 text-center"
                    >
                      <div className="font-mono text-[9px] tracking-[0.22em] text-ink-soft uppercase">
                        R{i + 1}
                      </div>
                      <div className="text-2xl sm:text-3xl my-1 leading-none opacity-30">⌛</div>
                      <div className="font-italic-display italic text-[10px] sm:text-[11px] leading-tight text-ink-muted min-h-[28px] flex items-center justify-center">
                        {t('reels.reviewMissingNote')}
                      </div>
                      <div className="font-mono text-[8px] mt-1 tracking-widest uppercase py-0.5 border border-oxblood text-oxblood -rotate-3 inline-block px-1.5">
                        {t('reels.reviewMissingShort')}
                      </div>
                    </div>
                  );
                }
                const rating = getRatingById(r.ratingId);
                const pool = commentsByRating[r.ratingId] ?? [];
                const commentText = pool[r.commentIndex] ?? '';
                return (
                  <div key={i} className="border border-ink/70 bg-paper-warm/60 p-1.5 sm:p-2 text-center">
                    <div className="font-mono text-[9px] tracking-[0.22em] text-ink-soft uppercase">
                      R{i + 1}
                    </div>
                    <div className="text-2xl sm:text-3xl my-1 leading-none">{r.emoji}</div>
                    <div className="font-italic-display italic text-[10px] sm:text-[11px] leading-tight text-ink/85 min-h-[28px]">
                      「{commentText}」
                    </div>
                    <div
                      className="font-mono text-[8px] mt-1 tracking-widest uppercase py-0.5 border"
                      style={{ color: rating.color, borderColor: rating.color }}
                    >
                      {t(`ratings.${rating.id}.label`)}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 relative h-44 flex items-center justify-center">
              <InkSplatter color={finalRating.color} seed={result.timestamp} />
              <motion.div
                initial={{ scale: 2.2, rotate: STAMP_ROTATE[finalRating.rarity] - 25, opacity: 0 }}
                animate={{ scale: 1, rotate: STAMP_ROTATE[finalRating.rarity], opacity: 1 }}
                transition={{ type: 'spring', stiffness: 420, damping: 16, delay: 0.05 }}
                className="relative"
              >
                <div
                  className="border-[5px] px-8 py-3"
                  style={{
                    borderColor: finalRating.color,
                    color: finalRating.color,
                    boxShadow: `inset 0 0 0 2px ${finalRating.color}`,
                  }}
                >
                  <div className="stamp-text text-3xl sm:text-4xl md:text-5xl" style={{ letterSpacing: '0.04em' }}>
                    {t(`meta.${finalRating.id}.label`)}
                  </div>
                  <div
                    className="font-mono text-[9px] tracking-[0.4em] uppercase mt-1 text-center"
                    style={{ color: finalRating.color }}
                  >
                    {t('burst.certified', { rarity: t(`rarity.${finalRating.rarity}`) })}
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="text-center mt-2">
              {result.metaFlavor !== 'normal' && (
                <div
                  className="mb-1 font-mono text-[10px] tracking-[0.28em] uppercase"
                  style={{ color: result.metaFlavor === 'godfather' ? 'var(--forest)' : 'var(--oxblood)' }}
                >
                  ▶ {t(`meta.flavor.${result.metaFlavor}`)}
                </div>
              )}
              <div className="font-italic-display text-xl italic text-ink">
                {result.reviewers.every((r) => r.missing)
                  ? t('reels.allMissingTagline')
                  : t(`meta.${finalRating.id}.tagline`)}
              </div>
              <div className="mt-3 font-mono text-[10px] tracking-[0.3em] text-ink-soft uppercase">
                {t('burst.dismiss')}
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center border-2 border-ink text-ink hover:bg-ink hover:text-paper transition-colors z-10"
              aria-label={t('burst.close')}
            >
              <span className="text-lg leading-none">×</span>
            </button>
            <div className="absolute top-3 right-12 font-mono text-[9px] text-ink-soft tracking-widest">
              № {String(result.timestamp).slice(-6)}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
