import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Loader2 } from 'lucide-react';
import { usePaymentEnabled, useTogglePayment } from '@/hooks/useAppSettings';
import { toast } from 'sonner';

const AdminSettingsTab = () => {
  const { data: paymentEnabled, isLoading } = usePaymentEnabled();
  const togglePayment = useTogglePayment();

  const handleToggle = async (checked: boolean) => {
    try {
      await togglePayment.mutateAsync(checked);
      toast.success(checked ? 'Payment system turned ON' : 'Payment system turned OFF');
    } catch {
      toast.error('Failed to update setting');
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment System
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="payment-toggle" className="text-base font-medium">
                Contact Unlock Payment
              </Label>
              <p className="text-sm text-muted-foreground">
                When ON, users must pay via bKash to unlock seller contact details.
                When OFF, all contacts are freely visible.
              </p>
            </div>
            <div className="flex items-center gap-3">
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Badge variant={paymentEnabled ? 'default' : 'secondary'}>
                    {paymentEnabled ? 'ON' : 'OFF'}
                  </Badge>
                  <Switch
                    id="payment-toggle"
                    checked={paymentEnabled || false}
                    onCheckedChange={handleToggle}
                    disabled={togglePayment.isPending}
                  />
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettingsTab;
