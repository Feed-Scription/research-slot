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
import { BaiduAnalytics } from './analytics/BaiduAnalytics';

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
            <a
              href="https://github.com/Feed-Scription/research-slot"
              target="_blank"
              rel="noopener noreferrer"
              title="GitHub"
              aria-label="GitHub repository"
              className="btn-ghost !py-1 !px-2.5 md:!py-1.5 md:!px-3 inline-flex items-center"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 16 16"
                aria-hidden="true"
                fill="currentColor"
              >
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
              </svg>
            </a>
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
                  №&nbsp;1996
                </div>
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

      <BaiduAnalytics />
    </div>
  );
}
