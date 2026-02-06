import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AddressSelector } from '@/components/address/AddressSelector';
import { OrderStatusTracker } from '@/components/orders/OrderStatusTracker';
import { useCreateDemand, useMyDemands } from '@/hooks/useBookDemands';
import { toast } from 'sonner';
import { z } from 'zod';
import { BookMarked, Plus, Clock } from 'lucide-react';
 import { PhotoUpload } from '@/components/ui/photo-upload';

const demandSchema = z.object({
  book_name: z.string().min(1, 'Book name is required').max(200),
  author_name: z.string().max(100).optional(),
});

const BookDemandPage = () => {
  const navigate = useNavigate();
  const createDemand = useCreateDemand();
  const { data: myDemands = [], isLoading } = useMyDemands();

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

    // Combine thana and detail_address
    const fullAddress = address.thana 
      ? (address.detail_address ? `Thana: ${address.thana}, ${address.detail_address}` : `Thana: ${address.thana}`)
      : address.detail_address;

    try {
      await createDemand.mutateAsync({
        book_name: formData.book_name.trim(),
        author_name: formData.author_name.trim() || undefined,
        division_id: address.division_id || undefined,
        district_id: address.district_id || undefined,
        detail_address: fullAddress || undefined,
      });
      toast.success('Book demand submitted successfully!');
      setShowForm(false);
       setFormData({ book_name: '', author_name: '', photo_url: '' });
      setAddress({ division_id: '', district_id: '', thana: '', detail_address: '' });
    } catch (error) {
      toast.error('Failed to submit demand. Please try again.');
    }
  };

  return (
    <Layout>
      <div className="container py-6 max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Demand For A Book
            </h1>
            <p className="text-muted-foreground">
              Request books you need and we'll deliver them to you
            </p>
          </div>
          {!showForm && (
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4" />
              New Request
            </Button>
          )}
        </div>

        {showForm && (
          <Card className="mb-6 shadow-card">
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
              <form onSubmit={handleSubmit} className="space-y-6">
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
        )}

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Your Requests
          </h2>

          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="h-5 bg-muted rounded w-1/2 mb-2" />
                    <div className="h-4 bg-muted rounded w-1/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : myDemands.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <BookMarked className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No requests yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {myDemands.map((demand) => (
                <Card key={demand.id}>
                  <CardContent className="p-4 space-y-4">
                    <div>
                      <h3 className="font-semibold text-foreground">{demand.book_name}</h3>
                      {demand.author_name && (
                        <p className="text-sm text-muted-foreground">by {demand.author_name}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(demand.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    
                    {/* Visual Status Tracker */}
                    <div className="pt-2">
                      <OrderStatusTracker status={demand.status} type="demand" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default BookDemandPage;
