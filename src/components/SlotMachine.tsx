import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useGameStore } from '../store/gameStore';
import { getActiveVenues } from '../data/venues';
import { VenueReel } from './VenueReel';
import { ReviewerReel } from './ReviewerReel';
import { Lever } from './Lever';
import { sfx, type SampleHandle } from '../utils/sound';

interface Props {
  onRevealResult: () => void;
}

/** 每个滚轮的总动画时长（ms）。尾段用 cubic-bezier 减速，最后一轮落定后 +1s 停留才爆结果。 */
const SPIN_DURATIONS = [2200, 2800, 3400, 4000] as const;
const POST_STOP_HOLD_MS = 1000;

export function SlotMachine({ onRevealResult }: Props) {
  const { t } = useTranslation();
  const phase = useGameStore((s) => s.phase);
  const pending = useGameStore((s) => s.pending);
  const result = useGameStore((s) => s.result);
  const spin = useGameStore((s) => s.spin);
  const reveal = useGameStore((s) => s.reveal);
  const enabledPackIds = useGameStore((s) => s.enabledPackIds);
  const wishMode = useGameStore((s) => s.wishMode);

  const [pulled, setPulled] = useState(false);
  const [showNoPackHint, setShowNoPackHint] = useState(false);
  const stopCountRef = useRef(0);
  const spinSoundRef = useRef<SampleHandle | null>(null);

  const spinning = phase === 'spinning';
  const displayed = pending ?? result;
  const finalVenue = displayed?.venue ?? null;
  const finalReviewers = displayed?.reviewers ?? null;
  const venuePool = getActiveVenues(enabledPackIds);

  const handlePull = () => {
    if (spinning) return;
    if (venuePool.length === 0) {
      setShowNoPackHint(true);
      window.setTimeout(() => setShowNoPackHint(false), 3200);
      return;
    }
    stopCountRef.current = 0;
    setPulled(true);
    sfx.leverPull();
    // 拉杆响后紧跟转轴声，最后一轮落定时停掉
    spinSoundRef.current?.stop();
    spinSoundRef.current = sfx.reelSpin();
    spin();
    window.setTimeout(() => setPulled(false), 620);
  };

  const handleReelStop = () => {
    stopCountRef.current += 1;
    if (stopCountRef.current >= 4) {
      // 最后一轮落定：停掉转轴声，先停留 1 秒让观众看清楚，再结算 + 爆结果
      spinSoundRef.current?.stop();
      spinSoundRef.current = null;
      const verdict = pending?.finalVerdict;
      window.setTimeout(() => {
        reveal();
        if (verdict === 'best') sfx.winBestPaper();
        else if (verdict === 'accept') sfx.winAccept();
        else if (verdict === 'reject') sfx.curse();
        onRevealResult();
      }, POST_STOP_HOLD_MS);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
      className="sheet relative p-4 sm:p-6 md:p-10"
    >
      <div className="hidden sm:block absolute top-4 right-6 font-mono text-[10px] tracking-[0.3em] text-ink-soft uppercase">
        {t('form7b')}
      </div>

      {/* 许愿模式角章 */}
      {wishMode && (
        <motion.div
          initial={{ scale: 0.5, opacity: 0, rotate: -20 }}
          animate={{ scale: 1, opacity: 1, rotate: -8 }}
          transition={{ type: 'spring', stiffness: 320, damping: 14 }}
          className="absolute top-2 left-3 sm:top-3 sm:left-6 z-10 stamp-text italic text-mustard border-[3px] border-mustard px-2.5 py-0.5 text-[12px] sm:text-[14px]"
          style={{
            boxShadow: 'inset 0 0 0 1.5px var(--mustard), 0 0 18px rgba(217,164,65,0.35)',
            background: 'var(--paper)',
          }}
        >
          ★ {t('wish.stamp')} ★
        </motion.div>
      )}

      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.15 }}
        className="masthead relative"
      >
        <div className="font-mono text-[9px] sm:text-[10px] tracking-[0.28em] sm:tracking-[0.42em] uppercase text-ink-soft mb-2">
          <span className="sm:hidden">{t('masthead.metaShort')}</span>
          <span className="hidden sm:inline">{t('masthead.metaFull')}</span>
        </div>
        <div className="masthead-title">{t('masthead.title')}</div>
        <div className="masthead-sub">{t('masthead.sub')}</div>
        <div
          className="hidden sm:block absolute top-3 left-4 stamp-text italic text-oxblood border-[3px] border-oxblood px-2 py-0.5 text-[11px] -rotate-[9deg]"
          style={{ boxShadow: 'inset 0 0 0 1.5px var(--oxblood)' }}
        >
          {t('masthead.certified')}
        </div>
        <div className="hidden sm:block absolute top-3 right-4 font-mono text-[9px] tracking-[0.3em] text-ink-soft">
          {t('masthead.issn')}
        </div>
      </motion.header>

      <div className="mt-4 md:mt-8 flex flex-col items-center gap-3 md:gap-10 md:grid md:grid-cols-[1fr_auto] md:items-center">
        <motion.div
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.12, delayChildren: 0.35 } },
          }}
          className="w-full grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4"
        >
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
              }}
              className="relative"
            >
              {i === 0 ? (
                <VenueReel
                  pool={venuePool}
                  finalItem={finalVenue}
                  spinning={spinning}
                  spinDurationMs={SPIN_DURATIONS[0]}
                  onStop={handleReelStop}
                />
              ) : (
                <ReviewerReel
                  index={i - 1}
                  finalReviewer={finalReviewers ? finalReviewers[i - 1] : null}
                  spinning={spinning}
                  spinDurationMs={SPIN_DURATIONS[i]}
                  onStop={handleReelStop}
                />
              )}
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.55 }}
          className="relative"
        >
          <AnimatePresence>
            {showNoPackHint && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[10px] text-oxblood bg-paper border-2 border-oxblood px-3 py-1 shadow-[4px_4px_0_var(--oxblood)] z-10"
              >
                {t('lever.noPackHint')}
              </motion.div>
            )}
          </AnimatePresence>
          <Lever onPull={handlePull} disabled={spinning} pulled={pulled} />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.9 }}
        className="mt-8 fig-caption leading-relaxed"
      >
        {t('fig.caption')}
      </motion.div>

      <div className="hidden md:block mt-6 border-t border-dashed border-ink/40 pt-3 font-mono text-[9px] tracking-[0.15em] text-ink-muted uppercase leading-relaxed">
        {t('patent')}
      </div>
    </motion.div>
  );
}
