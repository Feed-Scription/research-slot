import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { SlotMachine } from './components/SlotMachine';
import { ResultBurst } from './components/ResultBurst';
import { HistoryPanel } from './components/HistoryPanel';
import { PackSelector } from './components/PackSelector';
import { useGameStore } from './store/gameStore';
import { setMuted, isMuted } from './utils/sound';
import { setLang, getLang, type Lang } from './i18n';

export default function App() {
  const { t, i18n } = useTranslation();
  const result = useGameStore((s) => s.result);
  const [showBurst, setShowBurst] = useState(false);
  const [muted, setMutedState] = useState(isMuted());
  const [, force] = useState(0);

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    setMutedState(next);
  };

  const lang = (i18n.language as Lang) || getLang();
  const toggleLang = () => {
    setLang(lang === 'zh-CN' ? 'en' : 'zh-CN');
    force((n) => n + 1);
  };

  return (
    <div className="min-h-full flex flex-col">
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full px-4 md:px-10 py-3 md:py-4 border-b border-ink/50"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-baseline gap-2 md:gap-3 min-w-0">
            <span className="font-display italic font-black text-xl md:text-2xl leading-none text-ink whitespace-nowrap">
              {t('brand')}
            </span>
            <span className="font-mono text-[9px] md:text-[10px] tracking-[0.2em] md:tracking-[0.3em] text-ink-soft uppercase whitespace-nowrap hidden sm:inline">
              {t('brandShort')}
            </span>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <span className="hidden md:inline font-mono text-[10px] tracking-[0.3em] text-ink-soft uppercase">
              {t('edition')}
            </span>
            <button
              onClick={() => useGameStore.getState().toggleWishMode()}
              className="btn-ghost !py-1 !px-2.5 md:!py-1.5 md:!px-3"
              title={t('wish.tooltip')}
              style={
                useGameStore((s) => s.wishMode)
                  ? {
                      background: 'var(--ink)',
                      color: 'var(--mustard)',
                      borderColor: 'var(--ink)',
                    }
                  : undefined
              }
            >
              {useGameStore((s) => s.wishMode) ? t('wish.on') : t('wish.off')}
            </button>
            <button
              onClick={toggleLang}
              className="btn-ghost !py-1 !px-2.5 md:!py-1.5 md:!px-3"
              title="language"
            >
              {lang === 'zh-CN' ? t('lang.en') : t('lang.zh')}
            </button>
            <button
              onClick={toggleMute}
              className="btn-ghost !py-1 !px-2.5 md:!py-1.5 md:!px-3"
              title="mute"
            >
              {muted ? '⊘' : '♪'}
            </button>
          </div>
        </div>
      </motion.header>

      <main className="flex-1 w-full px-3 sm:px-6 md:px-10 py-3 sm:py-8 md:py-12 max-w-7xl mx-auto">
        <section className="hidden md:block mb-10 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-[1fr_auto] items-end gap-6"
          >
            <div>
              <div className="font-mono text-[10px] tracking-[0.42em] text-ink-soft uppercase mb-3">
                {t('hero.chapter')}
              </div>
              <h1
                className="font-display font-black italic leading-[0.88] text-[clamp(40px,12vw,120px)] text-ink"
                style={{ fontVariationSettings: '"opsz" 144, "SOFT" 40' }}
              >
                {t('hero.titleA')} <span className="text-oxblood">{t('hero.titleB')}</span>
              </h1>
              <div className="mt-4 font-italic-display italic text-xl md:text-2xl text-ink-soft max-w-xl leading-snug">
                {t('hero.descDesktop')}
              </div>
            </div>
            <div className="hidden md:flex flex-col items-end">
              <div className="border-2 border-ink px-4 py-2 text-right">
                <div className="font-mono text-[9px] tracking-[0.3em] text-ink-soft uppercase">
                  {t('hero.volume')}
                </div>
                <div className="font-display font-black italic text-4xl leading-none">XII</div>
                <div className="font-mono text-[9px] tracking-[0.3em] text-ink-soft uppercase mt-1">
                  №&nbsp;1974
                </div>
              </div>
              <div className="mt-2 font-italic-display italic text-sm text-ink-muted">
                {t('hero.handSet')}
              </div>
            </div>
          </motion.div>
          <div className="hidden md:block mt-6 border-t-2 border-b-2 border-double border-ink h-1.5" />
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4 md:gap-8 items-start">
          <div className="min-w-0">
            <SlotMachine onRevealResult={() => setShowBurst(true)} />
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.1 }}
              className="hidden md:block mt-6 text-center font-italic-display italic text-ink-muted max-w-xl mx-auto leading-snug"
            >
              {t('footer.disclaimer')}
            </motion.p>
          </div>

          <motion.aside
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="flex flex-col gap-6"
          >
            <PackSelector />
            <HistoryPanel />
          </motion.aside>
        </section>
      </main>

      <footer className="border-t border-ink/50 py-6 px-6 text-center">
        <div className="font-italic-display italic text-sm text-ink-muted">
          {t('footer.colophon')}
          <span className="sep-star">{t('footer.colophonSub')}</span>
        </div>
        <div className="mt-2 font-mono text-[10px] tracking-[0.18em] text-ink-muted">
          {t('footer.morePrefix')}{' '}
          <a
            href="https://platform.feedscription.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-ink-soft underline-offset-2 hover:text-oxblood hover:decoration-oxblood transition-colors"
          >
            {t('footer.moreLabel')}
          </a>
        </div>
        <div className="mt-1 font-mono text-[10px] tracking-[0.18em] text-ink-muted">
          {t('footer.friendsPrefix')}{' '}
          <a
            href="https://spico197.github.io/accept/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-ink-soft underline-offset-2 hover:text-oxblood hover:decoration-oxblood transition-colors"
          >
            {t('footer.friendsLabel')}
          </a>
        </div>
      </footer>

      <ResultBurst
        result={showBurst ? result : null}
        onClose={() => setShowBurst(false)}
      />
    </div>
  );
}
