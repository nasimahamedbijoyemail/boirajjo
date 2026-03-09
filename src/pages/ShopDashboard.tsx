import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Store, Package, ShoppingCart, Star, LogOut, Plus, Trash2, Edit, 
  TrendingUp, DollarSign, CheckCircle, Clock,
  Search, Filter, Eye, EyeOff, MessageSquare, BarChart3, Lock
} from 'lucide-react';
import { ChangePasswordForm } from '@/components/profile/ChangePasswordForm';
import { PhotoUpload } from '@/components/ui/photo-upload';
import { 
  useMyShop, useMyShopBooks, useShopOrders, useCreateShopBook, 
  useDeleteShopBook, useUpdateShopOrderStatus, useUpdateShopBook,
  useShopRatings, useUpdateShop
} from '@/hooks/useShops';
import { NILKHET_CATEGORIES } from '@/constants/nilkhetCategories';
import { ORDER_STATUS_LABELS } from '@/types/database';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const ShopDashboard = () => {
  const navigate = useNavigate();
  const { data: shop, isLoading: shopLoading } = useMyShop();
  const { data: books = [], isLoading: booksLoading } = useMyShopBooks();
  const { data: orders = [], isLoading: ordersLoading } = useShopOrders();
  const { data: ratings = [] } = useShopRatings(shop?.id || '');
  
  const createBook = useCreateShopBook();
  const deleteBook = useDeleteShopBook();
  const updateBook = useUpdateShopBook();
  const updateOrderStatus = useUpdateShopOrderStatus();
  const updateShop = useUpdateShop();

  const [showAddBook, setShowAddBook] = useState(false);
  const [editingBook, setEditingBook] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  
  const [bookForm, setBookForm] = useState({
    title: '',
    author: '',
    price: '',
    condition: 'good' as 'new' | 'good' | 'worn',
    book_condition_type: 'old' as 'old' | 'new',
    category: '',
    subcategory: '',
    stock: '1',
    photo_url: '',
  });

  const [shopSettingsForm, setShopSettingsForm] = useState({
    name: shop?.name || '',
    description: shop?.description || '',
    phone_number: shop?.phone_number || '',
    whatsapp_number: shop?.whatsapp_number || '',
    address: shop?.address || '',
    logo_url: shop?.logo_url || '',
  });

  // Update shop settings form when shop data loads
  useEffect(() => {
    if (shop) {
      setShopSettingsForm({
        name: shop.name,
        description: shop.description || '',
        phone_number: shop.phone_number,
        whatsapp_number: shop.whatsapp_number || '',
        address: shop.address || '',
        logo_url: shop.logo_url || '',
      });
    }
  }, [shop]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/shop');
  };

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bookForm.title || !bookForm.author || !bookForm.price || !bookForm.category || !bookForm.subcategory) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await createBook.mutateAsync({
        title: bookForm.title,
        author: bookForm.author,
        price: parseFloat(bookForm.price),
        condition: bookForm.condition,
        book_condition_type: bookForm.book_condition_type,
        category: bookForm.category,
        subcategory: bookForm.subcategory,
        stock: parseInt(bookForm.stock) || 1,
        photo_url: bookForm.photo_url || null,
      });
      toast.success('Book added successfully!');
      setShowAddBook(false);
      resetBookForm();
    } catch (err) {
      console.error('Failed to add book:', err);
      toast.error('Failed to add book');
    }
  };

  const handleEditBook = async (bookId: string) => {
    const book = books.find(b => b.id === bookId);
    if (!book) return;

    if (!bookForm.title || !bookForm.price) {
      toast.error('Please fill in required fields');
      return;
    }

    try {
      await updateBook.mutateAsync({
        id: bookId,
        title: bookForm.title,
        author: bookForm.author,
        price: parseFloat(bookForm.price),
        stock: parseInt(bookForm.stock) || 1,
        photo_url: bookForm.photo_url || null,
      });
      toast.success('Book updated');
      setEditingBook(null);
      resetBookForm();
    } catch (err) {
      console.error('Failed to update book:', err);
      toast.error('Failed to update book');
    }
  };

  const startEditingBook = (bookId: string) => {
    const book = books.find(b => b.id === bookId);
    if (!book) return;
    
    setBookForm({
      title: book.title,
      author: book.author,
      price: book.price.toString(),
      condition: book.condition,
      book_condition_type: book.book_condition_type,
      category: book.category,
      subcategory: book.subcategory,
      stock: (book.stock || 1).toString(),
      photo_url: book.photo_url || '',
    });
    setEditingBook(bookId);
  };

  const resetBookForm = () => {
    setBookForm({
      title: '',
      author: '',
      price: '',
      condition: 'good',
      book_condition_type: 'old',
      category: '',
      subcategory: '',
      stock: '1',
      photo_url: '',
    });
  };

  const handleDeleteBook = async (id: string) => {
    if (!confirm('Are you sure you want to delete this book?')) return;
    try {
      await deleteBook.mutateAsync(id);
      toast.success('Book deleted');
    } catch (err) {
      console.error('Failed to delete book:', err);
      toast.error('Failed to delete book');
    }
  };

  const handleToggleBookAvailability = async (id: string, isAvailable: boolean) => {
    try {
      await updateBook.mutateAsync({ id, is_available: isAvailable });
      toast.success(isAvailable ? 'Book published' : 'Book unpublished');
    } catch (err) {
      console.error('Failed to toggle availability:', err);
      toast.error('Failed to update book');
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: any, shopNotes?: string) => {
    try {
      await updateOrderStatus.mutateAsync({ id: orderId, status, shop_notes: shopNotes });
      toast.success('Order status updated');
    } catch {
      toast.error('Failed to update order');
    }
  };

  const handleUpdateShopSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shop) return;

    try {
      await updateShop.mutateAsync({
        id: shop.id,
        ...shopSettingsForm,
      });
      toast.success('Shop settings updated!');
    } catch (err) {
      console.error('Failed to update shop settings:', err);
      toast.error('Failed to update shop settings');
    }
  };

  const selectedCategory = NILKHET_CATEGORIES.find((c) => c.id === bookForm.category);

  // Analytics calculations
  const totalRevenue = orders
    .filter(o => o.status === 'delivered')
    .reduce((sum, o) => sum + Number(o.total_price), 0);
  
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const completedOrders = orders.filter(o => o.status === 'delivered').length;
  const activeListings = books.filter(b => b.is_available).length;

  const filteredBooks = books.filter(book => 
    book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredOrders = orderStatusFilter === 'all' 
    ? orders 
    : orders.filter(o => o.status === orderStatusFilter);

  if (shopLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="h-16 border-b bg-card/95 animate-pulse" />
        <div className="container mx-auto px-4 py-6 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-28 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
          <div className="h-64 rounded-xl bg-muted animate-pulse" />
          <div className="h-48 rounded-xl bg-muted animate-pulse" />
        </div>
      </div>
    );
  }

  if (!shop) {
    navigate('/shop');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Premium Header */}
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="relative">
                {shop.logo_url ? (
                  <img src={shop.logo_url} alt={shop.name} className="h-10 w-10 rounded-lg object-cover" />
                ) : (
                  <div className="gradient-primary rounded-lg p-2">
                    <Store className="h-6 w-6 text-primary-foreground" />
                  </div>
                )}
                {shop.is_verified && (
                  <div className="absolute -top-1 -right-1 bg-success rounded-full p-0.5">
                    <CheckCircle className="h-3 w-3 text-success-foreground" />
                  </div>
                )}
              </div>
              <div>
                <h1 className="font-bold text-foreground text-lg">{shop.name}</h1>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-warning text-warning" />
                    <span className="font-medium">{shop.rating_average?.toFixed(1) || '0.0'}</span>
                    <span>({shop.rating_count || 0})</span>
                  </div>
                  {shop.is_verified && (
                    <Badge variant="success" className="h-5 text-xs">Verified</Badge>
                  )}
                  {!shop.is_active && (
                    <Badge variant="destructive" className="h-5 text-xs">Inactive</Badge>
                  )}
                </div>
              </div>
            </div>
            <Button variant="ghost" onClick={handleLogout} className="gap-2">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 md:py-8 max-w-7xl">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto">
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
              <span className="sm:hidden">Stats</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-2">
              <ShoppingCart className="h-4 w-4" />
              <span className="hidden sm:inline">Orders</span>
              <span className="sm:hidden">Orders</span>
              {pendingOrders > 0 && (
                <Badge variant="destructive" className="h-5 min-w-5 text-xs px-1">{pendingOrders}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="inventory" className="gap-2">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Inventory</span>
              <span className="sm:hidden">Books</span>
              <Badge variant="outline" className="h-5 text-xs px-1">{books.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="reviews" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Reviews</span>
              <span className="sm:hidden">Reviews</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Store className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
              <span className="sm:hidden">Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Analytics Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="gradient-card">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-card-foreground">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">৳{totalRevenue.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground mt-1">From {completedOrders} completed orders</p>
                </CardContent>
              </Card>

              <Card className="gradient-card">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-card-foreground">Pending Orders</CardTitle>
                  <Clock className="h-4 w-4 text-warning" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{pendingOrders}</div>
                  <p className="text-xs text-muted-foreground mt-1">Need your attention</p>
                </CardContent>
              </Card>

              <Card className="gradient-card">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-card-foreground">Active Listings</CardTitle>
                  <TrendingUp className="h-4 w-4 text-success" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{activeListings}</div>
                  <p className="text-xs text-muted-foreground mt-1">Out of {books.length} total</p>
                </CardContent>
              </Card>

              <Card className="gradient-card">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-card-foreground">Customer Rating</CardTitle>
                  <Star className="h-4 w-4 text-warning fill-warning" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{shop.rating_average?.toFixed(1) || '0.0'}</div>
                  <p className="text-xs text-muted-foreground mt-1">Based on {shop.rating_count || 0} reviews</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Recent Orders
                </CardTitle>
                <CardDescription>Latest customer orders</CardDescription>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No orders yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.slice(0, 5).map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                        <div className="space-y-1">
                          <p className="font-medium text-sm">{order.shop_book?.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {order.profile?.name} • {new Date(order.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right space-y-1">
                          <p className="font-bold text-primary">৳{order.total_price.toLocaleString()}</p>
                          <Badge variant={
                            order.status === 'delivered' ? 'success' :
                            order.status === 'cancelled' ? 'destructive' :
                            order.status === 'pending' ? 'warning' : 'default'
                          } className="text-xs">
                            {ORDER_STATUS_LABELS[order.status]}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Select value={orderStatusFilter} onValueChange={setOrderStatusFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Orders</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {ordersLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : filteredOrders.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">No orders found</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <Card key={order.id} className="overflow-hidden">
                    <CardContent className="p-4 md:p-6">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        {/* Order Info */}
                        <div className="flex-1 space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <Badge variant="outline" className="mb-2">{order.order_number}</Badge>
                              <h3 className="font-semibold text-lg">{order.shop_book?.title}</h3>
                              <p className="text-sm text-muted-foreground">by {order.shop_book?.author}</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Customer:</span>
                              <p className="font-medium">{order.profile?.name}</p>
                              <p className="text-xs text-muted-foreground">{order.profile?.phone_number}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Delivery Address:</span>
                              <p className="text-xs">{order.detail_address || 'N/A'}</p>
                            </div>
                          </div>

                          {order.customer_notes && (
                            <div className="bg-muted/50 p-3 rounded-lg">
                              <p className="text-xs text-muted-foreground mb-1">Customer Notes:</p>
                              <p className="text-sm">{order.customer_notes}</p>
                            </div>
                          )}
                        </div>

                        {/* Order Actions */}
                        <div className="flex flex-col gap-3 min-w-48">
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">Total Amount</p>
                            <p className="text-2xl font-bold text-primary">৳{order.total_price.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">Qty: {order.quantity}</p>
                          </div>
                          
                          <Select
                            value={order.status}
                            onValueChange={(v) => handleUpdateOrderStatus(order.id, v)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => (
                                <SelectItem key={value} value={value}>
                                  {label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Inventory Tab */}
          <TabsContent value="inventory" className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search books by title or author..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button onClick={() => setShowAddBook(true)} className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Add Book
              </Button>
            </div>

            {/* Add/Edit Book Form */}
            {(showAddBook || editingBook) && (
              <Card>
                <CardHeader>
                  <CardTitle>{editingBook ? 'Edit Book' : 'Add New Book'}</CardTitle>
                  <CardDescription>Fill in the book details</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={editingBook ? (e) => { e.preventDefault(); handleEditBook(editingBook); } : handleAddBook} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Title *</Label>
                        <Input
                          placeholder="Book title"
                          value={bookForm.title}
                          onChange={(e) => setBookForm((p) => ({ ...p, title: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Author *</Label>
                        <Input
                          placeholder="Author name"
                          value={bookForm.author}
                          onChange={(e) => setBookForm((p) => ({ ...p, author: e.target.value }))}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label>Price (৳) *</Label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={bookForm.price}
                          onChange={(e) => setBookForm((p) => ({ ...p, price: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Stock</Label>
                        <Input
                          type="number"
                          placeholder="1"
                          value={bookForm.stock}
                          onChange={(e) => setBookForm((p) => ({ ...p, stock: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Condition</Label>
                        <Select
                          value={bookForm.condition}
                          onValueChange={(v) => setBookForm((p) => ({ ...p, condition: v as any }))}
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
                      </div>
                      <div className="space-y-2">
                        <Label>Type *</Label>
                        <Select
                          value={bookForm.book_condition_type}
                          onValueChange={(v) => setBookForm((p) => ({ ...p, book_condition_type: v as 'old' | 'new' }))}
                          disabled={!!editingBook}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">New Books</SelectItem>
                            <SelectItem value="old">Old Books</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Category *</Label>
                        <Select
                          value={bookForm.category}
                          onValueChange={(v) => setBookForm((p) => ({ ...p, category: v, subcategory: '' }))}
                          disabled={!!editingBook}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {NILKHET_CATEGORIES.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id}>
                                {cat.icon} {cat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Subcategory *</Label>
                        <Select
                          value={bookForm.subcategory}
                          onValueChange={(v) => setBookForm((p) => ({ ...p, subcategory: v }))}
                          disabled={!selectedCategory || !!editingBook}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select subcategory" />
                          </SelectTrigger>
                          <SelectContent>
                            {selectedCategory?.subcategories.map((sub) => (
                              <SelectItem key={sub.id} value={sub.id}>
                                {sub.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Book Photo</Label>
                      <PhotoUpload 
                        value={bookForm.photo_url} 
                        onChange={(url) => setBookForm((p) => ({ ...p, photo_url: url }))} 
                      />
                    </div>

                    <div className="flex gap-3">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => {
                          setShowAddBook(false);
                          setEditingBook(null);
                          resetBookForm();
                        }}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={createBook.isPending || updateBook.isPending}>
                        {createBook.isPending || updateBook.isPending ? 'Saving...' : editingBook ? 'Update Book' : 'Add Book'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Books Grid */}
            {booksLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : filteredBooks.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">
                    {searchQuery ? 'No books found matching your search' : 'No books in inventory yet'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredBooks.map((book) => (
                  <Card key={book.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row items-start gap-4">
                        {/* Book Image */}
                        <div className="shrink-0 w-full sm:w-24 h-32 rounded-lg overflow-hidden bg-muted">
                          {book.photo_url ? (
                            <img src={book.photo_url} alt={book.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="h-8 w-8 text-muted-foreground" />
                            </div>
                          )}
                        </div>

                        {/* Book Info */}
                        <div className="flex-1 min-w-0 space-y-2">
                          <div>
                            <h3 className="font-semibold text-lg">{book.title}</h3>
                            <p className="text-sm text-muted-foreground">by {book.author}</p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="secondary">{book.category}</Badge>
                            <Badge variant="outline">{book.subcategory}</Badge>
                            <Badge variant={book.book_condition_type === 'new' ? 'default' : 'secondary'}>
                              {book.book_condition_type === 'new' ? 'New Books' : 'Old Books'}
                            </Badge>
                            <Badge variant="outline">Condition: {book.condition}</Badge>
                            <Badge variant="outline">Stock: {book.stock}</Badge>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-row sm:flex-col items-center gap-3 w-full sm:w-auto">
                          <span className="text-xl font-bold text-primary">৳{book.price.toLocaleString()}</span>
                          <div className="flex items-center gap-2 ml-auto sm:ml-0">
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={book.is_available}
                                onCheckedChange={(checked) => handleToggleBookAvailability(book.id, checked)}
                              />
                              {book.is_available ? (
                                <Eye className="h-4 w-4 text-success" />
                              ) : (
                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => startEditingBook(book.id)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteBook(book.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Customer Reviews
                </CardTitle>
                <CardDescription>
                  {ratings.length} total reviews • Average rating: {shop.rating_average?.toFixed(1) || '0.0'} / 5.0
                </CardDescription>
              </CardHeader>
              <CardContent>
                {ratings.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No reviews yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {ratings.map((rating) => (
                      <div key={rating.id} className="border-b last:border-0 pb-4 last:pb-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-medium">{rating.profile?.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(rating.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < rating.rating
                                    ? 'fill-yellow-500 text-yellow-500'
                                    : 'text-muted-foreground'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        {rating.review && (
                          <p className="text-sm text-muted-foreground">{rating.review}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Shop Settings</CardTitle>
                <CardDescription>Update your shop information</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateShopSettings} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Shop Logo</Label>
                    <PhotoUpload
                      value={shopSettingsForm.logo_url}
                      onChange={(url) => setShopSettingsForm(p => ({ ...p, logo_url: url }))}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Shop Name *</Label>
                      <Input
                        value={shopSettingsForm.name}
                        onChange={(e) => setShopSettingsForm(p => ({ ...p, name: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone Number *</Label>
                      <Input
                        value={shopSettingsForm.phone_number}
                        onChange={(e) => setShopSettingsForm(p => ({ ...p, phone_number: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>WhatsApp Number</Label>
                    <Input
                      value={shopSettingsForm.whatsapp_number}
                      onChange={(e) => setShopSettingsForm(p => ({ ...p, whatsapp_number: e.target.value }))}
                      placeholder="01XXXXXXXXX"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Shop Address in Nilkhet *</Label>
                    <Input
                      value={shopSettingsForm.address}
                      onChange={(e) => setShopSettingsForm(p => ({ ...p, address: e.target.value }))}
                      placeholder="e.g., Shop #15, Nilkhet Book Market"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Shop Description</Label>
                    <Textarea
                      value={shopSettingsForm.description}
                      onChange={(e) => setShopSettingsForm(p => ({ ...p, description: e.target.value }))}
                      placeholder="Brief description of your shop"
                      rows={3}
                    />
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-sm">Shop Status</p>
                      <p className="text-xs text-muted-foreground">
                        {shop.is_active ? 'Your shop is active and visible to customers' : 'Your shop is currently inactive'}
                      </p>
                    </div>
                    <Badge variant={shop.is_active ? 'success' : 'destructive'}>
                      {shop.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>

                  {shop.is_verified && (
                    <div className="flex items-center gap-4 p-4 bg-success/10 border border-success/20 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-success" />
                      <div className="flex-1">
                        <p className="font-medium text-sm text-success">Verified Shop</p>
                        <p className="text-xs text-success/80">Your shop has been verified by admin</p>
                      </div>
                    </div>
                  )}

                  <Button type="submit" className="w-full md:w-auto">
                    Save Changes
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Change Password */}
            <ChangePasswordForm />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default ShopDashboard;
