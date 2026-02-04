import { Layout } from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  Package, 
  CreditCard, 
  RefreshCw,
  Store
} from 'lucide-react';
import { useMyBooks } from '@/hooks/useBooks';
import { useMyOrders } from '@/hooks/useOrders';
import { useMyDemands } from '@/hooks/useBookDemands';
import { useMyShopOrders } from '@/hooks/useShops';
import { useMyContactUnlocks, useRequestRefund } from '@/hooks/useContactUnlock';
import { toast } from 'sonner';

const TransactionHistory = () => {
  const { data: books = [] } = useMyBooks();
  const { data: orders = [] } = useMyOrders();
  const { data: demands = [] } = useMyDemands();
  const { data: shopOrders = [] } = useMyShopOrders();
  const { data: contactUnlocks = [] } = useMyContactUnlocks();
  const requestRefund = useRequestRefund();

  const soldBooks = books.filter((b) => b.status === 'sold');
  const completedOrders = orders.filter((o) => o.status === 'delivered' || o.status === 'cancelled');
  const completedDemands = demands.filter((d) => d.status === 'delivered' || d.status === 'cancelled');
  const completedShopOrders = shopOrders.filter((o) => o.status === 'delivered' || o.status === 'cancelled');

  const handleRequestRefund = async (paymentId: string) => {
    try {
      await requestRefund.mutateAsync(paymentId);
      toast.success('Refund request submitted successfully');
    } catch {
      toast.error('Failed to request refund');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
      case 'approved':
        return <Badge variant="success">{status === 'approved' ? 'Approved' : 'Delivered'}</Badge>;
      case 'cancelled':
      case 'rejected':
        return <Badge variant="destructive">{status === 'rejected' ? 'Rejected' : 'Cancelled'}</Badge>;
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <Layout>
      <div className="container py-6 space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Transaction History
          </h1>
          <p className="text-muted-foreground">
            View all your completed transactions and order history
          </p>
        </div>

        <Tabs defaultValue="sold" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5 max-w-2xl">
            <TabsTrigger value="sold" className="text-xs sm:text-sm">
              Sold ({soldBooks.length})
            </TabsTrigger>
            <TabsTrigger value="orders" className="text-xs sm:text-sm">
              Orders ({completedOrders.length})
            </TabsTrigger>
            <TabsTrigger value="shop" className="text-xs sm:text-sm">
              Shop ({completedShopOrders.length})
            </TabsTrigger>
            <TabsTrigger value="demands" className="text-xs sm:text-sm">
              Demands ({completedDemands.length})
            </TabsTrigger>
            <TabsTrigger value="unlocks" className="text-xs sm:text-sm">
              Unlocks ({contactUnlocks.length})
            </TabsTrigger>
          </TabsList>

          {/* Sold Books */}
          <TabsContent value="sold" className="space-y-4">
            {soldBooks.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No sold books yet</p>
                </CardContent>
              </Card>
            ) : (
              soldBooks.map((book) => (
                <Card key={book.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="h-16 w-16 rounded-lg overflow-hidden bg-muted shrink-0">
                        {book.photo_url ? (
                          <img src={book.photo_url} alt={book.title} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <BookOpen className="h-6 w-6 text-muted-foreground/50" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground">{book.title}</h3>
                        <p className="text-sm text-muted-foreground">by {book.author}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="font-bold text-primary">৳{book.price.toLocaleString()}</span>
                          <Badge variant="success">Sold</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Sold on {new Date(book.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Completed Orders (Nilkhet) */}
          <TabsContent value="orders" className="space-y-4">
            {completedOrders.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No completed orders yet</p>
                </CardContent>
              </Card>
            ) : (
              completedOrders.map((order) => (
                <Card key={order.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-foreground">{order.book?.title}</h3>
                          {getStatusBadge(order.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Order ID: <span className="font-mono">{order.order_number || order.id.slice(0, 8)}</span>
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Total: ৳{order.total_price.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Package className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Shop Orders */}
          <TabsContent value="shop" className="space-y-4">
            {completedShopOrders.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Store className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No completed shop orders yet</p>
                </CardContent>
              </Card>
            ) : (
              completedShopOrders.map((order) => (
                <Card key={order.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-foreground">{order.shop_book?.title}</h3>
                          {getStatusBadge(order.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Order ID: <span className="font-mono">{order.order_number || order.id.slice(0, 8)}</span>
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Shop: {order.shop?.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Total: ৳{order.total_price.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Store className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Book Demands */}
          <TabsContent value="demands" className="space-y-4">
            {completedDemands.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No completed book demands yet</p>
                </CardContent>
              </Card>
            ) : (
              completedDemands.map((demand) => (
                <Card key={demand.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-foreground">{demand.book_name}</h3>
                          {getStatusBadge(demand.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Demand ID: <span className="font-mono">{demand.demand_number || demand.id.slice(0, 8)}</span>
                        </p>
                        {demand.author_name && (
                          <p className="text-sm text-muted-foreground">by {demand.author_name}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(demand.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <BookOpen className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Contact Unlocks */}
          <TabsContent value="unlocks" className="space-y-4">
            {contactUnlocks.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No contact unlock payments yet</p>
                </CardContent>
              </Card>
            ) : (
              contactUnlocks.map((payment) => (
                <Card key={payment.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-foreground">{payment.book?.title}</h3>
                          {payment.status === 'approved' ? (
                            <Badge variant="success">Approved</Badge>
                          ) : payment.status === 'rejected' ? (
                            <Badge variant="destructive">Rejected</Badge>
                          ) : (
                            <Badge variant="outline">Pending</Badge>
                          )}
                          {payment.refund_requested && (
                            payment.refund_approved === true ? (
                              <Badge variant="success">Refunded</Badge>
                            ) : payment.refund_approved === false ? (
                              <Badge variant="destructive">Refund Denied</Badge>
                            ) : (
                              <Badge variant="secondary">Refund Requested</Badge>
                            )
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Transaction ID: <span className="font-mono">{payment.transaction_number || payment.id.slice(0, 8)}</span>
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Amount: ৳{payment.amount}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(payment.created_at).toLocaleDateString()}
                        </p>
                        
                        {/* Refund Request Button */}
                        {payment.status === 'approved' && !payment.refund_requested && (
                          <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                            <p className="text-sm text-muted-foreground mb-2">
                              Didn't buy the book? You can request a 100% refund.
                            </p>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleRequestRefund(payment.id)}
                              disabled={requestRefund.isPending}
                            >
                              <RefreshCw className="h-4 w-4 mr-1" />
                              Request Refund
                            </Button>
                          </div>
                        )}
                      </div>
                      <CreditCard className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default TransactionHistory;