import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { SEOHead } from '@/components/seo/SEOHead';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/layout/EmptyState';
import { useCreateEuProductRequest, useEuProductRequests } from '@/hooks/useEuProducts';
import { ArrowLeft, Send, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const statusConfig: Record<string, { label: string; icon: typeof Clock; className: string }> = {
  pending: { label: 'Pending', icon: Clock, className: 'bg-warning/10 text-warning' },
  approved: { label: 'Approved', icon: CheckCircle2, className: 'bg-success/10 text-success' },
  rejected: { label: 'Rejected', icon: XCircle, className: 'bg-destructive/10 text-destructive' },
  sourced: { label: 'Sourced', icon: CheckCircle2, className: 'bg-category-eu/10 text-category-eu' },
};

const EuProductRequest = () => {
  const [title, setTitle] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [description, setDescription] = useState('');
  const [preferredCity, setPreferredCity] = useState('');

  const createRequest = useCreateEuProductRequest();
  const { data: requests = [], isLoading } = useEuProductRequests();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    createRequest.mutate(
      { title: title.trim(), author_name: authorName.trim() || undefined, description: description.trim() || undefined, preferred_city: preferredCity.trim() || undefined },
      {
        onSuccess: () => {
          setTitle('');
          setAuthorName('');
          setDescription('');
          setPreferredCity('');
        },
      }
    );
  };

  return (
    <Layout>
      <SEOHead
        title="Request a Product — Within Europe | Boi Rajjo"
        description="Can't find a book or product in our European store? Request it and we'll source it for you."
        path="/eu/request"
      />
      <div className="container py-6 max-w-2xl mx-auto">
        <Link to="/eu" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to EU Store
        </Link>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="shadow-card mb-8">
            <CardHeader>
              <CardTitle className="text-lg">Request a Product</CardTitle>
              <p className="text-sm text-muted-foreground">
                Tell us what you need and we'll try to source it within our European network.
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Book / Product Title *</label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Introduction to Algorithms"
                    required
                    maxLength={200}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Author Name</label>
                  <Input
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="e.g. Thomas H. Cormen"
                    maxLength={100}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Additional Details</label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Edition, ISBN, or any other details..."
                    maxLength={500}
                    rows={3}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Preferred City</label>
                  <Input
                    value={preferredCity}
                    onChange={(e) => setPreferredCity(e.target.value)}
                    placeholder="e.g. Barcelona, Paris, Milan"
                    maxLength={100}
                  />
                </div>
                <Button type="submit" disabled={createRequest.isPending || !title.trim()} className="w-full rounded-xl">
                  <Send className="h-4 w-4 mr-2" />
                  {createRequest.isPending ? 'Submitting...' : 'Submit Request'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* My Requests */}
        <h2 className="text-lg font-semibold text-foreground mb-4">My Requests</h2>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
          </div>
        ) : requests.length === 0 ? (
          <EmptyState type="books" title="No requests yet" description="Submit a request above to get started." />
        ) : (
          <div className="space-y-3">
            {requests.map((req) => {
              const config = statusConfig[req.status] || statusConfig.pending;
              const StatusIcon = config.icon;
              return (
                <Card key={req.id} className="shadow-card">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-sm text-foreground truncate">{req.title}</h3>
                        {req.author_name && <p className="text-xs text-muted-foreground">{req.author_name}</p>}
                        {req.preferred_city && <p className="text-xs text-muted-foreground mt-0.5">📍 {req.preferred_city}</p>}
                        {req.admin_notes && <p className="text-xs text-muted-foreground mt-1 italic">Admin: {req.admin_notes}</p>}
                      </div>
                      <Badge className={config.className}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {config.label}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default EuProductRequest;
