import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { SEOHead } from '@/components/seo/SEOHead';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useEuProduct } from '@/hooks/useEuProducts';
import { ArrowLeft, Truck, MapPin, Package, Star, Shield, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';

const EuProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { data: product, isLoading, error } = useEuProduct(id || '');

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-6 max-w-3xl mx-auto">
          <Skeleton className="h-8 w-32 mb-6" />
          <Skeleton className="aspect-[16/10] w-full rounded-2xl mb-6" />
          <Skeleton className="h-8 w-3/4 mb-2" />
          <Skeleton className="h-5 w-1/2 mb-4" />
          <Skeleton className="h-10 w-32" />
        </div>
      </Layout>
    );
  }

  if (error || !product) {
    return (
      <Layout>
        <div className="container py-12 text-center">
          <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-lg font-semibold text-foreground mb-2">Product not found</h2>
          <Link to="/eu">
            <Button variant="outline" className="rounded-xl">Back to EU Store</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const conditionLabel = product.condition === 'new' ? 'New' : product.condition === 'good' ? 'Good' : 'Used';

  return (
    <Layout>
      <SEOHead
        title={`${product.title} — Buy in Europe | Boi Rajjo`}
        description={`${product.title} by ${product.author}. Available in Europe with fast delivery. €${product.price}.`}
        path={`/eu/product/${product.id}`}
      />
      <div className="container py-6 max-w-3xl mx-auto">
        <Link to="/eu" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to EU Store
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Image */}
          <div className="aspect-[16/10] bg-muted rounded-2xl overflow-hidden mb-6 shadow-card">
            {product.photo_url ? (
              <img src={product.photo_url} alt={product.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <Package className="h-16 w-16" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              {product.featured && (
                <Badge className="bg-category-eu text-white">
                  <Star className="h-3 w-3 mr-1 fill-current" /> Featured
                </Badge>
              )}
              <Badge variant="secondary">{conditionLabel}</Badge>
              <Badge variant="outline">{product.category}</Badge>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{product.title}</h1>
            <p className="text-muted-foreground">{product.author}</p>

            <div className="text-3xl font-bold text-primary">
              €{product.price}
              <span className="text-sm font-normal text-muted-foreground ml-2">{product.currency}</span>
            </div>

            {product.description && (
              <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
            )}

            {/* Delivery & trust info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 py-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-category-eu/5 border border-category-eu/15">
                <Truck className="h-5 w-5 text-category-eu shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {product.delivery_days_min}–{product.delivery_days_max} days
                  </p>
                  <p className="text-xs text-muted-foreground">Fast EU delivery</p>
                </div>
              </div>
              {product.city && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted">
                  <MapPin className="h-5 w-5 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{product.city}</p>
                    <p className="text-xs text-muted-foreground">Shipped from</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted">
                <Shield className="h-5 w-5 text-success shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">Trusted</p>
                  <p className="text-xs text-muted-foreground">Verified stock</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <RotateCcw className="h-3.5 w-3.5" />
              Easy returns within 14 days
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Package className="h-3.5 w-3.5" />
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </div>

            <Button
              size="lg"
              className="w-full sm:w-auto rounded-xl mt-4"
              disabled={product.stock <= 0}
            >
              {product.stock > 0 ? 'Contact to Order' : 'Out of Stock'}
            </Button>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default EuProductDetails;
