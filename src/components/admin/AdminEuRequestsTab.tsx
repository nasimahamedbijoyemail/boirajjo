import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useAllEuProductRequests, useUpdateEuProductRequest } from '@/hooks/useEuProducts';
import { CheckCircle2, XCircle, Clock, MapPin, Download } from 'lucide-react';
import { useState } from 'react';

const statusColors: Record<string, string> = {
  pending: 'bg-warning/10 text-warning',
  approved: 'bg-success/10 text-success',
  rejected: 'bg-destructive/10 text-destructive',
  sourced: 'bg-category-eu/10 text-category-eu',
};

const AdminEuRequestsTab = () => {
  const { data: requests = [], isLoading } = useAllEuProductRequests();
  const updateRequest = useUpdateEuProductRequest();
  const [notes, setNotes] = useState<Record<string, string>>({});

  const handleStatusUpdate = (id: string, status: string) => {
    updateRequest.mutate({ id, status, admin_notes: notes[id] || undefined });
  };

  if (isLoading) {
    return <div className="space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">EU Product Requests ({requests.length})</h2>

      {requests.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground">No requests yet</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <Card key={req.id} className="shadow-card">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-sm text-foreground">{req.title}</h3>
                    {req.author_name && <p className="text-xs text-muted-foreground">{req.author_name}</p>}
                    {req.description && <p className="text-xs text-muted-foreground mt-1">{req.description}</p>}
                    {req.preferred_city && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3" /> {req.preferred_city}
                      </p>
                    )}
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {new Date(req.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge className={statusColors[req.status] || statusColors.pending}>
                    {req.status}
                  </Badge>
                </div>

                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Admin notes..."
                    value={notes[req.id] || req.admin_notes || ''}
                    onChange={(e) => setNotes(n => ({ ...n, [req.id]: e.target.value }))}
                    className="text-xs h-8"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleStatusUpdate(req.id, 'approved')} disabled={req.status === 'approved'}>
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-success" /> Approve
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleStatusUpdate(req.id, 'sourced')} disabled={req.status === 'sourced'}>
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-category-eu" /> Sourced
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleStatusUpdate(req.id, 'rejected')} disabled={req.status === 'rejected'}>
                    <XCircle className="h-3.5 w-3.5 mr-1 text-destructive" /> Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminEuRequestsTab;
