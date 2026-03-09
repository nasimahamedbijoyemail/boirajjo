import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { 
  Search, Store, BookOpen, Eye, EyeOff, Star, Phone, CheckCircle, 
  TrendingUp, Users, ShoppingCart, Edit, Package
} from 'lucide-react';
import { useAllShops, useShopBooksAdmin, useUpdateShop, useUpdateShopBookAvailability } from '@/hooks/useAdmin';
import { useAllShopOrders } from '@/hooks/useAdmin';
import { toast } from 'sonner';

const AdminShopsTab = () => {
  const { data: shops = [], isLoading } = useAllShops();
  const { data: allShopOrders = [] } = useAllShopOrders();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);
  const [shopBooksOpen, setShopBooksOpen] = useState(false);
  const [shopOrdersOpen, setShopOrdersOpen] = useState(false);
  const [shopEditOpen, setShopEditOpen] = useState(false);

  const { data: shopBooks = [] } = useShopBooksAdmin(selectedShopId || '');
  const updateShop = useUpdateShop();
  const updateShopBookAvailability = useUpdateShopBookAvailability();

  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    phone_number: '',
    whatsapp_number: '',
    address: '',
  });

  const filteredShops = shops.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.phone_number.includes(searchQuery) ||
      s.address?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedShop = shops.find(s => s.id === selectedShopId);
  const shopOrders = allShopOrders.filter(o => o.shop_id === selectedShopId);

  // Stats
  const totalShops = shops.length;
  const activeShops = shops.filter(s => s.is_active).length;
  const verifiedShops = shops.filter(s => s.is_verified).length;
  const totalShopOrders = allShopOrders.length;
  const pendingShopOrders = allShopOrders.filter(o => o.status === 'pending').length;

  const handleViewBooks = (shopId: string) => {
    setSelectedShopId(shopId);
    setShopBooksOpen(true);
  };

  const handleViewOrders = (shopId: string) => {
    setSelectedShopId(shopId);
    setShopOrdersOpen(true);
  };

  const handleEditShop = (shopId: string) => {
    const shop = shops.find(s => s.id === shopId);
    if (!shop) return;
    
    setEditForm({
      name: shop.name,
      description: shop.description || '',
      phone_number: shop.phone_number,
      whatsapp_number: shop.whatsapp_number || '',
      address: shop.address || '',
    });
    setSelectedShopId(shopId);
    setShopEditOpen(true);
  };

  const handleSaveShopEdit = async () => {
    if (!selectedShopId) return;
    
    try {
      await updateShop.mutateAsync({
        id: selectedShopId,
        ...editForm,
      });
      toast.success('Shop updated successfully');
      setShopEditOpen(false);
    } catch {
      toast.error('Failed to update shop');
    }
  };

  const handleToggleShopActive = async (shopId: string, isActive: boolean) => {
    try {
      await updateShop.mutateAsync({ id: shopId, is_active: isActive });
      toast.success(isActive ? 'Shop activated' : 'Shop deactivated');
    } catch {
      toast.error('Failed to update shop');
    }
  };

  const handleToggleShopVerified = async (shopId: string, isVerified: boolean) => {
    try {
      await updateShop.mutateAsync({ id: shopId, is_verified: isVerified });
      toast.success(isVerified ? 'Shop verified' : 'Shop unverified');
    } catch {
      toast.error('Failed to update shop');
    }
  };

  const handleToggleBookAvailability = async (bookId: string, isAvailable: boolean) => {
    try {
      await updateShopBookAvailability.mutateAsync({ id: bookId, is_available: isAvailable });
      toast.success(isAvailable ? 'Book published' : 'Book unpublished');
    } catch {
      toast.error('Failed to update book');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="animate-pulse text-center">Loading shops...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="gradient-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Shops</CardTitle>
            <Store className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalShops}</div>
            <p className="text-xs text-muted-foreground">{verifiedShops} verified</p>
          </CardContent>
        </Card>

        <Card className="gradient-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Shops</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeShops}</div>
            <p className="text-xs text-muted-foreground">
              {totalShops - activeShops} inactive
            </p>
          </CardContent>
        </Card>

        <Card className="gradient-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Verified</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{verifiedShops}</div>
            <p className="text-xs text-muted-foreground">
              {totalShops - verifiedShops} pending
            </p>
          </CardContent>
        </Card>

        <Card className="gradient-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Shop Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalShopOrders}</div>
            <p className="text-xs text-muted-foreground">{pendingShopOrders} pending</p>
          </CardContent>
        </Card>

        <Card className="gradient-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {shops.length > 0
                ? (shops.reduce((sum, s) => sum + (s.rating_average || 0), 0) / shops.length).toFixed(1)
                : '0.0'}
            </div>
            <p className="text-xs text-muted-foreground">across all shops</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search shops by name, phone, or address..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Shops Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            All Shops ({filteredShops.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Shop Info</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Controls</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredShops.map((shop) => (
                  <TableRow key={shop.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {shop.logo_url ? (
                          <img src={shop.logo_url} alt={shop.name} className="h-10 w-10 rounded-lg object-cover" />
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Store className="h-5 w-5 text-primary" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{shop.name}</p>
                          {shop.address && (
                            <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {shop.address}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Phone className="h-3 w-3" />
                          {shop.phone_number}
                        </div>
                        {shop.whatsapp_number && (
                          <div className="text-xs text-muted-foreground">
                            WA: {shop.whatsapp_number}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                        <span className="font-medium">{shop.rating_average?.toFixed(1) || '0.0'}</span>
                        <span className="text-muted-foreground text-xs">
                          ({shop.rating_count || 0})
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {shop.is_verified && (
                          <Badge variant="success" className="w-fit">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                        {shop.is_active ? (
                          <Badge variant="outline" className="w-fit">Active</Badge>
                        ) : (
                          <Badge variant="destructive" className="w-fit">Inactive</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-4">
                        <div className="flex flex-col items-center gap-1">
                          <Switch
                            checked={shop.is_active}
                            onCheckedChange={(checked) => handleToggleShopActive(shop.id, checked)}
                          />
                          <span className="text-xs text-muted-foreground">Active</span>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                          <Switch
                            checked={shop.is_verified}
                            onCheckedChange={(checked) => handleToggleShopVerified(shop.id, checked)}
                          />
                          <span className="text-xs text-muted-foreground">Verified</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditShop(shop.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewBooks(shop.id)}
                        >
                          <BookOpen className="h-4 w-4 mr-1" />
                          <span className="hidden lg:inline">Books</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewOrders(shop.id)}
                        >
                          <ShoppingCart className="h-4 w-4 mr-1" />
                          <span className="hidden lg:inline">Orders</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Shop Dialog */}
      <Dialog open={shopEditOpen} onOpenChange={setShopEditOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Shop: {selectedShop?.name}</DialogTitle>
            <DialogDescription>Update shop information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Shop Name</label>
              <Input
                value={editForm.name}
                onChange={(e) => setEditForm(p => ({ ...p, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone Number</label>
              <Input
                value={editForm.phone_number}
                onChange={(e) => setEditForm(p => ({ ...p, phone_number: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">WhatsApp Number</label>
              <Input
                value={editForm.whatsapp_number}
                onChange={(e) => setEditForm(p => ({ ...p, whatsapp_number: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Address</label>
              <Input
                value={editForm.address}
                onChange={(e) => setEditForm(p => ({ ...p, address: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={editForm.description}
                onChange={(e) => setEditForm(p => ({ ...p, description: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShopEditOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveShopEdit} disabled={updateShop.isPending}>
                {updateShop.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Shop Books Dialog */}
      <Dialog open={shopBooksOpen} onOpenChange={setShopBooksOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              {selectedShop?.name} - Inventory
            </DialogTitle>
            <DialogDescription>{shopBooks.length} books listed</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {shopBooks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No books listed by this shop</p>
              </div>
            ) : (
              shopBooks.map((book) => (
                <Card key={book.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex gap-3 flex-1">
                        <div className="h-20 w-16 rounded-lg overflow-hidden bg-muted shrink-0">
                          {book.photo_url ? (
                            <img
                              src={book.photo_url}
                              alt={book.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <BookOpen className="h-6 w-6 text-muted-foreground/50" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{book.title}</h4>
                          <p className="text-sm text-muted-foreground">by {book.author}</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <Badge variant="secondary" className="text-xs">{book.category}</Badge>
                            <Badge variant="outline" className="text-xs">{book.subcategory}</Badge>
                            <Badge variant={book.book_condition_type === 'new' ? 'default' : 'secondary'} className="text-xs">
                              {book.book_condition_type === 'new' ? 'New' : 'Old'}
                            </Badge>
                            <Badge variant="outline" className="text-xs">Stock: {book.stock}</Badge>
                          </div>
                          <p className="text-sm font-medium text-primary mt-2">
                            ৳{book.price.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Badge variant={book.is_available ? 'success' : 'secondary'}>
                          {book.is_available ? 'Available' : 'Unavailable'}
                        </Badge>
                        {book.is_available ? (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleToggleBookAvailability(book.id, false)}
                          >
                            <EyeOff className="h-4 w-4 mr-1" />
                            Unpublish
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleBookAvailability(book.id, true)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Publish
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Shop Orders Dialog */}
      <Dialog open={shopOrdersOpen} onOpenChange={setShopOrdersOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              {selectedShop?.name} - Orders
            </DialogTitle>
            <DialogDescription>{shopOrders.length} total orders</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {shopOrders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No orders for this shop</p>
              </div>
            ) : (
              shopOrders.map((order) => (
                <Card key={order.id}>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <Badge variant="outline" className="mb-2">{order.order_number}</Badge>
                          <h4 className="font-semibold">{order.shop_book?.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            Customer: {order.profile?.name} • Qty: {order.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-primary">৳{order.total_price.toLocaleString()}</p>
                          <Badge variant={
                            order.status === 'delivered' ? 'success' :
                            order.status === 'cancelled' ? 'destructive' :
                            order.status === 'pending' ? 'warning' : 'default'
                          }>
                            {order.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-sm">
                        <p className="text-muted-foreground">Delivery Address:</p>
                        <p>{order.detail_address || 'N/A'}</p>
                      </div>
                      {order.customer_notes && (
                        <div className="bg-muted/50 p-3 rounded-lg">
                          <p className="text-xs text-muted-foreground mb-1">Customer Notes:</p>
                          <p className="text-sm">{order.customer_notes}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminShopsTab;
