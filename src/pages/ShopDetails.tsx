import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useShop, useShopBooks, useShopRatings, useCreateShopRating } from '@/hooks/useShops';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Store, Star, MapPin, Phone, MessageCircle, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

const ShopDetailsPage = () => {
  const { id } = useParams();
  const { user, profile } = useAuth();
  const { data: shop, isLoading: shopLoading } = useShop(id || '');
  const { data: books = [], isLoading: booksLoading } = useShopBooks(id);
  const { data: ratings = [] } = useShopRatings(id || '');
  const createRating = useCreateShopRating();

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');

  const hasReviewed = ratings.some((r) => r.user_id === user?.id);

  const handleSubmitReview = async () => {
    if (!shop) return;

    try {
      await createRating.mutateAsync({
        shop_id: shop.id,
        rating: reviewRating,
        review: reviewText || undefined,
      });
      toast.success('Review submitted!');
      setReviewText('');
    } catch {
      toast.error('Failed to submit review');
    }
  };

  const formatPhoneNumber = (phoneNumber: string) => {
    const phone = phoneNumber.replace(/\D/g, '');
    return phone.startsWith('880') ? phone : `880${phone.replace(/^0/, '')}`;
  };

  const handleWhatsAppClick = () => {
    if (!shop) return;
    const number = shop.whatsapp_number || shop.phone_number;
    if (!number) return;
    const message = encodeURIComponent(`Hi, I found your shop on Boi Rajjo.`);
    window.open(`https://wa.me/${formatPhoneNumber(number)}?text=${message}`, '_blank');
  };

  if (shopLoading) {
    return (
      <Layout>
        <div className="container py-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-32" />
            <div className="h-40 bg-muted rounded" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!shop) {
    return (
      <Layout>
        <div className="container py-6 text-center">
          <p className="text-muted-foreground">Shop not found</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-6">
        <Link to="/nilkhet">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Nilkhet
          </Button>
        </Link>

        {/* Shop Header */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-start gap-4">
              <div className="bg-primary/10 rounded-xl p-4 flex-shrink-0">
                <Store className="h-12 w-12 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-2xl font-bold text-foreground">{shop.name}</h1>
                  {shop.is_verified && <Badge variant="success">Verified</Badge>}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                  <span className="font-medium">{shop.rating_average.toFixed(1)}</span>
                  <span>({shop.rating_count} reviews)</span>
                </div>
                {shop.description && (
                  <p className="text-muted-foreground mb-3">{shop.description}</p>
                )}
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  {shop.address && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {shop.address}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    {shop.phone_number}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="whatsapp" onClick={handleWhatsAppClick}>
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </Button>
                <Button variant="outline" onClick={() => window.open(`tel:${shop.phone_number}`, '_self')}>
                  <Phone className="h-4 w-4" />
                  Call
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="books">
          <TabsList className="mb-4">
            <TabsTrigger value="books">Books ({books.length})</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({ratings.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="books">
            {booksLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="aspect-[3/4] bg-muted" />
                  </Card>
                ))}
              </div>
            ) : books.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No books available</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {books.map((book) => (
                  <Link key={book.id} to={`/nilkhet/book/${book.id}`}>
                    <Card className="group overflow-hidden hover:shadow-card-hover transition-all">
                      <div className="aspect-[3/4] bg-muted overflow-hidden">
                        {book.photo_url ? (
                          <img
                            src={book.photo_url}
                            alt={book.title}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <BookOpen className="h-12 w-12 text-muted-foreground/50" />
                          </div>
                        )}
                      </div>
                      <CardContent className="p-3">
                        <h3 className="font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                          {book.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          by {book.author}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-lg font-bold text-primary">
                            ৳{book.price.toLocaleString()}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {book.book_condition_type === 'new' ? 'New' : 'Old'}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="reviews">
            {/* Submit Review */}
            {user && profile && !hasReviewed && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Write a Review</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Rating:</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className="focus:outline-none"
                        >
                          <Star
                            className={`h-6 w-6 ${
                              star <= reviewRating
                                ? 'fill-yellow-500 text-yellow-500'
                                : 'text-muted-foreground'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <Textarea
                    placeholder="Share your experience with this shop (optional)"
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                  />
                  <Button onClick={handleSubmitReview} disabled={createRating.isPending}>
                    {createRating.isPending ? 'Submitting...' : 'Submit Review'}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Reviews List */}
            {ratings.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No reviews yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {ratings.map((rating) => (
                  <Card key={rating.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{rating.profile?.name || 'Anonymous'}</p>
                          <div className="flex items-center gap-1 mt-1">
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
                        <span className="text-xs text-muted-foreground">
                          {new Date(rating.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {rating.review && (
                        <p className="text-muted-foreground mt-2">{rating.review}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default ShopDetailsPage;
