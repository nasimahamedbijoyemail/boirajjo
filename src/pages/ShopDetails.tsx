import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { useShop, useShopBooks, useShopRatings, useCreateShopRating } from '@/hooks/useShops';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Store, Star, MapPin, Phone, MessageCircle, BookOpen, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const ShopDetailsSkeleton = () => (
  <Layout>
    <div className="container py-6 max-w-5xl">
      <Skeleton className="h-9 w-36 mb-6" />
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-start gap-4">
            <Skeleton className="h-20 w-20 rounded-xl flex-shrink-0" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-64" />
              <div className="flex gap-2 flex-wrap">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-9 w-28 rounded-md" />
              <Skeleton className="h-9 w-20 rounded-md" />
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="aspect-[3/4]" />
            <CardContent className="p-3 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <div className="flex justify-between">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-12" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </Layout>
);

const StarRating = ({ rating, interactive = false, onChange }: { rating: number; interactive?: boolean; onChange?: (r: number) => void }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        onClick={() => interactive && onChange?.(star)}
        className={interactive ? 'focus:outline-none cursor-pointer' : 'cursor-default'}
        disabled={!interactive}
      >
        <Star
          className={`${interactive ? 'h-6 w-6' : 'h-4 w-4'} transition-colors ${
            star <= rating
              ? 'fill-warning text-warning'
              : 'text-muted-foreground'
          }`}
        />
      </button>
    ))}
  </div>
);

const ShopDetailsPage = () => {
  const { id } = useParams();
  const { user, profile } = useAuth();
  const { data: shop, isLoading: shopLoading, isError: shopError } = useShop(id || '');
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

  if (shopLoading) return <ShopDetailsSkeleton />;

  if (shopError || !shop) {
    return (
      <Layout>
        <div className="container py-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">Shop Not Found</h2>
          <p className="text-muted-foreground mb-6">This shop may no longer be available.</p>
          <Link to="/nilkhet">
            <Button variant="outline">← Back to Nilkhet</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-6 max-w-5xl">
        <Link to="/nilkhet">
          <Button variant="ghost" className="mb-6 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Nilkhet
          </Button>
        </Link>

        {/* Shop Header */}
        <Card className="mb-6 overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-start gap-5">
              {/* Logo / Icon */}
              <div className="flex-shrink-0">
                {shop.logo_url ? (
                  <img
                    src={shop.logo_url}
                    alt={shop.name}
                    className="h-20 w-20 rounded-xl object-cover shadow-card"
                  />
                ) : (
                  <div className="h-20 w-20 bg-primary/10 rounded-xl flex items-center justify-center shadow-card">
                    <Store className="h-10 w-10 text-primary" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-2xl font-bold text-foreground">{shop.name}</h1>
                  {shop.is_verified && <Badge variant="success">Verified</Badge>}
                </div>

                <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-2">
                  <StarRating rating={Math.round(shop.rating_average || 0)} />
                  <span className="font-medium text-foreground">{(shop.rating_average || 0).toFixed(1)}</span>
                  <span>({shop.rating_count || 0} reviews)</span>
                </div>

                {shop.description && (
                  <p className="text-muted-foreground mb-3 text-sm leading-relaxed">{shop.description}</p>
                )}

                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                  {shop.address && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 flex-shrink-0" />
                      {shop.address}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <Phone className="h-4 w-4 flex-shrink-0" />
                    {shop.phone_number}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 flex-shrink-0">
                <Button variant="whatsapp" onClick={handleWhatsAppClick} className="gap-2">
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </Button>
                <Button variant="outline" onClick={() => window.open(`tel:${shop.phone_number}`, '_self')} className="gap-2">
                  <Phone className="h-4 w-4" />
                  Call
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="books">
          <TabsList className="mb-6">
            <TabsTrigger value="books" className="gap-2">
              <BookOpen className="h-4 w-4" />
              Books ({books.length})
            </TabsTrigger>
            <TabsTrigger value="reviews" className="gap-2">
              <Star className="h-4 w-4" />
              Reviews ({ratings.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="books">
            {booksLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <Skeleton className="aspect-[3/4]" />
                    <CardContent className="p-3 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                      <div className="flex justify-between">
                        <Skeleton className="h-5 w-16" />
                        <Skeleton className="h-5 w-12" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : books.length === 0 ? (
              <Card>
                <CardContent className="py-16 text-center">
                  <BookOpen className="h-14 w-14 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="font-medium text-foreground mb-1">No Books Available</p>
                  <p className="text-sm text-muted-foreground">This shop hasn't listed any books yet.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {books.map((book) => (
                  <Link key={book.id} to={`/nilkhet/book/${book.id}`}>
                    <Card className="group overflow-hidden hover:shadow-card-hover transition-all duration-200 h-full">
                      <div className="aspect-[3/4] bg-muted overflow-hidden">
                        {book.photo_url ? (
                          <img
                            src={book.photo_url}
                            alt={book.title}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <BookOpen className="h-12 w-12 text-muted-foreground/40" />
                          </div>
                        )}
                      </div>
                      <CardContent className="p-3">
                        <h3 className="font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors text-sm">
                          {book.title}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                          by {book.author}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-base font-bold text-primary">
                            ৳{book.price.toLocaleString()}
                          </span>
                          <Badge variant="outline" className="text-xs h-5">
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

          <TabsContent value="reviews" className="space-y-4">
            {/* Submit Review */}
            {user && profile && !hasReviewed && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Write a Review</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-muted-foreground">Your Rating:</span>
                    <StarRating rating={reviewRating} interactive onChange={setReviewRating} />
                  </div>
                  <Textarea
                    placeholder="Share your experience with this shop (optional)"
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    rows={3}
                  />
                  <Button onClick={handleSubmitReview} disabled={createRating.isPending} className="gap-2">
                    {createRating.isPending ? 'Submitting...' : 'Submit Review'}
                  </Button>
                </CardContent>
              </Card>
            )}

            {ratings.length === 0 ? (
              <Card>
                <CardContent className="py-16 text-center">
                  <Star className="h-14 w-14 text-muted-foreground/40 mx-auto mb-4" />
                  <p className="font-medium text-foreground mb-1">No Reviews Yet</p>
                  <p className="text-sm text-muted-foreground">Be the first to leave a review!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {ratings.map((rating) => (
                  <Card key={rating.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-foreground">
                            {rating.user_id === user?.id
                              ? rating.profile?.name || 'You'
                              : rating.profile?.name || 'Verified Buyer'}
                          </p>
                          <div className="mt-1">
                            <StarRating rating={rating.rating} />
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(rating.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {rating.review && (
                        <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{rating.review}</p>
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
