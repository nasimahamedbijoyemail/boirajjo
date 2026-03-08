import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BookOpen, ArrowRight, Users, Shield, Zap } from 'lucide-react';
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
        <div className="animate-pulse-soft">
          <BookOpen className="h-12 w-12 text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-hero">
      <SEOHead
        title="Buy & Sell Used Books on Campus"
        description="Boi Rajjo is Bangladesh's campus book marketplace. Buy and sell used academic books with trusted students via WhatsApp."
        path="/"
      />
      <div className="container px-4 py-6 sm:py-8">
        {/* Nav */}
        <nav className="flex items-center justify-between mb-10 md:mb-16">
          <div className="flex items-center gap-2">
            <div className="gradient-primary rounded-lg p-2 shadow-sm">
              <BookOpen className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">Boi Rajjo</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="sm" asChild>
              <Link to="/auth">Sign In</Link>
            </Button>
            <Button variant="hero" size="sm" className="sm:px-6" asChild>
              <Link to="/auth?mode=signup">Get Started</Link>
            </Button>
          </div>
        </nav>

        {/* Hero */}
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center py-6 md:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
            className="space-y-6 sm:space-y-8 text-center lg:text-left"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground text-balance leading-tight">
              Buy & Sell Used Books{' '}
              <span className="text-primary">Within Your Campus</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 text-balance">
              Join your campus community to trade academic books easily. Fast, affordable, and trusted — powered by WhatsApp.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
              <Button variant="hero" size="xl" asChild>
                <Link to="/auth?mode=signup">
                  Start Sharing Books
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
            className="flex justify-center"
          >
            <img
              src={heroImage}
              alt="Students exchanging books on campus"
              className="w-full max-w-xs sm:max-w-sm lg:max-w-md rounded-2xl shadow-card-hover"
              loading="lazy"
            />
          </motion.div>
        </div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="grid sm:grid-cols-3 gap-4 sm:gap-6 py-10 sm:py-16"
        >
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-card rounded-2xl p-5 sm:p-6 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300"
            >
              <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3 sm:mb-4">
                <feature.icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1.5">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
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
