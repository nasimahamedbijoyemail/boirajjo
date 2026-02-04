import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BookMarked } from 'lucide-react';
import { useAllDemands, useUpdateDemandStatus } from '@/hooks/useBookDemands';
import { DEMAND_STATUS_LABELS, DemandStatus } from '@/types/database';
import { toast } from 'sonner';

const AdminDemandsTab = () => {
  const { data: demands = [], isLoading } = useAllDemands();
  const updateDemandStatus = useUpdateDemandStatus();

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
      </CardHeader>
      <CardContent className="space-y-4">
        {demands.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No book demands yet
          </p>
        ) : (
          demands.map((demand) => (
            <Card key={demand.id} className="border-dashed">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
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
                    <p className="text-sm text-muted-foreground">
                      Demand ID: <span className="font-mono">{demand.demand_number || demand.id.slice(0, 8)}</span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Requested by: {demand.profile?.name} | {demand.profile?.phone_number}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Address: {demand.division?.name}, {demand.district?.name}
                      {demand.thana?.name && `, ${demand.thana.name}`}
                      {demand.detail_address && ` - ${demand.detail_address}`}
                    </p>
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