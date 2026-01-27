import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BookOpen, ArrowRight, Users, Shield, Zap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import heroImage from '@/assets/hero-illustration.png';

const Index = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      if (profile?.institution_id) {
        navigate('/browse');
      } else {
        navigate('/onboarding');
      }
    }
  }, [user, profile, loading, navigate]);

  const features = [
    {
      icon: Users,
      title: 'Campus Only',
      description: 'Trade books exclusively with students from your institution',
    },
    {
      icon: Shield,
      title: 'Trusted Community',
      description: 'Verified campus members ensure safe and reliable trades',
    },
    {
      icon: Zap,
      title: 'Quick & Easy',
      description: 'Connect via WhatsApp and meet on campus to complete deals',
    },
  ];

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
      {/* Hero Section */}
      <div className="container px-4 py-8">
        <nav className="flex items-center justify-between mb-12 md:mb-16">
          <div className="flex items-center gap-2">
            <div className="gradient-primary rounded-lg p-2">
              <BookOpen className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">Boi Rajjo</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link to="/auth">Sign In</Link>
            </Button>
            <Button variant="hero" asChild>
              <Link to="/auth?mode=signup">Get Started</Link>
            </Button>
          </div>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12 items-center py-8 md:py-16">
          <div className="space-y-8 text-center lg:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground text-balance animate-fade-in-up">
              Buy & Sell Used Books{' '}
              <span className="text-primary">Within Your Campus</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 text-balance animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              Join your campus community to trade academic books easily. Fast, affordable, and trusted — powered by WhatsApp.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <Button variant="hero" size="xl" asChild>
                <Link to="/auth?mode=signup">
                  Start Trading Books
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
          <div className="animate-fade-in-up hidden lg:block" style={{ animationDelay: '0.2s' }}>
            <img 
              src={heroImage} 
              alt="Students exchanging books on campus" 
              className="w-full rounded-2xl shadow-card-hover"
            />
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 py-12 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-card rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300"
            >
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <footer className="text-center py-8 border-t mt-12">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Boi Rajjo. Made with ❤️ for students.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
