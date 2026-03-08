import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

type IllustrationType = 'books' | 'orders' | 'demands' | 'notifications' | 'search' | 'generic';

interface EmptyStateProps {
  type?: IllustrationType;
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

const illustrations: Record<IllustrationType, React.ReactNode> = {
  books: (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Stack of books */}
      <rect x="25" y="70" width="70" height="12" rx="3" className="fill-primary/15 stroke-primary/30" strokeWidth="1.5" />
      <rect x="30" y="58" width="60" height="12" rx="3" className="fill-accent/15 stroke-accent/30" strokeWidth="1.5" />
      <rect x="28" y="46" width="64" height="12" rx="3" className="fill-primary/20 stroke-primary/40" strokeWidth="1.5" />
      {/* Open book on top */}
      <path d="M40 40 L60 44 L80 40 L80 20 L60 24 L40 20Z" className="fill-card stroke-primary/50" strokeWidth="1.5" strokeLinejoin="round" />
      <line x1="60" y1="24" x2="60" y2="44" className="stroke-primary/30" strokeWidth="1" />
      {/* Lines on pages */}
      <line x1="45" y1="26" x2="55" y2="28" className="stroke-muted-foreground/20" strokeWidth="1" />
      <line x1="45" y1="30" x2="55" y2="32" className="stroke-muted-foreground/20" strokeWidth="1" />
      <line x1="65" y1="28" x2="75" y2="26" className="stroke-muted-foreground/20" strokeWidth="1" />
      <line x1="65" y1="32" x2="75" y2="30" className="stroke-muted-foreground/20" strokeWidth="1" />
      {/* Sparkle */}
      <circle cx="90" cy="25" r="2" className="fill-accent/40" />
      <circle cx="30" cy="30" r="1.5" className="fill-primary/30" />
    </svg>
  ),
  orders: (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Package box */}
      <rect x="30" y="40" width="60" height="45" rx="4" className="fill-primary/10 stroke-primary/30" strokeWidth="1.5" />
      <path d="M30 52 H90" className="stroke-primary/20" strokeWidth="1.5" />
      <path d="M55 40 V52" className="stroke-primary/20" strokeWidth="1.5" />
      <path d="M65 40 V52" className="stroke-primary/20" strokeWidth="1.5" />
      {/* Flaps */}
      <path d="M30 40 L45 28 L60 40" className="fill-accent/10 stroke-accent/30" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M60 40 L75 28 L90 40" className="fill-primary/15 stroke-primary/30" strokeWidth="1.5" strokeLinejoin="round" />
      {/* Delivery arrow */}
      <path d="M60 95 L60 100 L50 100 L60 110 L70 100 L60 100" className="fill-accent/30 stroke-accent/40" strokeWidth="1" />
      {/* Stars */}
      <circle cx="25" cy="35" r="2" className="fill-accent/30" />
      <circle cx="95" cy="30" r="1.5" className="fill-primary/30" />
    </svg>
  ),
  demands: (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Clipboard */}
      <rect x="32" y="30" width="56" height="70" rx="6" className="fill-card stroke-primary/30" strokeWidth="1.5" />
      <rect x="45" y="24" width="30" height="12" rx="4" className="fill-primary/20 stroke-primary/40" strokeWidth="1.5" />
      {/* Checklist items */}
      <rect x="42" y="50" width="10" height="10" rx="2" className="fill-success/20 stroke-success/40" strokeWidth="1.2" />
      <path d="M44 55 L47 58 L51 52" className="stroke-success/60" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="58" y1="55" x2="78" y2="55" className="stroke-muted-foreground/25" strokeWidth="2" strokeLinecap="round" />
      <rect x="42" y="66" width="10" height="10" rx="2" className="fill-accent/15 stroke-accent/30" strokeWidth="1.2" />
      <line x1="58" y1="71" x2="74" y2="71" className="stroke-muted-foreground/25" strokeWidth="2" strokeLinecap="round" />
      <rect x="42" y="82" width="10" height="10" rx="2" className="fill-muted stroke-border" strokeWidth="1.2" />
      <line x1="58" y1="87" x2="70" y2="87" className="stroke-muted-foreground/20" strokeWidth="2" strokeLinecap="round" />
      {/* Sparkle */}
      <circle cx="92" cy="35" r="2.5" className="fill-accent/30" />
      <circle cx="28" cy="50" r="1.5" className="fill-primary/25" />
    </svg>
  ),
  notifications: (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Bell */}
      <path d="M60 25 C60 25 45 30 45 55 L40 70 H80 L75 55 C75 30 60 25 60 25Z" className="fill-primary/15 stroke-primary/35" strokeWidth="1.5" strokeLinejoin="round" />
      <line x1="60" y1="18" x2="60" y2="25" className="stroke-primary/40" strokeWidth="2" strokeLinecap="round" />
      <path d="M52 70 Q52 80 60 80 Q68 80 68 70" className="fill-accent/15 stroke-accent/30" strokeWidth="1.5" />
      {/* ZZZ */}
      <text x="82" y="38" className="fill-muted-foreground/25" fontSize="10" fontWeight="bold">z</text>
      <text x="88" y="30" className="fill-muted-foreground/20" fontSize="8" fontWeight="bold">z</text>
      <text x="93" y="24" className="fill-muted-foreground/15" fontSize="6" fontWeight="bold">z</text>
    </svg>
  ),
  search: (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Magnifying glass */}
      <circle cx="52" cy="50" r="22" className="fill-primary/8 stroke-primary/30" strokeWidth="2" />
      <circle cx="52" cy="50" r="15" className="fill-card stroke-primary/20" strokeWidth="1.5" />
      <line x1="68" y1="66" x2="85" y2="83" className="stroke-primary/40" strokeWidth="4" strokeLinecap="round" />
      {/* Question mark */}
      <text x="47" y="56" className="fill-muted-foreground/30" fontSize="18" fontWeight="bold">?</text>
    </svg>
  ),
  generic: (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <circle cx="60" cy="55" r="30" className="fill-primary/8 stroke-primary/20" strokeWidth="1.5" />
      <circle cx="60" cy="55" r="18" className="fill-card stroke-primary/15" strokeWidth="1.5" />
      <circle cx="60" cy="55" r="6" className="fill-primary/20" />
      <circle cx="90" cy="30" r="2" className="fill-accent/30" />
      <circle cx="30" cy="40" r="1.5" className="fill-primary/25" />
    </svg>
  ),
};

export const EmptyState = ({ type = 'generic', title, description, children, className }: EmptyStateProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      className={cn('flex flex-col items-center justify-center py-12 sm:py-16 text-center px-4', className)}
    >
      <div className="w-28 h-28 sm:w-32 sm:h-32 mb-5">
        {illustrations[type]}
      </div>
      <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-1.5">{title}</h3>
      {description && (
        <p className="text-muted-foreground text-sm sm:text-base max-w-sm leading-relaxed">
          {description}
        </p>
      )}
      {children && <div className="mt-5">{children}</div>}
    </motion.div>
  );
};
