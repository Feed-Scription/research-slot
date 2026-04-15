import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface LeverProps {
  onPull: () => void;
  disabled: boolean;
  pulled: boolean;
}

const W = 160;
const H = 360;
const CX = 80;

export function Lever({ onPull, disabled, pulled }: LeverProps) {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      aria-label={t('lever.aria')}
      disabled={disabled}
      onClick={onPull}
      className="relative w-[120px] md:w-[160px] disabled:cursor-not-allowed group bg-transparent flex flex-col items-center"
    >
      <div className="h-5 flex items-center fig-caption whitespace-nowrap mb-1 text-[9px] md:text-[10px]">
        <span className="num">{t('lever.figCaption')}</span>
        <span className="mx-1 text-ink-muted">·</span>
        <span className="text-ink-soft">{t('lever.figSub')}</span>
      </div>

      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ height: 'auto', aspectRatio: `${W} / ${H}` }}>
        <defs>
          <radialGradient id="brass" cx="30%" cy="28%" r="75%">
            <stop offset="0%" stopColor="#fff2c0" />
            <stop offset="32%" stopColor="#d9a441" />
            <stop offset="75%" stopColor="#8a5a10" />
            <stop offset="100%" stopColor="#3a2200" />
          </radialGradient>
        </defs>

        <rect x={CX - 4} y={70} width={8} height={220} fill="#f1ead8" stroke="#1a1613" strokeWidth="1.8" />
        <line x1={CX - 1} y1={70} x2={CX - 1} y2={290} stroke="#1a1613" strokeWidth="0.6" />
        <circle cx={CX} cy={290} r="7" fill="#f1ead8" stroke="#1a1613" strokeWidth="1.8" />
        <circle cx={CX} cy={290} r="2" fill="#1a1613" />

        <rect x={CX - 52} y={290} width={104} height={36} fill="#1a1613" />
        <rect x={CX - 52} y={290} width={104} height={36} fill="none" stroke="#1a1613" strokeWidth="2" />
        {[-38, -16, 16, 38].map((dx) => (
          <g key={dx}>
            <circle cx={CX + dx} cy={308} r="4" fill="#f1ead8" stroke="#1a1613" strokeWidth="1.5" />
            <circle cx={CX + dx} cy={308} r="1" fill="#1a1613" />
          </g>
        ))}
        {[0, 1, 2, 3, 4].map((i) => (
          <line
            key={i}
            x1={CX - 50 + i * 3}
            y1={326}
            x2={CX - 50 + i * 3 - 4}
            y2={332}
            stroke="#1a1613"
            strokeWidth="0.8"
          />
        ))}

        <motion.g
          animate={{ y: pulled ? 210 : 0, rotate: pulled ? 45 : 0 }}
          transition={{ type: 'spring', stiffness: 220, damping: 14 }}
          style={{ transformOrigin: `${CX}px 70px`, transformBox: 'fill-box' as const }}
        >
          <circle cx={CX} cy={70} r={30} fill="url(#brass)" stroke="#1a1613" strokeWidth="2" />
          <ellipse cx={CX - 10} cy={58} rx={8} ry={5} fill="rgba(255,255,255,0.55)" />
          <text
            x={CX}
            y={76}
            textAnchor="middle"
            fontSize="9"
            fontFamily="JetBrains Mono, monospace"
            fill="#1a1613"
            fontWeight="700"
          >
            № 1974
          </text>
        </motion.g>
      </svg>

      <div
        className={`h-5 flex items-center font-mono text-[10px] tracking-[0.26em] uppercase whitespace-nowrap mt-1 ${
          disabled ? 'text-oxblood' : 'text-ink'
        }`}
      >
        {disabled ? t('lever.inOperation') : t('lever.pullToEngage')}
      </div>
    </button>
  );
}
