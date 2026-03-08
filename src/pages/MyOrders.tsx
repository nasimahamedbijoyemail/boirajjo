import { Layout } from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { useMyShopOrders } from '@/hooks/useShops';
import { OrderStatusTracker } from '@/components/orders/OrderStatusTracker';
import { Package, Store, ShoppingBag } from 'lucide-react';
import { SEOHead } from '@/components/seo/SEOHead';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { PullToRefresh } from '@/components/ui/pull-to-refresh';

const OrderSkeleton = () => (
  <div className="space-y-4">
    {[...Array(3)].map((_, i) => (
      <Card key={i}>
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <Skeleton className="h-16 w-16 rounded-lg flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <Skeleton className="h-10 w-full mt-4 rounded-lg" />
        </CardContent>
      </Card>
    ))}
  </div>
);

const MyOrdersPage = () => {
  const { data: shopOrders = [], isLoading } = useMyShopOrders();
  const queryClient = useQueryClient();

  const handleRefresh = useCallback(() => {
    return queryClient.invalidateQueries({ queryKey: ['my-shop-orders'] });
  }, [queryClient]);

  return (
    <Layout>
      <SEOHead title="My Orders" description="Track your Nilkhet book orders and delivery status." path="/my-orders" />
      <PullToRefresh onRefresh={handleRefresh}>
        <div className="container py-6 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="mb-6"
        >
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Nilkhet Orders
          </h1>
          <p className="text-muted-foreground">
            Track your Nilkhet book orders
          </p>
        </motion.div>

        {isLoading ? (
          <OrderSkeleton />
        ) : shopOrders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-dashed">
              <CardContent className="py-16 text-center">
                <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-muted flex items-center justify-center">
                  <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-1">No orders yet</h3>
                <p className="text-muted-foreground text-sm mb-6 max-w-xs mx-auto">
                  Browse Nilkhet shops and place your first order to see it here
                </p>
                <Button asChild>
                  <Link to="/nilkhet">
                    <Store className="h-4 w-4" />
                    Browse Nilkhet
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {shopOrders.map((order, i) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
              >
                <Card className="overflow-hidden hover:shadow-card-hover transition-shadow duration-200">
                  <CardContent className="p-4 space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="h-16 w-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        {order.shop_book?.photo_url ? (
                          <img
                            src={order.shop_book.photo_url}
                            alt={order.shop_book.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Package className="h-6 w-6 text-muted-foreground/50" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-mono text-muted-foreground mb-1">
                          {order.order_number || `SHP-${order.id.slice(0, 8).toUpperCase()}`}
                        </p>
                        <h3 className="font-semibold text-foreground truncate">
                          {order.shop_book?.title || 'Unknown Book'}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          ৳{order.total_price.toLocaleString()} × {order.quantity || 1}
                        </p>
                        {order.shop && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <Store className="h-3 w-3" />
                            {order.shop.name}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          Ordered on {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="pt-2">
                      <OrderStatusTracker status={order.status} type="order" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
        </div>
      </PullToRefresh>
    </Layout>
  );
};

export default MyOrdersPage;