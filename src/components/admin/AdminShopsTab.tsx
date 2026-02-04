import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
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
} from '@/components/ui/dialog';
import { Search, Store, BookOpen, Eye, EyeOff, Star, Phone, CheckCircle } from 'lucide-react';
import { useAllShops, useShopBooksAdmin, useUpdateShop, useUpdateShopBookAvailability } from '@/hooks/useAdmin';
import { toast } from 'sonner';

const AdminShopsTab = () => {
  const { data: shops = [], isLoading } = useAllShops();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);
  const [shopBooksOpen, setShopBooksOpen] = useState(false);

  const { data: shopBooks = [] } = useShopBooksAdmin(selectedShopId || '');
  const updateShop = useUpdateShop();
  const updateShopBookAvailability = useUpdateShopBookAvailability();

  const filteredShops = shops.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.phone_number.includes(searchQuery)
  );

  const handleViewBooks = (shopId: string) => {
    setSelectedShopId(shopId);
    setShopBooksOpen(true);
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
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search shops by name or phone..."
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Shop Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Active</TableHead>
                <TableHead>Verified</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredShops.map((shop) => (
                <TableRow key={shop.id}>
                  <TableCell className="font-medium">{shop.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Phone className="h-3 w-3" />
                      {shop.phone_number}
                    </div>
                    {shop.address && (
                      <div className="text-xs text-muted-foreground truncate max-w-[150px]">
                        {shop.address}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                      <span>{shop.rating_average?.toFixed(1) || '0.0'}</span>
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
                    <Switch
                      checked={shop.is_active}
                      onCheckedChange={(checked) => handleToggleShopActive(shop.id, checked)}
                    />
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={shop.is_verified}
                      onCheckedChange={(checked) => handleToggleShopVerified(shop.id, checked)}
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewBooks(shop.id)}
                    >
                      <BookOpen className="h-4 w-4 mr-1" />
                      Books
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Shop Books Dialog */}
      <Dialog open={shopBooksOpen} onOpenChange={setShopBooksOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Shop's Books</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {shopBooks.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No books listed by this shop
              </p>
            ) : (
              shopBooks.map((book) => (
                <Card key={book.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex gap-3">
                        <div className="h-16 w-16 rounded-lg overflow-hidden bg-muted shrink-0">
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
                        <div>
                          <h4 className="font-semibold">{book.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            by {book.author}
                          </p>
                          <p className="text-sm font-medium text-primary">
                            ৳{book.price.toLocaleString()}
                          </p>
                          <Badge
                            variant={book.is_available ? 'success' : 'secondary'}
                          >
                            {book.is_available ? 'Available' : 'Unavailable'}
                          </Badge>
                        </div>
                      </div>
                      <div>
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
    </div>
  );
};

export default AdminShopsTab;