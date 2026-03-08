import { useState, useRef, useCallback } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface PullToRefreshProps {
  onRefresh: () => Promise<unknown>;
  children: React.ReactNode;
}

const THRESHOLD = 80;

export const PullToRefresh = ({ onRefresh, children }: PullToRefreshProps) => {
  const [refreshing, setRefreshing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const pulling = useRef(false);
  const y = useMotionValue(0);
  const spinnerOpacity = useTransform(y, [0, THRESHOLD * 0.4, THRESHOLD], [0, 0.5, 1]);
  const spinnerScale = useTransform(y, [0, THRESHOLD], [0.5, 1]);
  const spinnerY = useTransform(y, [0, THRESHOLD], [-20, 12]);

  const isAtTop = () => {
    const el = containerRef.current;
    if (!el) return true;
    // Walk up to find scrollable ancestor
    let node: HTMLElement | null = el;
    while (node) {
      if (node.scrollTop > 0) return false;
      node = node.parentElement;
    }
    return window.scrollY <= 0;
  };

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (refreshing) return;
    if (isAtTop()) {
      startY.current = e.touches[0].clientY;
      pulling.current = true;
    }
  }, [refreshing]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!pulling.current || refreshing) return;
    const delta = Math.max(0, e.touches[0].clientY - startY.current);
    // Rubber-band effect: diminishing returns past threshold
    const dampened = delta > THRESHOLD ? THRESHOLD + (delta - THRESHOLD) * 0.3 : delta;
    y.set(dampened);
  }, [refreshing, y]);

  const handleTouchEnd = useCallback(async () => {
    if (!pulling.current) return;
    pulling.current = false;

    if (y.get() >= THRESHOLD && !refreshing) {
      setRefreshing(true);
      animate(y, 50, { duration: 0.2 });
      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
        animate(y, 0, { type: 'spring', stiffness: 300, damping: 25 });
      }
    } else {
      animate(y, 0, { type: 'spring', stiffness: 300, damping: 25 });
    }
  }, [onRefresh, refreshing, y]);

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative"
    >
      {/* Spinner indicator */}
      <motion.div
        style={{ opacity: spinnerOpacity, scale: spinnerScale }}
        className="absolute left-1/2 -translate-x-1/2 top-0 z-10 flex items-center justify-center"
      >
        <motion.div
          style={{ y: spinnerY }}
          className="h-9 w-9 rounded-full bg-card shadow-card flex items-center justify-center border border-border"
        >
          <Loader2 className={`h-4 w-4 text-primary ${refreshing ? 'animate-spin' : ''}`} />
        </motion.div>
      </motion.div>

      {/* Content */}
      <motion.div style={{ y }}>
        {children}
      </motion.div>
    </div>
  );
};
