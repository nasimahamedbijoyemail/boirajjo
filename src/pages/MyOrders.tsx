import { Layout } from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMyOrders } from '@/hooks/useOrders';
import { useMyShopOrders } from '@/hooks/useShops';
import { OrderStatusTracker } from '@/components/orders/OrderStatusTracker';
import { ShoppingBag, Package, Store } from 'lucide-react';

const MyOrdersPage = () => {
  const { data: nilkhetOrders = [], isLoading: nilkhetLoading } = useMyOrders();
  const { data: shopOrders = [], isLoading: shopOrdersLoading } = useMyShopOrders();

  const isLoading = nilkhetLoading || shopOrdersLoading;

  return (
    <Layout>
      <div className="container py-6 max-w-3xl">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            My Orders
          </h1>
          <p className="text-muted-foreground">
            Track your book orders
          </p>
        </div>

        <Tabs defaultValue="shop" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="shop" className="flex items-center gap-2">
              <Store className="h-4 w-4" />
              Shop Orders
            </TabsTrigger>
            <TabsTrigger value="nilkhet" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Nilkhet Orders
            </TabsTrigger>
          </TabsList>

          <TabsContent value="shop">
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4">
                      <div className="h-5 bg-muted rounded w-1/2 mb-2" />
                      <div className="h-4 bg-muted rounded w-1/3" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : shopOrders.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Store className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No shop orders yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {shopOrders.map((order) => (
                  <Card key={order.id}>
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
                        <div className="flex-1">
                          <p className="text-xs font-mono text-muted-foreground mb-1">
                            {order.order_number || `SHP-${order.id.slice(0, 8).toUpperCase()}`}
                          </p>
                          <h3 className="font-semibold text-foreground">
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
                      
                      {/* Visual Status Tracker */}
                      <div className="pt-2">
                        <OrderStatusTracker status={order.status} type="order" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="nilkhet">
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4">
                      <div className="h-5 bg-muted rounded w-1/2 mb-2" />
                      <div className="h-4 bg-muted rounded w-1/3" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : nilkhetOrders.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No Nilkhet orders yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {nilkhetOrders.map((order) => (
                  <Card key={order.id}>
                    <CardContent className="p-4 space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="h-16 w-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                          {order.book?.photo_url ? (
                            <img
                              src={order.book.photo_url}
                              alt={order.book.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <Package className="h-6 w-6 text-muted-foreground/50" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-mono text-muted-foreground mb-1">
                            {order.order_number || `ORD-${order.id.slice(0, 8).toUpperCase()}`}
                          </p>
                          <h3 className="font-semibold text-foreground">
                            {order.book?.title || 'Unknown Book'}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            ৳{order.total_price.toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Ordered on {new Date(order.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      {/* Visual Status Tracker */}
                      <div className="pt-2">
                        <OrderStatusTracker status={order.status} type="order" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default MyOrdersPage;
