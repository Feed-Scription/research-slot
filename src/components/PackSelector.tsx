import { useTranslation } from 'react-i18next';
import { ALL_PACKS, type Locale } from '../data/venues';
import { useGameStore } from '../store/gameStore';

export function PackSelector() {
  const { t, i18n } = useTranslation();
  const lang: Locale = i18n.language.startsWith('zh') ? 'zh-CN' : 'en';
  const enabled = useGameStore((s) => s.enabledPackIds);
  const toggle = useGameStore((s) => s.togglePack);

  return (
    <aside className="sheet p-5">
      <div className="font-mono text-[10px] tracking-[0.32em] text-ink-soft uppercase">
        {t('panels.subscribedSub')}
      </div>
      <h3 className="font-display font-black italic text-2xl leading-none mt-1 mb-4">
        {t('panels.subscribed')}
      </h3>

      <div className="space-y-2">
        {ALL_PACKS.map((p, idx) => {
          const on = enabled.includes(p.id);
          return (
            <button
              key={p.id}
              onClick={() => toggle(p.id)}
              className={`w-full text-left p-3 border-2 transition-all relative ${
                on
                  ? 'border-ink bg-paper shadow-ink-sharp'
                  : 'border-ink/30 bg-paper-warm/40 hover:bg-paper hover:border-ink'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-[9px] tracking-[0.28em] text-ink-soft uppercase">
                  {t('panels.vol', { n: String(idx + 1).padStart(2, '0') })}
                </span>
                <span
                  className={`font-mono text-[9px] tracking-[0.22em] px-1.5 py-0.5 ${
                    on ? 'bg-ink text-paper' : 'border border-ink/40 text-ink-soft'
                  }`}
                >
                  {on ? t('panels.active') : t('panels.muted')}
                </span>
              </div>
              <div className="font-display font-black italic text-lg leading-tight text-ink">
                {p.name[lang]}
              </div>
              <div className="font-serif text-[12px] text-ink-soft mt-1 leading-snug">
                {p.description[lang]}
              </div>
              <div className="font-mono text-[10px] text-ink-muted mt-1.5">
                {t('panels.entries', { n: p.venues.length })}
              </div>
              {on && (
                <div
                  className="absolute -bottom-2 -right-2 stamp-text italic text-oxblood border-2 border-oxblood px-2 text-[10px] bg-paper rotate-6"
                  style={{ boxShadow: 'inset 0 0 0 1px var(--oxblood)' }}
                >
                  {t('panels.subscribedStamp')}
                </div>
              )}
            </button>
          );
        })}
      </div>
      <div className="mt-4 font-mono text-[10px] tracking-[0.18em] text-ink-muted">
        <a
          href="https://github.com/Feed-Scription/research-slot"
          target="_blank"
          rel="noopener noreferrer"
          className="underline decoration-ink-soft underline-offset-2 hover:text-oxblood hover:decoration-oxblood transition-colors"
        >
          {t('panels.dlcMore')}
        </a>
      </div>
    </aside>
  );
}
