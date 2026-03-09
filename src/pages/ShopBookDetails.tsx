import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { useShopBook, useCreateShopOrder } from '@/hooks/useShops';
import { AddressSelector } from '@/components/address/AddressSelector';
import { ArrowLeft, BookOpen, Store, ShoppingCart, Phone, MessageCircle, AlertCircle, Package } from 'lucide-react';
import { toast } from 'sonner';

const conditionLabels = {
  new: 'New',
  good: 'Good',
  worn: 'Worn',
};

const ShopBookDetailsSkeleton = () => (
  <Layout>
    <div className="container py-6 max-w-4xl">
      <Skeleton className="h-9 w-24 mb-6" />
      <div className="grid md:grid-cols-2 gap-8">
        <Skeleton className="aspect-square rounded-xl" />
        <div className="space-y-5">
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-9 w-3/4" />
            <Skeleton className="h-5 w-1/2" />
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="h-9 w-28" />
            <Skeleton className="h-7 w-24 rounded-full" />
          </div>
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>
      </div>
    </div>
  </Layout>
);

const ShopBookDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: book, isLoading, isError } = useShopBook(id || '');
  const createOrder = useCreateShopOrder();

  const [showOrderForm, setShowOrderForm] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [customerNotes, setCustomerNotes] = useState('');
  const [address, setAddress] = useState({
    division_id: '',
    district_id: '',
    thana: '',
    detail_address: '',
  });

  const handleOrder = async () => {
    if (!book) return;

    if (!address.division_id || !address.district_id || !address.thana) {
      toast.error('Please fill Division, District and Thana');
      return;
    }

    const fullAddress = address.thana
      ? address.detail_address
        ? `Thana: ${address.thana}, ${address.detail_address}`
        : `Thana: ${address.thana}`
      : address.detail_address;

    try {
      await createOrder.mutateAsync({
        shop_id: book.shop_id,
        shop_book_id: book.id,
        quantity,
        total_price: book.price * quantity,
        division_id: address.division_id || undefined,
        district_id: address.district_id || undefined,
        detail_address: fullAddress || undefined,
        customer_notes: customerNotes || undefined,
      });
      toast.success('Order placed successfully!');
      navigate('/my-orders');
    } catch {
      toast.error('Failed to place order. Please try again.');
    }
  };

  const formatPhoneNumber = (phoneNumber: string) => {
    const phone = phoneNumber.replace(/\D/g, '');
    return phone.startsWith('880') ? phone : `880${phone.replace(/^0/, '')}`;
  };

  const handleWhatsAppClick = () => {
    if (!book?.shop) return;
    const number = book.shop.whatsapp_number || book.shop.phone_number;
    if (!number) return;
    const message = encodeURIComponent(
      `Hi, I'm interested in "${book.title}" from Boi Rajjo. Is it available?`
    );
    window.open(`https://wa.me/${formatPhoneNumber(number)}?text=${message}`, '_blank');
  };

  const handleCallClick = () => {
    if (!book?.shop?.phone_number) return;
    window.open(`tel:${book.shop.phone_number}`, '_self');
  };

  if (isLoading) return <ShopBookDetailsSkeleton />;

  if (isError || !book) {
    return (
      <Layout>
        <div className="container py-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">Book Not Found</h2>
          <p className="text-muted-foreground mb-6">This book listing may no longer be available.</p>
          <Button variant="outline" onClick={() => navigate(-1)}>← Go Back</Button>
        </div>
      </Layout>
    );
  }

  const totalPrice = book.price * quantity;

  return (
    <Layout>
      <div className="container py-6 max-w-4xl">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Book Image */}
          <div className="aspect-square overflow-hidden rounded-2xl bg-muted shadow-card">
            {book.photo_url ? (
              <img
                src={book.photo_url}
                alt={book.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <BookOpen className="h-24 w-24 text-muted-foreground/40" />
              </div>
            )}
          </div>

          {/* Book Info */}
          <div className="space-y-5">
            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="text-sm">
                {book.book_condition_type === 'new' ? 'New Book' : 'Old Book'}
              </Badge>
              <Badge variant="outline" className="text-sm">
                Condition: {conditionLabels[book.condition]}
              </Badge>
            </div>

            {/* Title & Author */}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground leading-tight">{book.title}</h1>
              <p className="text-muted-foreground mt-1">by {book.author}</p>
            </div>

            {/* Price & Stock */}
            <div className="flex items-center gap-4">
              <span className="text-3xl font-bold text-primary">
                ৳{book.price.toLocaleString()}
              </span>
              {book.stock > 0 ? (
                <Badge variant="success" className="gap-1">
                  <Package className="h-3 w-3" />
                  In Stock ({book.stock})
                </Badge>
              ) : (
                <Badge variant="destructive">Out of Stock</Badge>
              )}
            </div>

            {/* Shop Info */}
            {book.shop && (
              <Card className="border-border/60">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    {book.shop.logo_url ? (
                      <img src={book.shop.logo_url} alt={book.shop.name} className="h-10 w-10 rounded-lg object-cover" />
                    ) : (
                      <div className="bg-primary/10 rounded-lg p-2">
                        <Store className="h-5 w-5 text-primary" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-foreground">{book.shop.name}</h3>
                      {book.shop.address && (
                        <p className="text-xs text-muted-foreground">{book.shop.address}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="whatsapp" size="sm" onClick={handleWhatsAppClick} className="gap-2 flex-1 sm:flex-none">
                      <MessageCircle className="h-4 w-4" />
                      WhatsApp
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleCallClick} className="gap-2 flex-1 sm:flex-none">
                      <Phone className="h-4 w-4" />
                      Call
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Order CTA */}
            {book.stock > 0 && !showOrderForm && (
              <Button size="lg" className="w-full gap-2 text-base" onClick={() => setShowOrderForm(true)}>
                <ShoppingCart className="h-5 w-5" />
                Order Now
              </Button>
            )}

            {/* Order Form */}
            {showOrderForm && (
              <Card className="border-primary/20 shadow-card">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Place Order</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Quantity</Label>
                    <div className="flex items-center gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-9 w-9"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      >
                        −
                      </Button>
                      <Input
                        type="number"
                        min={1}
                        max={book.stock}
                        value={quantity}
                        onChange={(e) => setQuantity(Math.min(book.stock, Math.max(1, parseInt(e.target.value) || 1)))}
                        className="text-center w-20"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-9 w-9"
                        onClick={() => setQuantity(Math.min(book.stock, quantity + 1))}
                      >
                        +
                      </Button>
                    </div>
                    <p className="text-sm font-medium text-primary">
                      Total: ৳{totalPrice.toLocaleString()}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Delivery Address</Label>
                    <AddressSelector value={address} onChange={setAddress} />
                  </div>

                  <div className="space-y-2">
                    <Label>Notes (Optional)</Label>
                    <Textarea
                      placeholder="Any special instructions for the shop..."
                      value={customerNotes}
                      onChange={(e) => setCustomerNotes(e.target.value)}
                      rows={2}
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1" onClick={() => setShowOrderForm(false)}>
                      Cancel
                    </Button>
                    <Button
                      className="flex-1 gap-2"
                      onClick={handleOrder}
                      disabled={createOrder.isPending}
                    >
                      {createOrder.isPending ? 'Placing...' : 'Confirm Order'}
                    </Button>
                  </div>

                  <p className="text-xs text-muted-foreground text-center">
                    Payment on delivery — the shop will contact you to confirm.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ShopBookDetailsPage;
