import { useTranslation } from 'react-i18next';
import { useGameStore } from '../store/gameStore';
import { getRatingById } from '../data/ratings';

export function HistoryPanel() {
  const { t } = useTranslation();
  const history = useGameStore((s) => s.history);
  const totalSpins = useGameStore((s) => s.totalSpins);
  const clear = useGameStore((s) => s.clearHistory);

  const bestCount = history.filter((h) => h.finalRatingId === 'best').length;
  const acceptCount = history.filter((h) =>
    ['best', 'strong_accept', 'weak_accept'].includes(h.finalRatingId)
  ).length;

  return (
    <aside className="sheet p-5 relative">
      <div className="flex items-baseline justify-between mb-4">
        <div>
          <div className="font-mono text-[10px] tracking-[0.32em] text-ink-soft uppercase">
            {t('panels.publicationLogSub')}
          </div>
          <h3 className="font-display font-black italic text-2xl leading-none mt-1">
            {t('panels.publicationLog')}
          </h3>
        </div>
        {history.length > 0 && (
          <button onClick={clear} className="font-mono text-[9px] tracking-[0.2em] text-ink-soft hover:text-oxblood uppercase">
            {t('history.clear')}
          </button>
        )}
      </div>

      <div className="border-t-2 border-b-2 border-double border-ink py-2 mb-3 grid grid-cols-3 text-center">
        <div>
          <div className="font-display font-black italic text-3xl leading-none">{totalSpins}</div>
          <div className="font-mono text-[9px] tracking-[0.22em] uppercase text-ink-soft mt-0.5">{t('history.rolls')}</div>
        </div>
        <div className="border-x border-ink/30">
          <div className="font-display font-black italic text-3xl leading-none text-forest">{acceptCount}</div>
          <div className="font-mono text-[9px] tracking-[0.22em] uppercase text-ink-soft mt-0.5">{t('history.accept')}</div>
        </div>
        <div>
          <div className="font-display font-black italic text-3xl leading-none text-oxblood">{bestCount}</div>
          <div className="font-mono text-[9px] tracking-[0.22em] uppercase text-ink-soft mt-0.5">{t('history.bestPaper')}</div>
        </div>
      </div>

      <div className="space-y-0 max-h-[340px] overflow-y-auto pr-1">
        {history.length === 0 && (
          <div className="py-10 text-center font-italic-display italic text-ink-soft text-sm">
            {t('history.empty')}
          </div>
        )}
        {history.map((h, idx) => {
          const rating = getRatingById(h.finalRatingId);
          const missingCount = h.reviewers.filter((r) => r.missing).length;
          const firstSubmitted = h.reviewers.find((r) => !r.missing);
          const displayEmoji = firstSubmitted?.emoji ?? '⌛';
          return (
            <div key={h.id} className="ledger-row">
              <span className="text-ink-muted">{String(history.length - idx).padStart(3, '0')}</span>
              <span className="min-w-0 flex items-center gap-2">
                <span className={`text-base w-5 text-center leading-none ${!firstSubmitted ? 'opacity-40' : ''}`}>
                  {displayEmoji}
                </span>
                <span className="truncate">
                  <span className="text-ink">{h.venue.name}</span>
                  <span className="mx-1 text-ink-muted">/</span>
                  <span style={{ color: rating.color }}>{t(`ratings.${rating.id}.label`)}</span>
                  {missingCount > 0 && (
                    <span className="ml-1 text-oxblood text-[9px]">·{missingCount}⌛</span>
                  )}
                </span>
              </span>
              <span
                className="text-[9px] px-1.5 uppercase tracking-[0.15em]"
                style={{
                  color: rating.color,
                  borderLeft: `2px solid ${rating.color}`,
                }}
              >
                {t(`rarity.${rating.rarity}`)}
              </span>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
