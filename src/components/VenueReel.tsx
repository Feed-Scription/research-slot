import { useEffect, useMemo, useRef } from 'react';
import { motion, useMotionValue, animate } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import type { Venue } from '../data/venues';

interface Props {
  pool: Venue[];
  finalItem: Venue | null;
  spinning: boolean;
  /** 整段滚动 + 减速的总时长（ms） */
  spinDurationMs: number;
  onStop?: () => void;
}

const TIER_COLOR: Record<Venue['tier'], string> = {
  god: 'var(--oxblood)',
  top: 'var(--forest)',
  mid: 'var(--navy)',
  meme: 'var(--ink-muted)',
};

const ITEM_H = 148; // 与 .specimen-inner 高度一致
const FILLER = 22; // 滚动穿过多少个填充条目再落定
const EASE: [number, number, number, number] = [0.08, 0.55, 0.2, 1];

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function VenueReel({ pool, finalItem, spinning, spinDurationMs, onStop }: Props) {
  const { t } = useTranslation();
  const y = useMotionValue(0);
  const stoppedRef = useRef(false);

  // filler 列表在本次 spin 期间稳定
  const fillers = useMemo(() => {
    if (pool.length === 0) return [];
    return Array.from({ length: FILLER }, () => pick(pool));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finalItem?.name, pool.length]);

  const strip: Venue[] = pool.length > 0 ? [...fillers, finalItem ?? fillers[0]] : [];

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
      <span className="specimen-label">{t('reels.venue')}</span>
      <span className="specimen-sn">{t('reels.venueSerial')}</span>
      <div className="specimen-inner relative overflow-hidden">
        <motion.div className="absolute inset-x-0 top-0" style={{ y }}>
          {pool.length === 0 ? (
            <div
              style={{ height: ITEM_H }}
              className="flex flex-col items-center justify-center gap-2 px-3"
            >
              <div className="text-3xl md:text-4xl leading-none opacity-30">📦</div>
              <div className="font-italic-display italic text-[13px] md:text-[15px] text-oxblood border-[3px] border-oxblood px-3 py-0.5 -rotate-6"
                style={{ boxShadow: 'inset 0 0 0 1.5px var(--oxblood)' }}
              >
                {t('reels.noVenueTitle')}
              </div>
              <div className="font-italic-display italic text-[10px] md:text-[11px] text-ink-muted text-center max-w-[90%]">
                {t('reels.noVenueNote')}
              </div>
            </div>
          ) : (
            strip.map((v, i) => (
              <div
                key={i}
                style={{ height: ITEM_H }}
                className="flex flex-col items-center justify-center gap-1 px-3"
              >
                <div className="font-mono text-[8.5px] tracking-[0.3em] uppercase text-ink-muted">
                  {t('reels.targeting')}
                </div>
                <div
                  className="font-display font-black italic leading-[0.9] text-center"
                  style={{
                    fontSize: `clamp(22px, ${Math.max(22, 40 - v.name.length * 1.1)}px, 46px)`,
                    fontVariationSettings: '"opsz" 144, "SOFT" 30',
                    color: 'var(--ink)',
                  }}
                >
                  {v.name}
                </div>
                <div
                  className="font-mono text-[9px] tracking-[0.26em] uppercase"
                  style={{ color: TIER_COLOR[v.tier] }}
                >
                  — {t(`reels.tierLabel.${v.tier}`)} —
                </div>
                <div
                  className="font-italic-display italic text-[11px]"
                  style={{ color: TIER_COLOR[v.tier], opacity: 0.85 }}
                >
                  {t(`reels.tierFlavor.${v.tier}`)}
                </div>
              </div>
            ))
          )}
        </motion.div>
      </div>
    </div>
  );
}
