import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useBook } from '@/hooks/useBooks';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, BookOpen, MapPin, MessageCircle, User, Phone, PhoneCall } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const conditionLabels = {
  new: 'New',
  good: 'Good',
  worn: 'Worn',
};

const conditionColors = {
  new: 'success',
  good: 'secondary',
  worn: 'warning',
} as const;

const BookDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { data: book, isLoading, error } = useBook(id || '');

  const formatPhoneNumber = (phoneNumber: string) => {
    const phone = phoneNumber.replace(/\D/g, '');
    // Add Bangladesh country code if not present
    return phone.startsWith('880') ? phone : `880${phone.replace(/^0/, '')}`;
  };

  const handleWhatsAppClick = () => {
    if (!book?.seller) return;
    
    // Use whatsapp_number if available, otherwise fall back to phone_number
    const whatsappNumber = book.seller.whatsapp_number || book.seller.phone_number;
    if (!whatsappNumber) return;
    
    const message = encodeURIComponent(
      `Hi, I saw your book "${book.title}" on Boi Rajjo. Is it still available?`
    );
    const formattedPhone = formatPhoneNumber(whatsappNumber);
    window.open(`https://wa.me/${formattedPhone}?text=${message}`, '_blank');
  };

  const handleCallClick = () => {
    if (!book?.seller?.phone_number) return;
    window.open(`tel:${book.seller.phone_number}`, '_self');
  };

  const isOwnBook = profile?.id === book?.seller_id;

  // Check if WhatsApp is available (either whatsapp_number or phone_number)
  const hasWhatsApp = book?.seller?.whatsapp_number || book?.seller?.phone_number;
  const hasCall = book?.seller?.phone_number;

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-6 space-y-6">
          <Skeleton className="h-8 w-32" />
          <div className="grid md:grid-cols-2 gap-8">
            <Skeleton className="aspect-[4/3] rounded-xl" />
            <div className="space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !book) {
    return (
      <Layout>
        <div className="container py-6">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-muted p-6 mb-4">
              <BookOpen className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Book Not Found</h3>
            <p className="text-muted-foreground">
              This book may have been removed or sold.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-6 space-y-6">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Browse
        </Button>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Book Image */}
          <div className="aspect-[4/3] rounded-xl overflow-hidden bg-muted">
            {book.photo_url ? (
              <img
                src={book.photo_url}
                alt={book.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-secondary to-muted">
                <BookOpen className="h-24 w-24 text-muted-foreground/50" />
              </div>
            )}
          </div>

          {/* Book Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={conditionColors[book.condition]}>
                  {conditionLabels[book.condition]}
                </Badge>
                {book.status === 'sold' && (
                  <Badge variant="destructive">Sold</Badge>
                )}
              </div>
              <h1 className="text-3xl font-bold text-foreground">{book.title}</h1>
              <p className="text-lg text-muted-foreground mt-1">by {book.author}</p>
            </div>

            <div className="text-4xl font-bold text-primary">
              ৳{book.price.toLocaleString()}
            </div>

            {book.institution && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{book.institution.name}</span>
                {book.subcategory && (
                  <>
                    <span>•</span>
                    <span>{book.subcategory}</span>
                  </>
                )}
              </div>
            )}

            {/* Seller Info */}
            {book.seller && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-foreground mb-3">Seller Information</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <User className="h-4 w-4" />
                      <span>{book.seller.name}</span>
                    </div>
                    {isOwnBook && (
                      <>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="h-4 w-4" />
                          <span>Contact: {book.seller.phone_number}</span>
                        </div>
                        {book.seller.whatsapp_number && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MessageCircle className="h-4 w-4" />
                            <span>WhatsApp: {book.seller.whatsapp_number}</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            {book.status === 'available' && !isOwnBook && (
              <div className="flex flex-col sm:flex-row gap-3">
                {hasWhatsApp && (
                  <Button
                    variant="whatsapp"
                    size="lg"
                    className="flex-1"
                    onClick={handleWhatsAppClick}
                  >
                    <MessageCircle className="h-5 w-5" />
                    Chat on WhatsApp
                  </Button>
                )}
                {hasCall && (
                  <Button
                    variant="outline"
                    size="lg"
                    className="flex-1 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                    onClick={handleCallClick}
                  >
                    <PhoneCall className="h-5 w-5" />
                    Call Seller
                  </Button>
                )}
              </div>
            )}

            {isOwnBook && (
              <Button
                variant="outline"
                size="lg"
                className="w-full"
                onClick={() => navigate(`/edit-book/${book.id}`)}
              >
                Edit Listing
              </Button>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BookDetailsPage;
