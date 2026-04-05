import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Shield, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const COOKIE_CONSENT_KEY = 'boi-rajjo-cookie-consent';

export const CookieConsent = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = (type: 'all' | 'essential') => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({ type, date: new Date().toISOString() }));
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-6"
        >
          <div className="max-w-4xl mx-auto bg-card border border-border rounded-2xl shadow-lg p-4 sm:p-6">
            <div className="flex items-start gap-3">
              <div className="hidden sm:flex h-10 w-10 rounded-xl bg-primary/10 items-center justify-center shrink-0 mt-0.5">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground text-sm sm:text-base mb-1">
                  We value your privacy 🍪
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-3">
                  We use essential cookies to make our platform work and optional analytics cookies to improve your experience. 
                  Your data is processed in accordance with EU GDPR regulations.{' '}
                  <Link to="/privacy" className="text-primary underline underline-offset-2 hover:text-primary/80">
                    Privacy Policy
                  </Link>
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <Button size="sm" onClick={() => accept('all')} className="rounded-xl text-xs sm:text-sm">
                    Accept All
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => accept('essential')} className="rounded-xl text-xs sm:text-sm">
                    Essential Only
                  </Button>
                </div>
              </div>
              <button
                onClick={() => accept('essential')}
                className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground shrink-0"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
