import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useIsAdmin, useAdminStats, useAdminNotifications } from '@/hooks/useAdmin';
import { useAllOrders, useUpdateOrderStatus } from '@/hooks/useOrders';
import { useAllDemands, useUpdateDemandStatus } from '@/hooks/useBookDemands';
import { useCreateBook } from '@/hooks/useBooks';
import { useAuth } from '@/contexts/AuthContext';
import { ORDER_STATUS_LABELS, DEMAND_STATUS_LABELS, OrderStatus, DemandStatus, BookCondition } from '@/types/database';
import { toast } from 'sonner';
import { 
  Package, 
  BookMarked, 
  BookOpen, 
  Users, 
  Plus,
  Bell,
  Store
} from 'lucide-react';

const AdminDashboard = () => {
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();
  const { data: stats } = useAdminStats();
  const { data: orders = [] } = useAllOrders();
  const { data: demands = [] } = useAllDemands();
  const { data: notifications = [] } = useAdminNotifications();
  const updateOrderStatus = useUpdateOrderStatus();
  const updateDemandStatus = useUpdateDemandStatus();
  const createBook = useCreateBook();
  const { profile } = useAuth();

  const [newBookOpen, setNewBookOpen] = useState(false);
  const [newBook, setNewBook] = useState({
    title: '',
    author: '',
    price: '',
    condition: 'good' as BookCondition,
    photo_url: '',
  });

  if (adminLoading) {
    return (
      <Layout>
        <div className="container py-6">
          <div className="animate-pulse">Loading...</div>
        </div>
      </Layout>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/home" replace />;
  }

  const handleOrderStatusChange = async (orderId: string, status: OrderStatus) => {
    try {
      await updateOrderStatus.mutateAsync({ id: orderId, status });
      toast.success('Order status updated');
    } catch {
      toast.error('Failed to update order');
    }
  };

  const handleDemandStatusChange = async (demandId: string, status: DemandStatus) => {
    try {
      await updateDemandStatus.mutateAsync({ id: demandId, status });
      toast.success('Demand status updated');
    } catch {
      toast.error('Failed to update demand');
    }
  };

  const handleAddNilkhetBook = async () => {
    if (!newBook.title || !newBook.author || !newBook.price) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      await createBook.mutateAsync({
        title: newBook.title,
        author: newBook.author,
        price: parseFloat(newBook.price),
        condition: newBook.condition,
        photo_url: newBook.photo_url || null,
        book_type: 'nilkhet',
        is_admin_listing: true,
      });
      toast.success('Nilkhet book added!');
      setNewBookOpen(false);
      setNewBook({ title: '', author: '', price: '', condition: 'good', photo_url: '' });
    } catch {
      toast.error('Failed to add book');
    }
  };

  const getOrderStatusVariant = (status: string) => {
    switch (status) {
      case 'delivered': return 'default';
      case 'out_for_delivery': return 'secondary';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <Layout>
      <div className="container py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground">Manage orders, demands, and listings</p>
          </div>
          <Dialog open={newBookOpen} onOpenChange={setNewBookOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4" />
                Add Nilkhet Book
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Nilkhet Book</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <Input
                  placeholder="Book Title *"
                  value={newBook.title}
                  onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                />
                <Input
                  placeholder="Author *"
                  value={newBook.author}
                  onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                />
                <Input
                  type="number"
                  placeholder="Price (৳) *"
                  value={newBook.price}
                  onChange={(e) => setNewBook({ ...newBook, price: e.target.value })}
                />
                <Select
                  value={newBook.condition}
                  onValueChange={(v) => setNewBook({ ...newBook, condition: v as BookCondition })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="worn">Worn</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Photo URL (optional)"
                  value={newBook.photo_url}
                  onChange={(e) => setNewBook({ ...newBook, photo_url: e.target.value })}
                />
                <Button onClick={handleAddNilkhetBook} className="w-full">
                  Add Book
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Package className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{stats?.pendingOrders || 0}</p>
                  <p className="text-sm text-muted-foreground">Pending Orders</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <BookMarked className="h-8 w-8 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold">{stats?.pendingDemands || 0}</p>
                  <p className="text-sm text-muted-foreground">Book Demands</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Store className="h-8 w-8 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">{stats?.nilkhetBooks || 0}</p>
                  <p className="text-sm text-muted-foreground">Nilkhet Books</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{stats?.totalUsers || 0}</p>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="orders" className="space-y-4">
          <TabsList>
            <TabsTrigger value="orders">Orders ({orders.length})</TabsTrigger>
            <TabsTrigger value="demands">Book Demands ({demands.length})</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-4">
            {orders.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  No orders yet
                </CardContent>
              </Card>
            ) : (
              orders.map((order) => (
                <Card key={order.id}>
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
          </TabsContent>

          <TabsContent value="demands" className="space-y-4">
            {demands.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  No book demands yet
                </CardContent>
              </Card>
            ) : (
              demands.map((demand) => (
                <Card key={demand.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{demand.book_name}</h3>
                          {demand.author_name && (
                            <span className="text-sm text-muted-foreground">
                              by {demand.author_name}
                            </span>
                          )}
                          <Badge variant={getOrderStatusVariant(demand.status)}>
                            {DEMAND_STATUS_LABELS[demand.status]}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Requested by: {demand.profile?.name} | {demand.profile?.phone_number}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Address: {demand.division?.name}, {demand.district?.name}
                          {demand.thana?.name && `, ${demand.thana.name}`}
                          {demand.detail_address && ` - ${demand.detail_address}`}
                        </p>
                      </div>
                      <Select
                        value={demand.status}
                        onValueChange={(v) => handleDemandStatusChange(demand.id, v as DemandStatus)}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="requested">Requested</SelectItem>
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
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            {notifications.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  No notifications yet
                </CardContent>
              </Card>
            ) : (
              notifications.map((notification) => (
                <Card key={notification.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Bell className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <h4 className="font-medium">{notification.title}</h4>
                        <p className="text-sm text-muted-foreground">{notification.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(notification.created_at).toLocaleString()}
                        </p>
                      </div>
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

export default AdminDashboard;
