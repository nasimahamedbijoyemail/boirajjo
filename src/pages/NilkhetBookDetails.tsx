import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useBook } from '@/hooks/useBooks';
import { useCreateOrder } from '@/hooks/useOrders';
import { AddressSelector } from '@/components/address/AddressSelector';
import { ArrowLeft, BookOpen, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';

const conditionLabels = {
  new: 'New',
  good: 'Good',
  worn: 'Worn',
};

const NilkhetBookDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: book, isLoading } = useBook(id || '');
  const createOrder = useCreateOrder();

  const [showOrderForm, setShowOrderForm] = useState(false);
  const [address, setAddress] = useState({
    division_id: '',
    district_id: '',
    thana_id: '',
    ward_id: '',
    detail_address: '',
  });

  const handleOrder = async () => {
    if (!book) return;

    if (!address.division_id || !address.district_id) {
      toast.error('Please select at least Division and District');
      return;
    }

    try {
      await createOrder.mutateAsync({
        book_id: book.id,
        total_price: book.price,
        division_id: address.division_id || undefined,
        district_id: address.district_id || undefined,
        thana_id: address.thana_id || undefined,
        ward_id: address.ward_id || undefined,
        detail_address: address.detail_address || undefined,
      });
      toast.success('Order placed successfully!');
      navigate('/my-orders');
    } catch (error) {
      toast.error('Failed to place order. Please try again.');
    }
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
              <Badge variant="secondary" className="mb-2">Nilkhet</Badge>
              <h1 className="text-3xl font-bold text-foreground">{book.title}</h1>
              <p className="text-lg text-muted-foreground">by {book.author}</p>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-3xl font-bold text-primary">
                ৳{book.price.toLocaleString()}
              </span>
              <Badge variant="outline">{conditionLabels[book.condition]}</Badge>
            </div>

            {!showOrderForm ? (
              <Button size="lg" className="w-full" onClick={() => setShowOrderForm(true)}>
                <ShoppingCart className="h-5 w-5 mr-2" />
                Order Now (Cash on Delivery)
              </Button>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Delivery Address</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <AddressSelector value={address} onChange={setAddress} />
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setShowOrderForm(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleOrder} disabled={createOrder.isPending}>
                      {createOrder.isPending ? 'Placing Order...' : 'Confirm Order'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <p className="text-sm text-muted-foreground">
              * Payment will be collected upon delivery
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default NilkhetBookDetailsPage;
