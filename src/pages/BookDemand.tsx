import { useState, useCallback } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AddressSelector } from '@/components/address/AddressSelector';
import { OrderStatusTracker } from '@/components/orders/OrderStatusTracker';
import { useCreateDemand, useMyDemands } from '@/hooks/useBookDemands';
import { toast } from 'sonner';
import { z } from 'zod';
import { BookMarked, Plus, Clock, ImageIcon } from 'lucide-react';
import { PhotoUpload } from '@/components/ui/photo-upload';
import { SEOHead } from '@/components/seo/SEOHead';
import { useQueryClient } from '@tanstack/react-query';
import { PullToRefresh } from '@/components/ui/pull-to-refresh';
import { motion, AnimatePresence } from 'framer-motion';

const demandSchema = z.object({
  book_name: z.string().min(1, 'Book name is required').max(200),
  author_name: z.string().max(100).optional(),
});

const statusColors: Record<string, string> = {
  requested: 'bg-warning/10 text-warning',
  processing: 'bg-primary/10 text-primary',
  out_for_delivery: 'bg-accent/10 text-accent',
  delivered: 'bg-success/10 text-success',
  cancelled: 'bg-destructive/10 text-destructive',
};

const statusLabels: Record<string, string> = {
  requested: 'Requested',
  processing: 'Processing',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

const BookDemandPage = () => {
  const queryClient = useQueryClient();
  const createDemand = useCreateDemand();
  const { data: myDemands = [], isLoading } = useMyDemands();

  const handleRefresh = useCallback(() => {
    return queryClient.invalidateQueries({ queryKey: ['my-demands'] });
  }, [queryClient]);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    book_name: '',
    author_name: '',
    photo_url: '',
  });
  const [address, setAddress] = useState({
    division_id: '',
    district_id: '',
    thana: '',
    detail_address: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = demandSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    if (!address.division_id || !address.district_id || !address.thana) {
      toast.error('Please fill Division, District and Thana');
      return;
    }

    const fullAddress = address.thana 
      ? (address.detail_address ? `Thana: ${address.thana}, ${address.detail_address}` : `Thana: ${address.thana}`)
      : address.detail_address;

    try {
      await createDemand.mutateAsync({
        book_name: formData.book_name.trim(),
        author_name: formData.author_name.trim() || undefined,
        photo_url: formData.photo_url || undefined,
        division_id: address.division_id || undefined,
        district_id: address.district_id || undefined,
        detail_address: fullAddress || undefined,
      });
      toast.success('Book demand submitted successfully!');
      setShowForm(false);
      setFormData({ book_name: '', author_name: '', photo_url: '' });
      setAddress({ division_id: '', district_id: '', thana: '', detail_address: '' });
    } catch {
      toast.error('Failed to submit demand. Please try again.');
    }
  };

  return (
    <Layout>
      <SEOHead title="Book Demand" description="Request any book you need and get it delivered to your doorstep." path="/book-demand" />
      <PullToRefresh onRefresh={handleRefresh}>
      <div className="container py-6 max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Demand For A Book
            </h1>
            <p className="text-sm text-muted-foreground">
              Request books you need and we'll deliver them to you
            </p>
          </div>
          {!showForm && (
            <Button onClick={() => setShowForm(true)} className="shrink-0">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New Request</span>
              <span className="sm:hidden">New</span>
            </Button>
          )}
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <Card className="mb-6 shadow-card border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookMarked className="h-5 w-5 text-primary" />
                    Request a Book
                  </CardTitle>
                  <CardDescription>
                    Fill in the book details and your delivery address
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="book_name">Book Name *</Label>
                        <Input
                          id="book_name"
                          placeholder="Enter book name"
                          value={formData.book_name}
                          onChange={(e) => {
                            setFormData((prev) => ({ ...prev, book_name: e.target.value }));
                            setErrors((prev) => ({ ...prev, book_name: '' }));
                          }}
                          className={errors.book_name ? 'border-destructive' : ''}
                        />
                        {errors.book_name && <p className="text-sm text-destructive">{errors.book_name}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="author_name">Author Name (Optional)</Label>
                        <Input
                          id="author_name"
                          placeholder="Enter author name"
                          value={formData.author_name}
                          onChange={(e) => setFormData((prev) => ({ ...prev, author_name: e.target.value }))}
                        />
                      </div>
                       
                      <div className="space-y-2">
                        <Label>Book Photo (Optional)</Label>
                        <PhotoUpload 
                          value={formData.photo_url} 
                          onChange={(url) => setFormData((prev) => ({ ...prev, photo_url: url }))}
                          folder="demands"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Delivery Address *</Label>
                      <AddressSelector value={address} onChange={setAddress} />
                    </div>

                    <div className="flex gap-3">
                      <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={createDemand.isPending}>
                        {createDemand.isPending ? 'Submitting...' : 'Submit Request'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            Your Requests
            {myDemands.length > 0 && (
              <Badge variant="secondary" className="text-xs">{myDemands.length}</Badge>
            )}
          </h2>

          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse border-0 shadow-card">
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <div className="h-16 w-16 bg-muted rounded-lg shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-5 bg-muted rounded w-1/2" />
                        <div className="h-4 bg-muted rounded w-1/3" />
                        <div className="h-3 bg-muted rounded w-1/4" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : myDemands.length === 0 ? (
            <Card className="border-0 shadow-card">
              <CardContent className="p-8 sm:p-12 text-center">
                <div className="rounded-full bg-muted p-5 w-fit mx-auto mb-4">
                  <BookMarked className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">No requests yet</h3>
                <p className="text-sm text-muted-foreground">
                  Tap "New Request" to demand a book
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {myDemands.map((demand, index) => (
                <motion.div
                  key={demand.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.25 }}
                >
                  <Card className="border-0 shadow-card overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex gap-3">
                        {/* Demand photo thumbnail */}
                        {demand.photo_url ? (
                          <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-lg overflow-hidden bg-muted shrink-0">
                            <img
                              src={demand.photo_url}
                              alt={demand.book_name}
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                          </div>
                        ) : (
                          <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-lg bg-muted/60 flex items-center justify-center shrink-0">
                            <ImageIcon className="h-6 w-6 text-muted-foreground/40" />
                          </div>
                        )}

                        <div className="flex-1 min-w-0 space-y-1.5">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <h3 className="font-semibold text-foreground text-sm sm:text-base line-clamp-1">
                                {demand.book_name}
                              </h3>
                              {demand.author_name && (
                                <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1">
                                  by {demand.author_name}
                                </p>
                              )}
                            </div>
                            <Badge className={`shrink-0 text-[10px] sm:text-xs border-0 ${statusColors[demand.status] || ''}`}>
                              {statusLabels[demand.status] || demand.status}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                            {demand.demand_number && (
                              <span className="font-mono">{demand.demand_number}</span>
                            )}
                            <span>•</span>
                            <span>{new Date(demand.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Compact status tracker */}
                      <div className="mt-3 pt-3 border-t border-border/50">
                        <OrderStatusTracker status={demand.status} type="demand" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
      </PullToRefresh>
    </Layout>
  );
};

export default BookDemandPage;
