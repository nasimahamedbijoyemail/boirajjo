import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Package, Store } from 'lucide-react';
import { useAllOrders, useUpdateOrderStatus } from '@/hooks/useOrders';
import { useAllShopOrders, useUpdateShopOrderStatusAdmin } from '@/hooks/useAdmin';
import { ORDER_STATUS_LABELS, OrderStatus } from '@/types/database';
import { toast } from 'sonner';

const AdminOrdersTab = () => {
  const { data: orders = [], isLoading: ordersLoading } = useAllOrders();
  const { data: shopOrders = [], isLoading: shopOrdersLoading } = useAllShopOrders();
  const updateOrderStatus = useUpdateOrderStatus();
  const updateShopOrderStatus = useUpdateShopOrderStatusAdmin();

  const handleOrderStatusChange = async (orderId: string, status: OrderStatus) => {
    try {
      await updateOrderStatus.mutateAsync({ id: orderId, status });
      toast.success('Order status updated');
    } catch {
      toast.error('Failed to update order');
    }
  };

  const handleShopOrderStatusChange = async (orderId: string, status: OrderStatus) => {
    try {
      await updateShopOrderStatus.mutateAsync({ id: orderId, status });
      toast.success('Shop order status updated');
    } catch {
      toast.error('Failed to update shop order');
    }
  };

  const getOrderStatusVariant = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'default';
      case 'out_for_delivery':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  if (ordersLoading || shopOrdersLoading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="animate-pulse text-center">Loading orders...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Nilkhet Orders (from books table) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Book Orders ({orders.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {orders.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No orders yet</p>
          ) : (
            orders.map((order) => (
              <Card key={order.id} className="border-dashed">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{order.book?.title}</h3>
                        <Badge variant={getOrderStatusVariant(order.status)}>
                          {ORDER_STATUS_LABELS[order.status]}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Order ID: <span className="font-mono">{order.order_number || order.id.slice(0, 8)}</span>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Customer: {order.profile?.name} | {order.profile?.phone_number}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Address: {order.division?.name}, {order.district?.name}
                        {order.thana?.name && `, ${order.thana.name}`}
                        {order.detail_address && ` - ${order.detail_address}`}
                      </p>
                      <p className="text-sm font-medium mt-1">
                        Amount: ৳{order.total_price.toLocaleString()}
                      </p>
                    </div>
                    <Select
                      value={order.status}
                      onValueChange={(v) => handleOrderStatusChange(order.id, v as OrderStatus)}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>

      {/* Shop Orders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            Shop Orders ({shopOrders.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {shopOrders.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No shop orders yet</p>
          ) : (
            shopOrders.map((order) => (
              <Card key={order.id} className="border-dashed">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{order.shop_book?.title}</h3>
                        <Badge variant={getOrderStatusVariant(order.status)}>
                          {ORDER_STATUS_LABELS[order.status]}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Order ID: <span className="font-mono">{order.order_number || order.id.slice(0, 8)}</span>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Shop: {order.shop?.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Customer: {order.profile?.name} | {order.profile?.phone_number}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Address: {order.division?.name}, {order.district?.name}
                        {order.thana?.name && `, ${order.thana.name}`}
                        {order.detail_address && ` - ${order.detail_address}`}
                      </p>
                      <p className="text-sm font-medium mt-1">
                        Amount: ৳{order.total_price.toLocaleString()}
                      </p>
                    </div>
                    <Select
                      value={order.status}
                      onValueChange={(v) => handleShopOrderStatusChange(order.id, v as OrderStatus)}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminOrdersTab;