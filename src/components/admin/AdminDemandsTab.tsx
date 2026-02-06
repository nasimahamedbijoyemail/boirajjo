import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BookMarked, Search, User, Phone, Clock, MapPin } from 'lucide-react';
import { useAllDemands, useUpdateDemandStatus } from '@/hooks/useBookDemands';
import { DEMAND_STATUS_LABELS, DemandStatus } from '@/types/database';
import { toast } from 'sonner';
import { format } from 'date-fns';

const AdminDemandsTab = () => {
  const { data: demands = [], isLoading } = useAllDemands();
  const updateDemandStatus = useUpdateDemandStatus();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDemands = useMemo(() => {
    if (!searchQuery.trim()) return demands;
    
    const query = searchQuery.toLowerCase();
    return demands.filter(demand => {
      const demandNumber = demand.demand_number?.toLowerCase() || '';
      const bookName = demand.book_name?.toLowerCase() || '';
      const authorName = demand.author_name?.toLowerCase() || '';
      const customerName = demand.profile?.name?.toLowerCase() || '';
      const customerPhone = demand.profile?.phone_number?.toLowerCase() || '';
      const status = demand.status?.toLowerCase() || '';
      
      return (
        demandNumber.includes(query) ||
        bookName.includes(query) ||
        authorName.includes(query) ||
        customerName.includes(query) ||
        customerPhone.includes(query) ||
        status.includes(query)
      );
    });
  }, [demands, searchQuery]);

  const handleDemandStatusChange = async (demandId: string, status: DemandStatus) => {
    try {
      await updateDemandStatus.mutateAsync({ id: demandId, status });
      toast.success('Demand status updated');
    } catch {
      toast.error('Failed to update demand');
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'default';
      case 'out_for_delivery':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="animate-pulse text-center">Loading demands...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookMarked className="h-5 w-5" />
          Book Demands ({demands.length})
        </CardTitle>
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by demand ID, book name, author, customer name, phone, status..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {filteredDemands.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            {searchQuery ? 'No demands match your search' : 'No book demands yet'}
          </p>
        ) : (
          filteredDemands.map((demand) => (
            <Card key={demand.id} className="border-dashed">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold">{demand.book_name}</h3>
                      {demand.author_name && (
                        <span className="text-sm text-muted-foreground">
                          by {demand.author_name}
                        </span>
                      )}
                      <Badge variant={getStatusVariant(demand.status)}>
                        {DEMAND_STATUS_LABELS[demand.status]}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div className="space-y-1">
                        <p className="text-muted-foreground">
                          <span className="font-medium text-foreground">Demand ID:</span>{' '}
                          <span className="font-mono">{demand.demand_number || demand.id.slice(0, 8)}</span>
                        </p>
                        <p className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span className="font-medium text-foreground">Time:</span>
                          {format(new Date(demand.created_at), 'PPp')}
                        </p>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="flex items-center gap-2 text-muted-foreground">
                          <User className="h-3 w-3" />
                          <span className="font-medium text-foreground">Customer:</span>
                          {demand.profile?.name}
                        </p>
                        <p className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          <span className="font-medium text-foreground">Phone:</span>
                          {demand.profile?.phone_number}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span className="font-medium text-foreground">Address:</span>
                      {demand.division?.name}, {demand.district?.name}
                      {demand.detail_address && ` - ${demand.detail_address}`}
                    </div>
                  </div>
                  
                  <Select
                    value={demand.status}
                    onValueChange={(v) => handleDemandStatusChange(demand.id, v as DemandStatus)}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="requested">Requested</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default AdminDemandsTab;