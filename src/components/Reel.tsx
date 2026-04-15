import { useEffect, useRef, useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { sfx } from '../utils/sound';

interface ReelProps<T> {
  pool: T[];
  finalItem: T | null;
  spinning: boolean;
  stopAt: number; // ms from mount/start
  tickMs?: number; // cycle speed during spin
  render: (item: T) => ReactNode;
  onStop?: () => void;
  label?: string;
  widthClass?: string;
}

export function Reel<T>({
  pool,
  finalItem,
  spinning,
  stopAt,
  tickMs = 60,
  render,
  onStop,
  label,
  widthClass = 'w-40',
}: ReelProps<T>) {
  const [display, setDisplay] = useState<T>(pool[0]);
  const [locked, setLocked] = useState(false);
  const cycleRef = useRef<number | null>(null);
  const stopTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!spinning) return;
    setLocked(false);
    let i = Math.floor(Math.random() * pool.length);
    cycleRef.current = window.setInterval(() => {
      i = (i + 1) % pool.length;
      setDisplay(pool[i]);
    }, tickMs);

    stopTimerRef.current = window.setTimeout(() => {
      if (cycleRef.current != null) {
        window.clearInterval(cycleRef.current);
        cycleRef.current = null;
      }
      if (finalItem != null) setDisplay(finalItem);
      setLocked(true);
      sfx.reelStop();
      onStop?.();
    }, stopAt);

    return () => {
      if (cycleRef.current != null) window.clearInterval(cycleRef.current);
      if (stopTimerRef.current != null) window.clearTimeout(stopTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spinning]);

  useEffect(() => {
    if (!spinning && finalItem != null) {
      setDisplay(finalItem);
      setLocked(true);
    }
  }, [spinning, finalItem]);

  return (
    <div className={`flex flex-col items-center ${widthClass}`}>
      {label && (
        <div className="mb-2 text-[10px] tracking-[0.2em] text-cabinet-gold/80 uppercase">
          {label}
        </div>
      )}
      <div className="reel-window h-28 w-full flex items-center justify-center">
        <motion.div
          key={`${locked}-${String(display)}`}
          initial={locked ? { y: -14, opacity: 0 } : false}
          animate={locked ? { y: 0, opacity: 1 } : {}}
          transition={{ type: 'spring', stiffness: 420, damping: 18 }}
          className={`reel-strip ${spinning && !locked ? 'spinning' : ''} px-2 text-center select-none`}
        >
          {render(display)}
        </motion.div>
      </div>
    </div>
  );
}
