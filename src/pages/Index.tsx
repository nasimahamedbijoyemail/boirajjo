import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BookOpen, ArrowRight, Users, Shield, Zap, Star } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import heroImage from '@/assets/hero-illustration.png';
import { SEOHead } from '@/components/seo/SEOHead';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { motion } from 'framer-motion';

const features = [
  { icon: Users, title: 'Campus Friendly', description: 'Trade books easily with students from your institution' },
  { icon: Shield, title: 'Trusted Community', description: 'Verified campus members ensure safe and reliable trades' },
  { icon: Zap, title: 'Quick & Easy', description: 'Connect via WhatsApp and meet on campus to complete deals' },
];

const stats = [
  { value: '1000+', label: 'Books Listed' },
  { value: '500+', label: 'Students' },
  { value: '50+', label: 'Campuses' },
];

const Index = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate(profile?.institution_id ? '/home' : '/onboarding');
    }
  }, [user, profile, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <BookOpen className="h-12 w-12 text-primary" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-hero overflow-hidden">
      <SEOHead
        title="Buy & Sell Used Books Online — Campus Book Marketplace Bangladesh"
        description="Boi Rajjo is Bangladesh's campus book marketplace. Buy, sell & exchange used academic books, textbooks and novels. Order from Nilkhet online. Trusted by 500+ students across 50+ campuses."
        path="/"
      />
      <div className="container px-4 py-6 sm:py-8">
        {/* Nav */}
        <motion.nav
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center justify-between mb-10 md:mb-16"
        >
          <div className="flex items-center gap-2.5">
            <div className="gradient-primary rounded-xl p-2.5 shadow-md">
              <BookOpen className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground tracking-tight">Boi Rajjo</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
              <Link to="/auth">Sign In</Link>
            </Button>
            <Button variant="hero" size="sm" className="sm:px-6 rounded-xl shadow-sm" asChild>
              <Link to="/auth?mode=signup">
                <span className="sm:hidden">Join Free</span>
                <span className="hidden sm:inline">Get Started Free</span>
              </Link>
            </Button>
          </div>
        </motion.nav>

        {/* Hero */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center py-4 md:py-12">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            className="space-y-6 sm:space-y-8 text-center lg:text-left"
          >
            {/* Trust badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/8 border border-primary/15 text-sm font-medium text-primary"
            >
              <Star className="h-4 w-4 fill-primary" />
              #1 Campus Book Marketplace
            </motion.div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground text-balance leading-[1.1]">
              Buy & Sell Used Books{' '}
              <span className="text-primary relative">
                Within Your Campus
                <svg className="absolute -bottom-1 left-0 w-full h-2 text-primary/30" viewBox="0 0 200 8" preserveAspectRatio="none">
                  <path d="M0 7 C50 0, 150 0, 200 7" stroke="currentColor" strokeWidth="3" fill="none" />
                </svg>
              </span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 text-balance leading-relaxed">
              Buy, sell & share campus books, order from Nilkhet, or browse beyond your campus — all in one place. Fast, affordable & trusted.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
              <Button variant="hero" size="xl" className="rounded-xl shadow-lg" asChild>
                <Link to="/auth?mode=signup">
                  Start Sharing Books
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="xl" className="rounded-xl sm:inline-flex hidden" asChild>
                <Link to="/auth">
                  Sign In
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-center lg:justify-start gap-6 sm:gap-8 pt-2">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center lg:text-left">
                  <p className="text-xl sm:text-2xl font-bold text-foreground tabular-nums">{stat.value}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.92, rotate: -2 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
            className="flex justify-center relative"
          >
            {/* Decorative blobs */}
            <div className="absolute -top-8 -right-8 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-accent/10 rounded-full blur-3xl" />
            <img
              src={heroImage}
              alt="Students exchanging books on campus"
              className="w-full max-w-xs sm:max-w-sm lg:max-w-md rounded-2xl shadow-card-hover relative z-10"
              loading="eager"
            />
          </motion.div>
        </div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="grid sm:grid-cols-3 gap-4 sm:gap-6 py-10 sm:py-16"
        >
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="bg-card rounded-2xl p-5 sm:p-6 shadow-card hover:shadow-card-hover hover:-translate-y-1 active:scale-[0.98] transition-all duration-300"
            >
              <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3 sm:mb-4">
                <feature.icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1.5">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Footer */}
        <footer className="text-center py-6 sm:py-8 border-t border-border mt-8 sm:mt-12">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Boi Rajjo. Made with ❤️ for students.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
