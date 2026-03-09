import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { GraduationCap, Globe, BookMarked, Store, LogIn } from 'lucide-react';
import { usePromoBanner } from '@/hooks/useAppSettings';
import { Skeleton } from '@/components/ui/skeleton';
import { SEOHead } from '@/components/seo/SEOHead';
import { motion } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { PullToRefresh } from '@/components/ui/pull-to-refresh';
import { useAuth } from '@/contexts/AuthContext';

const categories = [
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
  {
    title: 'Shop Portal',
    description: 'Sign in to manage your shop',
    icon: LogIn,
    href: '/shop',
    colorClass: 'bg-category-nilkhet/10 text-category-nilkhet',
    hoverGlow: 'hover:shadow-[0_0_20px_-4px_hsl(var(--category-nilkhet)/0.25)]',
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

const HomePage = () => {
  const { data: promoBanner, isLoading: promoLoading } = usePromoBanner();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

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

  return (
    <Layout>
      <SEOHead
        title="Home"
        description="Explore campus books, Nilkhet book market, and book demands. Buy and sell used academic books with trusted students."
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
            What would you like to explore today?
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
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
        </div>
      </PullToRefresh>
    </Layout>
  );
};

export default HomePage;
