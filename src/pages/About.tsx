import { Link } from 'react-router-dom';
import { SEOHead } from '@/components/seo/SEOHead';
import { ArrowLeft, BookOpen, Brain, Truck, Globe, Users, Target, TrendingUp, Shield, Zap, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ThemeToggle } from '@/components/layout/ThemeToggle';

const metrics = [
  { value: '10+', label: 'EU Cities', icon: MapPin },
  { value: '1000+', label: 'Books Listed', icon: BookOpen },
  { value: '50+', label: 'Institutions', icon: Globe },
  { value: '99.9%', label: 'Uptime', icon: Zap },
];

const supplyChainSteps = [
  {
    icon: Globe,
    title: 'Origin',
    subtitle: 'Bangladesh',
    description: 'Rich literary heritage sourced from publishers, Nilkhet market, and campus networks across Bangladesh.',
    color: 'text-success',
    bg: 'bg-success/10',
  },
  {
    icon: Brain,
    title: 'Intelligence',
    subtitle: 'AI Layer',
    description: 'Demand forecasting, clustering analysis, and smart inventory positioning across European cities.',
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
  {
    icon: Truck,
    title: 'Delivery',
    subtitle: 'EU Network',
    description: 'Distributed inventory across Europe. Fast 2–5 day delivery, no customs delays, local returns.',
    color: 'text-category-eu',
    bg: 'bg-category-eu/10',
  },
];

const values = [
  { icon: Target, title: 'Mission', description: 'Making South Asian literary and educational heritage accessible to diaspora communities and European readers through intelligent logistics.' },
  { icon: Users, title: 'Community', description: 'Built by and for the community. We connect 500+ students across 50+ institutions with readers across Europe.' },
  { icon: Shield, title: 'Trust & Compliance', description: 'GDPR-compliant data handling, verified users, transparent transactions, and EU consumer protection standards.' },
  { icon: TrendingUp, title: 'Innovation', description: 'AI-powered demand intelligence turns product requests into actionable supply chain decisions, creating a self-optimizing marketplace.' },
];

const About = () => (
  <div className="min-h-screen bg-background overflow-hidden">
    <SEOHead
      title="About Boi Rajjo — Cross-Border Cultural Commerce Platform"
      description="Boi Rajjo bridges South Asian literary heritage with European readers through AI-powered logistics. Learn about our mission, technology, and impact."
      path="/about"
    />

    {/* Nav */}
    <div className="container px-4 py-6">
      <nav className="flex items-center justify-between mb-10">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="gradient-primary rounded-xl p-2.5 shadow-md">
            <BookOpen className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground tracking-tight">Boi Rajjo</span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="outline" size="sm" className="rounded-xl" asChild>
            <Link to="/">Home</Link>
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-3xl mx-auto mb-12 sm:mb-16"
      >
        <p className="text-sm font-medium text-primary mb-3">About Us</p>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground mb-4 text-balance leading-[1.1]">
          Delivering Culture,<br />Within Reach
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto text-balance leading-relaxed">
          Boi Rajjo is an AI-powered cross-border cultural commerce platform bridging South Asian literary heritage with European readers through intelligent, distributed logistics.
        </p>
      </motion.div>

      {/* Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-3xl mx-auto mb-16"
      >
        {metrics.map((m) => (
          <Card key={m.label} className="border-0 shadow-card text-center">
            <CardContent className="p-4 sm:p-6">
              <m.icon className="h-5 w-5 text-primary mx-auto mb-2" />
              <p className="text-2xl sm:text-3xl font-bold text-foreground">{m.value}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">{m.label}</p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Supply Chain */}
      <div className="max-w-4xl mx-auto mb-16">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="text-center mb-8"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">How It Works</h2>
          <p className="text-muted-foreground">Our intelligent supply chain, visualized</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-4 sm:gap-6 relative">
          {/* Connector lines (desktop) */}
          <div className="hidden md:block absolute top-1/2 left-[33%] w-[34%] h-0.5 bg-gradient-to-r from-success via-primary to-category-eu -translate-y-1/2 z-0" />

          {supplyChainSteps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.12, duration: 0.4 }}
              className="relative z-10"
            >
              <Card className="border-0 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 h-full">
                <CardContent className="p-5 sm:p-6 text-center">
                  <div className={`h-14 w-14 rounded-2xl ${step.bg} flex items-center justify-center mx-auto mb-4`}>
                    <step.icon className={`h-7 w-7 ${step.color}`} />
                  </div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">{step.subtitle}</p>
                  <h3 className="text-lg font-bold text-foreground mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Values / Mission */}
      <div className="max-w-4xl mx-auto mb-16">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Our Values</h2>
          <p className="text-muted-foreground">What drives us forward</p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-4">
          {values.map((v, i) => (
            <motion.div
              key={v.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 + i * 0.08 }}
            >
              <Card className="border-0 shadow-card hover:shadow-card-hover transition-all duration-300 h-full">
                <CardContent className="p-5 sm:p-6">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                    <v.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1.5">{v.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{v.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="text-center py-8 sm:py-12"
      >
        <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3">Ready to explore?</h2>
        <p className="text-muted-foreground mb-6">Join our growing community of readers and cultural bridge-builders.</p>
        <Button variant="hero" size="lg" className="rounded-xl shadow-lg" asChild>
          <Link to="/auth?mode=signup">Get Started Free</Link>
        </Button>
      </motion.div>

      {/* Footer */}
      <footer className="text-center py-6 border-t border-border">
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
          <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
          <span>© {new Date().getFullYear()} Boi Rajjo</span>
        </div>
      </footer>
    </div>
  </div>
);

export default About;
