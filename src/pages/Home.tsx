import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { GraduationCap, Globe, BookMarked, Store, Plane, Package, Truck, Send } from 'lucide-react';
import { usePromoBanner } from '@/hooks/useAppSettings';
import { Skeleton } from '@/components/ui/skeleton';
import { SEOHead } from '@/components/seo/SEOHead';
import { motion, AnimatePresence } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { PullToRefresh } from '@/components/ui/pull-to-refresh';
import { useAuth } from '@/contexts/AuthContext';

const bdCategories = [
  {
    title: 'In Your Campus',
    description: 'Books from your department',
    icon: GraduationCap,
    href: '/browse/academic',
    colorClass: 'bg-category-academic/10 text-category-academic',
    hoverGlow: 'hover:shadow-[0_0_20px_-4px_hsl(var(--category-academic)/0.25)]',
  },
  {
    title: 'Outside Campus',
    description: 'General books from everyone',
    icon: Globe,
    href: '/browse/non-academic',
    colorClass: 'bg-category-global/10 text-category-global',
    hoverGlow: 'hover:shadow-[0_0_20px_-4px_hsl(var(--category-global)/0.25)]',
  },
  {
    title: 'Demand A Book',
    description: 'Request a book you need',
    icon: BookMarked,
    href: '/book-demand',
    colorClass: 'bg-category-demand/10 text-category-demand',
    hoverGlow: 'hover:shadow-[0_0_20px_-4px_hsl(var(--category-demand)/0.25)]',
  },
  {
    title: 'Nilkhet',
    description: 'Order books with delivery',
    icon: Store,
    href: '/nilkhet',
    colorClass: 'bg-category-nilkhet/10 text-category-nilkhet',
    hoverGlow: 'hover:shadow-[0_0_20px_-4px_hsl(var(--category-nilkhet)/0.25)]',
  },
];

const euCategories = [
  {
    title: 'Browse EU Store',
    description: 'Books stocked in Europe',
    icon: Package,
    href: '/eu',
    colorClass: 'bg-category-eu/10 text-category-eu',
    hoverGlow: 'hover:shadow-[0_0_20px_-4px_hsl(var(--category-eu)/0.25)]',
  },
  {
    title: 'Request a Product',
    description: 'We\'ll source it for you',
    icon: Send,
    href: '/eu/request',
    colorClass: 'bg-category-eu-request/10 text-category-eu-request',
    hoverGlow: 'hover:shadow-[0_0_20px_-4px_hsl(var(--category-eu-request)/0.25)]',
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.07 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] as const },
  },
};

type Region = 'eu' | 'bd';

const HomePage = () => {
  const { data: promoBanner, isLoading: promoLoading } = usePromoBanner();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [region, setRegion] = useState<Region>('eu');

  const handleBannerClick = () => {
    if (!promoBanner.link) return;
    if (promoBanner.link.startsWith('http')) {
      window.open(promoBanner.link, '_blank');
    } else {
      navigate(promoBanner.link);
    }
  };

  const handleRefresh = useCallback(() => {
    return queryClient.invalidateQueries({ queryKey: ['promo-banner'] });
  }, [queryClient]);

  const firstName = profile?.name?.split(' ')[0] || '';
  const categories = region === 'eu' ? euCategories : bdCategories;

  return (
    <Layout>
      <SEOHead
        title="Home"
        description="Explore campus books, Nilkhet book market, European book store, and book demands. Buy and sell used academic books."
        path="/home"
      />
      <PullToRefresh onRefresh={handleRefresh}>
        <div className="container py-6 sm:py-8">
          {/* Promo Banner */}
          {promoLoading ? (
            <Skeleton className="w-full h-32 sm:h-44 rounded-2xl mb-6" />
          ) : promoBanner.enabled && promoBanner.imageUrl ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="mb-6 rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 cursor-pointer group"
              onClick={handleBannerClick}
            >
              <img
                src={promoBanner.imageUrl}
                alt="Promotion"
                className="w-full h-auto object-cover group-hover:scale-[1.01] transition-transform duration-300"
                loading="eager"
              />
            </motion.div>
          ) : null}

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-center mb-6 sm:mb-8"
          >
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1.5">
              {firstName ? (
                <>Hey {firstName}, welcome back! 👋</>
              ) : (
                <>Welcome to <span className="text-primary">Boi Rajjo</span></>
              )}
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              {region === 'eu'
                ? 'Delivering culture, within reach — across Europe'
                : 'What would you like to explore today?'}
            </p>
          </motion.div>

          {/* Region Selector */}
          <div className="flex justify-center mb-6 sm:mb-8">
            <div className="inline-flex items-center bg-muted rounded-2xl p-1 gap-1">
              <button
                onClick={() => setRegion('eu')}
                className={`relative flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  region === 'eu'
                    ? 'text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {region === 'eu' && (
                  <motion.div
                    layoutId="region-pill"
                    className="absolute inset-0 bg-category-eu rounded-xl shadow-md"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
                <Plane className="h-4 w-4 relative z-10" />
                <span className="relative z-10">Within Europe</span>
              </button>
              <button
                onClick={() => setRegion('bd')}
                className={`relative flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  region === 'bd'
                    ? 'text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {region === 'bd' && (
                  <motion.div
                    layoutId="region-pill"
                    className="absolute inset-0 bg-primary rounded-xl shadow-md"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
                <Globe className="h-4 w-4 relative z-10" />
                <span className="relative z-10">Within Bangladesh</span>
              </button>
            </div>
          </div>

          {/* EU Trust Banner */}
          <AnimatePresence mode="wait">
            {region === 'eu' && (
              <motion.div
                key="eu-trust"
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 p-4 rounded-2xl bg-category-eu/5 border border-category-eu/15">
                  <div className="flex items-center gap-2 text-sm text-category-eu">
                    <Truck className="h-4 w-4" />
                    <span className="font-medium">2–5 day delivery</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-category-eu">
                    <Package className="h-4 w-4" />
                    <span className="font-medium">No customs delay</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-category-eu">
                    <span className="font-medium">🇪🇺 EU Stock</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Category Cards */}
          <AnimatePresence mode="wait">
            <motion.div
              key={region}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="grid grid-cols-2 gap-3 sm:gap-4 max-w-2xl mx-auto"
            >
              {categories.map((category) => (
                <motion.div key={category.title} variants={cardVariants}>
                  <Link to={category.href}>
                    <Card className={`h-full border-0 shadow-card transition-all duration-300 cursor-pointer group active:scale-[0.97] hover:-translate-y-1 hover:shadow-card-hover ${category.hoverGlow}`}>
                      <CardContent className="p-4 sm:p-6 flex flex-col items-center text-center">
                        <div className={`p-3 sm:p-4 rounded-2xl ${category.colorClass} mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300`}>
                          <category.icon className="h-6 w-6 sm:h-7 sm:w-7" />
                        </div>
                        <h3 className="font-semibold text-foreground mb-0.5 sm:mb-1 text-sm sm:text-base">
                          {category.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground leading-snug">
                          {category.description}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </PullToRefresh>
    </Layout>
  );
};

export default HomePage;
