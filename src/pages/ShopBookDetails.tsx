import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useShopBook, useCreateShopOrder } from '@/hooks/useShops';
import { AddressSelector } from '@/components/address/AddressSelector';
import { ArrowLeft, BookOpen, Store, ShoppingCart, Phone, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

const conditionLabels = {
  new: 'New',
  good: 'Good',
  worn: 'Worn',
};

const ShopBookDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: book, isLoading } = useShopBook(id || '');
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

    // Combine thana and detail_address into detail_address field
    const fullAddress = address.thana 
      ? (address.detail_address ? `Thana: ${address.thana}, ${address.detail_address}` : `Thana: ${address.thana}`)
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

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-32" />
            <div className="h-64 bg-muted rounded" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!book) {
    return (
      <Layout>
        <div className="container py-6 text-center">
          <p className="text-muted-foreground">Book not found</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-6 max-w-4xl">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="aspect-square overflow-hidden rounded-xl bg-muted">
            {book.photo_url ? (
              <img
                src={book.photo_url}
                alt={book.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <BookOpen className="h-24 w-24 text-muted-foreground/50" />
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">{book.book_condition_type === 'new' ? 'New Book' : 'Old Book'}</Badge>
                <Badge variant="outline">{conditionLabels[book.condition]}</Badge>
              </div>
              <h1 className="text-3xl font-bold text-foreground">{book.title}</h1>
              <p className="text-lg text-muted-foreground">by {book.author}</p>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-3xl font-bold text-primary">
                ৳{book.price.toLocaleString()}
              </span>
              {book.stock > 0 ? (
                <Badge variant="success">In Stock ({book.stock})</Badge>
              ) : (
                <Badge variant="destructive">Out of Stock</Badge>
              )}
            </div>

            {/* Shop Info */}
            {book.shop && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 rounded-lg p-2">
                      <Store className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{book.shop.name}</h3>
                      <p className="text-sm text-muted-foreground">{book.shop.address}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button variant="whatsapp" size="sm" onClick={handleWhatsAppClick}>
                      <MessageCircle className="h-4 w-4" />
                      WhatsApp
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleCallClick}>
                      <Phone className="h-4 w-4" />
                      Call
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Order Section */}
            {book.stock > 0 && !showOrderForm && (
              <Button size="lg" className="w-full" onClick={() => setShowOrderForm(true)}>
                <ShoppingCart className="h-5 w-5 mr-2" />
                Order Now
              </Button>
            )}

            {showOrderForm && (
              <Card>
                <CardHeader>
                  <CardTitle>Place Order</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      min={1}
                      max={book.stock}
                      value={quantity}
                      onChange={(e) => setQuantity(Math.min(book.stock, Math.max(1, parseInt(e.target.value) || 1)))}
                    />
                    <p className="text-sm text-muted-foreground">
                      Total: ৳{(book.price * quantity).toLocaleString()}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Delivery Address</Label>
                    <AddressSelector 
                      value={address}
                      onChange={setAddress}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Notes (Optional)</Label>
                    <Textarea
                      placeholder="Any special instructions..."
                      value={customerNotes}
                      onChange={(e) => setCustomerNotes(e.target.value)}
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setShowOrderForm(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleOrder} disabled={createOrder.isPending}>
                      {createOrder.isPending ? 'Placing Order...' : 'Confirm Order'}
                    </Button>
                  </div>

                  <p className="text-sm text-muted-foreground text-center">
                    * The shop will handle delivery. Payment on delivery.
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
