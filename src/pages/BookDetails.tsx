import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useBook } from '@/hooks/useBooks';
import { useAuth } from '@/contexts/AuthContext';
import { useContactUnlockForBook } from '@/hooks/useContactUnlock';
import { usePaymentEnabled } from '@/hooks/useAppSettings';
import { ContactUnlockDialog } from '@/components/books/ContactUnlockDialog';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, BookOpen, MapPin, MessageCircle, User, Phone, PhoneCall, Lock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { SEOHead } from '@/components/seo/SEOHead';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';

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
  const { data: unlockPayment } = useContactUnlockForBook(id || '');
  const { data: paymentEnabled } = usePaymentEnabled();
  const [imageLoaded, setImageLoaded] = useState(false);

  const { data: sellerContact } = useQuery({
    queryKey: ['seller-contact', id],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_seller_contact', { p_book_id: id! });
      if (error) throw error;
      return data as { name: string; phone_number: string | null; whatsapp_number: string | null } | null;
    },
    enabled: !!id,
  });

  const [showUnlockDialog, setShowUnlockDialog] = useState(false);

  const isOwnBook = profile?.id === book?.seller_id;
  const isContactUnlocked = !paymentEnabled || unlockPayment?.status === 'approved';
  const unlockFee = book ? (book.price >= 500 ? 20 : 10) : 10;

  const formatPhoneNumber = (phoneNumber: string) => {
    const phone = phoneNumber.replace(/\D/g, '');
    return phone.startsWith('880') ? phone : `880${phone.replace(/^0/, '')}`;
  };

  const handleWhatsAppClick = () => {
    if (!sellerContact) return;
    const whatsappNumber = sellerContact.whatsapp_number || sellerContact.phone_number;
    if (!whatsappNumber) return;
    const message = encodeURIComponent(
      `Hi, I saw your book "${book?.title}" on Boi Rajjo. Is it still available?`
    );
    const formattedPhone = formatPhoneNumber(whatsappNumber);
    window.open(`https://wa.me/${formattedPhone}?text=${message}`, '_blank');
  };

  const handleCallClick = () => {
    if (!sellerContact?.phone_number) return;
    window.open(`tel:${sellerContact.phone_number}`, '_self');
  };

  const hasWhatsApp = sellerContact?.whatsapp_number || sellerContact?.phone_number;
  const hasCall = sellerContact?.phone_number;

  if (isLoading) {
    return (
      <Layout>
        <div className="container px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
          <Skeleton className="h-8 w-24 rounded-lg" />
          <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
            <Skeleton className="aspect-[4/3] rounded-2xl" />
            <div className="space-y-4">
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
              <Skeleton className="h-9 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-12 w-40" />
              <Skeleton className="h-24 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
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
            <div className="rounded-2xl bg-muted p-6 mb-4">
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
      <SEOHead
        title={book.title}
        description={`${book.title} by ${book.author} — ৳${book.price}. Buy on Boi Rajjo campus marketplace.`}
        path={`/book/${book.id}`}
        ogImage={book.photo_url || undefined}
      />
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": book.title,
            "description": `${book.title} by ${book.author}`,
            "image": book.photo_url || undefined,
            "offers": {
              "@type": "Offer",
              "price": book.price,
              "priceCurrency": "BDT",
              "availability": book.status === 'available'
                ? "https://schema.org/InStock"
                : "https://schema.org/SoldOut",
              "itemCondition": book.condition === 'new'
                ? "https://schema.org/NewCondition"
                : "https://schema.org/UsedCondition",
            },
            "brand": { "@type": "Organization", "name": "Boi Rajjo" },
          })}
        </script>
      </Helmet>
      <div className="container px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="rounded-xl">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="grid md:grid-cols-2 gap-5 sm:gap-8">
          {/* Book Image - premium presentation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="aspect-[4/3] rounded-2xl overflow-hidden bg-muted relative shadow-card"
          >
            {book.photo_url ? (
              <>
                {!imageLoaded && (
                  <div className="absolute inset-0 bg-gradient-to-br from-muted via-muted/70 to-muted animate-pulse" />
                )}
                <img
                  src={book.photo_url}
                  alt={book.title}
                  onLoad={() => setImageLoaded(true)}
                  className={cn(
                    'h-full w-full object-cover transition-opacity duration-500',
                    imageLoaded ? 'opacity-100' : 'opacity-0'
                  )}
                />
              </>
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-secondary to-muted">
                <BookOpen className="h-20 w-20 sm:h-24 sm:w-24 text-muted-foreground/30" />
              </div>
            )}
            {book.status === 'sold' && (
              <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center">
                <Badge variant="destructive" className="text-base font-bold px-6 py-2 shadow-lg">Sold</Badge>
              </div>
            )}
          </motion.div>

          {/* Book Details */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="space-y-5"
          >
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={conditionColors[book.condition]}>
                  {conditionLabels[book.condition]}
                </Badge>
                {book.status === 'sold' && (
                  <Badge variant="destructive">Sold</Badge>
                )}
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground leading-tight">{book.title}</h1>
              <p className="text-base sm:text-lg text-muted-foreground mt-1">by {book.author}</p>
            </div>

            <div className="text-3xl sm:text-4xl font-bold text-primary tabular-nums">
              ৳{book.price.toLocaleString()}
            </div>

            {book.institution && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0" />
                <span>{book.institution.name}</span>
                {book.subcategory && (
                  <>
                    <span className="text-border">•</span>
                    <span>{book.subcategory}</span>
                  </>
                )}
              </div>
            )}

            {/* Seller Info Card */}
            {sellerContact && (
              <Card className="border-0 shadow-card overflow-hidden">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-foreground mb-3 text-sm">Seller Information</h3>
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <span className="font-medium text-foreground">{sellerContact.name}</span>
                    </div>
                    
                    {sellerContact.phone_number ? (
                      <>
                        <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                            <Phone className="h-4 w-4" />
                          </div>
                          <span>{sellerContact.phone_number}</span>
                        </div>
                        {sellerContact.whatsapp_number && (
                          <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                            <div className="h-8 w-8 rounded-full bg-success/10 flex items-center justify-center shrink-0">
                              <MessageCircle className="h-4 w-4 text-success" />
                            </div>
                            <span>{sellerContact.whatsapp_number}</span>
                          </div>
                        )}
                      </>
                    ) : paymentEnabled ? (
                      <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                        <div className="h-8 w-8 rounded-full bg-warning/10 flex items-center justify-center shrink-0">
                          <Lock className="h-4 w-4 text-warning" />
                        </div>
                        <span>Contact hidden — Pay ৳{unlockFee} to unlock</span>
                      </div>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons - sticky on mobile */}
            {book.status === 'available' && !isOwnBook && (
              <div className="sticky bottom-20 md:static z-10">
                {isContactUnlocked ? (
                  <div className="flex flex-col sm:flex-row gap-3">
                    {hasWhatsApp && (
                      <Button
                        variant="whatsapp"
                        size="lg"
                        className="flex-1 rounded-xl"
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
                        className="flex-1 rounded-xl border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                        onClick={handleCallClick}
                      >
                        <PhoneCall className="h-5 w-5" />
                        Call Seller
                      </Button>
                    )}
                  </div>
                ) : paymentEnabled ? (
                  <div className="space-y-3">
                    <Button
                      size="lg"
                      className="w-full rounded-xl"
                      onClick={() => setShowUnlockDialog(true)}
                    >
                      <Lock className="h-5 w-5 mr-2" />
                      Unlock Contact (৳{unlockFee})
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      Pay via bKash to view seller's contact details
                    </p>
                  </div>
                ) : null}
              </div>
            )}

            {isOwnBook && (
              <Button
                variant="outline"
                size="lg"
                className="w-full rounded-xl"
                onClick={() => navigate('/my-listings')}
              >
                Manage Listings
              </Button>
            )}
          </motion.div>
        </div>
      </div>

      {book && (
        <ContactUnlockDialog
          open={showUnlockDialog}
          onOpenChange={setShowUnlockDialog}
          bookId={book.id}
          bookTitle={book.title}
          bookPrice={book.price}
          sellerPhone={sellerContact?.phone_number || undefined}
          sellerWhatsapp={sellerContact?.whatsapp_number || undefined}
          sellerName={sellerContact?.name}
        />
      )}
    </Layout>
  );
};

export default BookDetailsPage;
