import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Store, Search, User, Phone, Mail, Clock, MapPin } from 'lucide-react';
import { useAllShopOrders, useUpdateShopOrderStatusAdmin } from '@/hooks/useAdmin';
import { ORDER_STATUS_LABELS, OrderStatus } from '@/types/database';
import { toast } from 'sonner';
import { format } from 'date-fns';

const AdminOrdersTab = () => {
  const { data: shopOrders = [], isLoading: shopOrdersLoading } = useAllShopOrders();
  const updateShopOrderStatus = useUpdateShopOrderStatusAdmin();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOrders = useMemo(() => {
    if (!searchQuery.trim()) return shopOrders;
    
    const query = searchQuery.toLowerCase();
    return shopOrders.filter(order => {
      const orderNumber = order.order_number?.toLowerCase() || '';
      const customerName = order.profile?.name?.toLowerCase() || '';
      const customerPhone = order.profile?.phone_number?.toLowerCase() || '';
      const bookTitle = order.shop_book?.title?.toLowerCase() || '';
      const shopName = order.shop?.name?.toLowerCase() || '';
      const status = order.status?.toLowerCase() || '';
      
      return (
        orderNumber.includes(query) ||
        customerName.includes(query) ||
        customerPhone.includes(query) ||
        bookTitle.includes(query) ||
        shopName.includes(query) ||
        status.includes(query)
      );
    });
  }, [shopOrders, searchQuery]);

  const handleShopOrderStatusChange = async (orderId: string, status: OrderStatus) => {
    try {
      await updateShopOrderStatus.mutateAsync({ id: orderId, status });
      toast.success('Order status updated');
    } catch {
      toast.error('Failed to update order');
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

  if (shopOrdersLoading) {
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
      {/* Nilkhet Book Orders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            Nilkhet Book Orders ({shopOrders.length})
          </CardTitle>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by order ID, customer name, phone, book title, shop, status..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {filteredOrders.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              {searchQuery ? 'No orders match your search' : 'No orders yet'}
            </p>
          ) : (
            filteredOrders.map((order) => (
              <Card key={order.id} className="border-dashed">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold">{order.shop_book?.title}</h3>
                        <Badge variant={getOrderStatusVariant(order.status)}>
                          {ORDER_STATUS_LABELS[order.status]}
                        </Badge>
                      </div>
                      
                      {/* Order Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        <div className="space-y-1">
                          <p className="flex items-center gap-2 text-muted-foreground">
                            <span className="font-medium text-foreground">Order ID:</span>
                            <span className="font-mono">{order.order_number || order.id.slice(0, 8)}</span>
                          </p>
                          <p className="flex items-center gap-2 text-muted-foreground">
                            <Store className="h-3 w-3" />
                            <span className="font-medium text-foreground">Shop:</span>
                            {order.shop?.name}
                          </p>
                          <p className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span className="font-medium text-foreground">Time:</span>
                            {format(new Date(order.created_at), 'PPp')}
                          </p>
                        </div>
                        
                        <div className="space-y-1">
                          <p className="flex items-center gap-2 text-muted-foreground">
                            <User className="h-3 w-3" />
                            <span className="font-medium text-foreground">Customer:</span>
                            {order.profile?.name}
                          </p>
                          <p className="flex items-center gap-2 text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            <span className="font-medium text-foreground">Phone:</span>
                            {order.profile?.phone_number}
                          </p>
                          <p className="flex items-center gap-2 text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            <span className="font-medium text-foreground">WhatsApp:</span>
                            {order.profile?.whatsapp_number || 'N/A'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span className="font-medium text-foreground">Address:</span>
                        {order.division?.name}, {order.district?.name}
                        {order.detail_address && ` - ${order.detail_address}`}
                      </div>

                      <p className="text-sm font-medium">
                        Amount: <span className="text-primary">৳{order.total_price.toLocaleString()}</span>
                        {order.quantity && order.quantity > 1 && ` (Qty: ${order.quantity})`}
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