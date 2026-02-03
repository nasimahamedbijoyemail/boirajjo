import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Store, Package, ShoppingCart, Star, LogOut, Plus, Trash2 } from 'lucide-react';
import { useMyShop, useMyShopBooks, useShopOrders, useCreateShopBook, useDeleteShopBook, useUpdateShopOrderStatus } from '@/hooks/useShops';
import { NILKHET_CATEGORIES } from '@/constants/nilkhetCategories';
import { ORDER_STATUS_LABELS } from '@/types/database';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const ShopDashboard = () => {
  const navigate = useNavigate();
  const { data: shop, isLoading: shopLoading } = useMyShop();
  const { data: books = [], isLoading: booksLoading } = useMyShopBooks();
  const { data: orders = [], isLoading: ordersLoading } = useShopOrders();
  const createBook = useCreateShopBook();
  const deleteBook = useDeleteShopBook();
  const updateOrderStatus = useUpdateShopOrderStatus();
  

  const [showAddBook, setShowAddBook] = useState(false);
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
    } catch (error) {
      toast.error('Failed to add book');
    }
  };

  const handleDeleteBook = async (id: string) => {
    if (!confirm('Are you sure you want to delete this book?')) return;
    try {
      await deleteBook.mutateAsync(id);
      toast.success('Book deleted');
    } catch (error) {
      toast.error('Failed to delete book');
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: 'pending' | 'confirmed' | 'processing' | 'out_for_delivery' | 'delivered' | 'cancelled') => {
    try {
      await updateOrderStatus.mutateAsync({ id: orderId, status });
      toast.success('Order status updated');
    } catch {
      toast.error('Failed to update order');
    }
  };

  const selectedCategory = NILKHET_CATEGORIES.find((c) => c.id === bookForm.category);

  if (shopLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-primary">Loading...</div>
      </div>
    );
  }

  if (!shop) {
    navigate('/shop');
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary rounded-lg p-2">
              <Store className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-semibold text-foreground">{shop.name}</h1>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                {shop.rating_average.toFixed(1)} ({shop.rating_count} reviews)
              </div>
            </div>
          </div>
          <Button variant="ghost" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container py-6 px-4">
        <Tabs defaultValue="books">
          <TabsList className="mb-6">
            <TabsTrigger value="books" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Inventory ({books.length})
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Orders ({orders.length})
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Store className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Inventory Tab */}
          <TabsContent value="books">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Your Books</h2>
              <Button onClick={() => setShowAddBook(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Book
              </Button>
            </div>

            {showAddBook && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Add New Book</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddBook} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Title *</Label>
                        <Input
                          placeholder="Book title"
                          value={bookForm.title}
                          onChange={(e) => setBookForm((p) => ({ ...p, title: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Author *</Label>
                        <Input
                          placeholder="Author name"
                          value={bookForm.author}
                          onChange={(e) => setBookForm((p) => ({ ...p, author: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Price (৳) *</Label>
                        <Input
                          type="number"
                          placeholder="Price"
                          value={bookForm.price}
                          onChange={(e) => setBookForm((p) => ({ ...p, price: e.target.value }))}
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
                        <Label>Physical Condition</Label>
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
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Book Type *</Label>
                        <Select
                          value={bookForm.book_condition_type}
                          onValueChange={(v) => setBookForm((p) => ({ ...p, book_condition_type: v as 'old' | 'new' }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="old">Old Books</SelectItem>
                            <SelectItem value="new">New Books</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Photo URL (optional)</Label>
                        <Input
                          placeholder="https://..."
                          value={bookForm.photo_url}
                          onChange={(e) => setBookForm((p) => ({ ...p, photo_url: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Category *</Label>
                        <Select
                          value={bookForm.category}
                          onValueChange={(v) => setBookForm((p) => ({ ...p, category: v, subcategory: '' }))}
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
                          disabled={!selectedCategory}
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

                    <div className="flex gap-3">
                      <Button type="button" variant="outline" onClick={() => setShowAddBook(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={createBook.isPending}>
                        {createBook.isPending ? 'Adding...' : 'Add Book'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {booksLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading books...</div>
            ) : books.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No books in inventory yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {books.map((book) => (
                  <Card key={book.id}>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {book.photo_url ? (
                          <img src={book.photo_url} alt={book.title} className="h-16 w-12 object-cover rounded" />
                        ) : (
                          <div className="h-16 w-12 bg-muted rounded flex items-center justify-center">
                            <Package className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <h3 className="font-semibold">{book.title}</h3>
                          <p className="text-sm text-muted-foreground">by {book.author}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary">{book.category}</Badge>
                            <Badge variant="outline">{book.book_condition_type === 'new' ? 'New' : 'Old'}</Badge>
                            <span className="text-sm text-muted-foreground">Stock: {book.stock}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-lg font-bold text-primary">৳{book.price.toLocaleString()}</span>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteBook(book.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <h2 className="text-xl font-semibold mb-4">Customer Orders</h2>

            {ordersLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading orders...</div>
            ) : orders.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No orders yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <Card key={order.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <Badge variant="outline" className="mb-2">{order.order_number}</Badge>
                          <h3 className="font-semibold">{order.shop_book?.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            Customer: {order.profile?.name} • Qty: {order.quantity}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {order.detail_address}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-primary">৳{order.total_price.toLocaleString()}</p>
                          <Select
                            value={order.status}
                            onValueChange={(v) => handleUpdateOrderStatus(order.id, v as 'pending' | 'confirmed' | 'processing' | 'out_for_delivery' | 'delivered' | 'cancelled')}
                          >
                            <SelectTrigger className="w-40 mt-2">
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

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Shop Settings</CardTitle>
                <CardDescription>Update your shop information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Shop Name</Label>
                      <p className="font-medium">{shop.name}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Phone</Label>
                      <p className="font-medium">{shop.phone_number}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">WhatsApp</Label>
                      <p className="font-medium">{shop.whatsapp_number || 'Not set'}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Address</Label>
                      <p className="font-medium">{shop.address}</p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Description</Label>
                    <p className="font-medium">{shop.description || 'No description'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Status</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={shop.is_verified ? 'success' : 'secondary'}>
                        {shop.is_verified ? 'Verified' : 'Pending Verification'}
                      </Badge>
                      <Badge variant={shop.is_active ? 'success' : 'destructive'}>
                        {shop.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default ShopDashboard;
