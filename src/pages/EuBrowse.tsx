import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { SEOHead } from '@/components/seo/SEOHead';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/layout/EmptyState';
import { useEuProducts } from '@/hooks/useEuProducts';
import { Search, Truck, Star, MapPin, Package, ArrowLeft, BookMarked } from 'lucide-react';
import { motion } from 'framer-motion';
import { useDebounce } from '@/hooks/useDebounce';

const categories = [
  { value: 'all', label: 'All' },
  { value: 'books', label: 'Books' },
  { value: 'educational', label: 'Educational' },
  { value: 'cultural', label: 'Cultural' },
];

const EuBrowse = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchCity, setSearchCity] = useState('');
  const debouncedCity = useDebounce(searchCity, 300);
  const { data: products = [], isLoading } = useEuProducts(selectedCategory, debouncedCity);

  return (
    <Layout>
      <SEOHead
        title="Within Europe — Books & Products Available Near You"
        description="Browse Bengali books and cultural products stocked within our European distribution network. Fast 2-5 day delivery across Europe."
        path="/eu"
      />
      <div className="container py-6 sm:py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link to="/home" className="p-2 rounded-xl hover:bg-muted transition-colors">
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Within Europe</h1>
            <p className="text-sm text-muted-foreground">
              Products stocked within Europe for faster delivery
            </p>
          </div>
        </div>

        {/* Trust banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center gap-4 sm:gap-6 p-4 rounded-2xl bg-category-eu/5 border border-category-eu/15 mb-6"
        >
          <div className="flex items-center gap-2 text-sm text-category-eu">
            <Truck className="h-4 w-4" />
            <span className="font-medium">2–5 day delivery</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-category-eu">
            <Package className="h-4 w-4" />
            <span className="font-medium">No customs delay</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-category-eu">
            <Star className="h-4 w-4" />
            <span className="font-medium">EU stock</span>
          </div>
        </motion.div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by city (e.g. Barcelona, Paris)..."
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <Button
                key={cat.value}
                variant={selectedCategory === cat.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(cat.value)}
                className="rounded-xl whitespace-nowrap"
              >
                {cat.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Request CTA */}
        <Link to="/eu/request">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex items-center gap-3 p-4 rounded-2xl bg-category-eu-request/5 border border-category-eu-request/15 mb-6 hover:shadow-card transition-all cursor-pointer group"
          >
            <div className="p-2.5 rounded-xl bg-category-eu-request/10">
              <BookMarked className="h-5 w-5 text-category-eu-request" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-foreground">Can't find what you need?</p>
              <p className="text-xs text-muted-foreground">Request a product and we'll source it for you</p>
            </div>
          </motion.div>
        </Link>

        {/* Product Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="rounded-xl overflow-hidden shadow-card">
                <Skeleton className="aspect-[4/3] w-full" />
                <div className="p-3 space-y-2 bg-card">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-5 w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <EmptyState
            type="books"
            title="No products available yet"
            description="Check back soon or request a product you need."
          />
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.04 } } }}
            className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4"
          >
            {products.map((product) => (
              <motion.div
                key={product.id}
                variants={{
                  hidden: { opacity: 0, y: 16 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
                }}
              >
                <Link to={`/eu/product/${product.id}`}>
                  <Card className="h-full border-0 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 overflow-hidden group">
                    <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                      {product.photo_url ? (
                        <img
                          src={product.photo_url}
                          alt={product.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <Package className="h-10 w-10" />
                        </div>
                      )}
                      {product.featured && (
                        <Badge className="absolute top-2 left-2 bg-category-eu text-white text-[10px]">
                          <Star className="h-3 w-3 mr-0.5 fill-current" /> Featured
                        </Badge>
                      )}
                    </div>
                    <CardContent className="p-3 sm:p-4">
                      <h3 className="font-semibold text-sm text-foreground truncate">{product.title}</h3>
                      <p className="text-xs text-muted-foreground truncate">{product.author}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-base font-bold text-primary">€{product.price}</span>
                        {product.city && (
                          <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                            <MapPin className="h-3 w-3" /> {product.city}
                          </span>
                        )}
                      </div>
                      {product.delivery_days_min && product.delivery_days_max && (
                        <div className="flex items-center gap-1 mt-1.5 text-[10px] text-category-eu">
                          <Truck className="h-3 w-3" />
                          {product.delivery_days_min}–{product.delivery_days_max} days
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </Layout>
  );
};

export default EuBrowse;
