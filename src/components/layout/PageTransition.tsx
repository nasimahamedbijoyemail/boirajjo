import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

interface PageTransitionProps {
  children: React.ReactNode;
}

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

export const PageTransition = React.forwardRef<HTMLDivElement, PageTransitionProps>(
  ({ children }, ref) => {
    const location = useLocation();

    return (
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          ref={ref}
          key={location.pathname}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.18, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    );
  }
);

PageTransition.displayName = 'PageTransition';
