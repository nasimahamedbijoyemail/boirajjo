import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CreditCard, 
  CheckCircle, 
  XCircle,
  RefreshCw
} from 'lucide-react';
import { useAllContactUnlocks, useUpdateContactUnlockStatus, useApproveRefund } from '@/hooks/useContactUnlock';
import { toast } from 'sonner';

const AdminPaymentsTab = () => {
  const { data: payments = [], isLoading } = useAllContactUnlocks();
  const updateStatus = useUpdateContactUnlockStatus();
  const approveRefund = useApproveRefund();

  const pendingPayments = payments.filter((p) => p.status === 'pending');
  const refundRequests = payments.filter((p) => p.refund_requested && p.refund_approved === null);

  const handleApprove = async (paymentId: string) => {
    try {
      await updateStatus.mutateAsync({ id: paymentId, status: 'approved' });
      toast.success('Payment approved');
    } catch {
      toast.error('Failed to approve payment');
    }
  };

  const handleReject = async (paymentId: string) => {
    try {
      await updateStatus.mutateAsync({ id: paymentId, status: 'rejected' });
      toast.success('Payment rejected');
    } catch {
      toast.error('Failed to reject payment');
    }
  };

  const handleApproveRefund = async (paymentId: string, approved: boolean) => {
    try {
      await approveRefund.mutateAsync({ id: paymentId, approved });
      toast.success(approved ? 'Refund approved' : 'Refund denied');
    } catch {
      toast.error('Failed to process refund');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="animate-pulse text-center">Loading payments...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pending Payments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Pending Contact Unlock Payments ({pendingPayments.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {pendingPayments.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No pending payments
            </p>
          ) : (
            pendingPayments.map((payment) => (
              <Card key={payment.id} className="border-dashed">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="font-semibold">{payment.book?.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        by {payment.book?.author}
                      </p>
                      <div className="mt-2 space-y-1 text-sm">
                        <p>
                          <span className="text-muted-foreground">Customer:</span>{' '}
                          {payment.profile?.name}
                        </p>
                        <p>
                          <span className="text-muted-foreground">Phone:</span>{' '}
                          {payment.profile?.phone_number}
                        </p>
                        <p>
                          <span className="text-muted-foreground">bKash Number:</span>{' '}
                          <span className="font-mono">{payment.bkash_number}</span>
                        </p>
                        <p>
                          <span className="text-muted-foreground">Transaction ID:</span>{' '}
                          <span className="font-mono">{payment.transaction_number}</span>
                        </p>
                        <p>
                          <span className="text-muted-foreground">Amount:</span>{' '}
                          <span className="font-bold text-primary">৳{payment.amount}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleApprove(payment.id)}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleReject(payment.id)}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>

      {/* Refund Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Refund Requests ({refundRequests.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {refundRequests.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No pending refund requests
            </p>
          ) : (
            refundRequests.map((payment) => (
              <Card key={payment.id} className="border-dashed border-secondary">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{payment.book?.title}</h4>
                        <Badge variant="secondary">Refund Requested</Badge>
                      </div>
                      <div className="mt-2 space-y-1 text-sm">
                        <p>
                          <span className="text-muted-foreground">Customer:</span>{' '}
                          {payment.profile?.name}
                        </p>
                        <p>
                          <span className="text-muted-foreground">Phone:</span>{' '}
                          {payment.profile?.phone_number}
                        </p>
                        <p>
                          <span className="text-muted-foreground">bKash Number:</span>{' '}
                          <span className="font-mono">{payment.bkash_number}</span>
                        </p>
                        <p>
                          <span className="text-muted-foreground">Amount to Refund:</span>{' '}
                          <span className="font-bold text-primary">৳{payment.amount}</span>
                        </p>
                        <p>
                          <span className="text-muted-foreground">Requested on:</span>{' '}
                          {new Date(payment.refund_requested_at || '').toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleApproveRefund(payment.id, true)}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve Refund
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleApproveRefund(payment.id, false)}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Deny Refund
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>

      {/* All Payments History */}
      <Card>
        <CardHeader>
          <CardTitle>All Payments History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {payments.slice(0, 20).map((payment) => (
            <div key={payment.id} className="flex items-center justify-between py-2 border-b last:border-0">
              <div>
                <p className="font-medium">{payment.book?.title}</p>
                <p className="text-sm text-muted-foreground">
                  {payment.profile?.name} • {payment.transaction_number}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold">৳{payment.amount}</span>
                {payment.status === 'approved' ? (
                  <Badge variant="success">Approved</Badge>
                ) : payment.status === 'rejected' ? (
                  <Badge variant="destructive">Rejected</Badge>
                ) : (
                  <Badge variant="outline">Pending</Badge>
                )}
                {payment.refund_approved === true && (
                  <Badge variant="secondary">Refunded</Badge>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPaymentsTab;