import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CreditCard, Loader2, Image, Upload, Trash2, ExternalLink } from 'lucide-react';
import { usePaymentEnabled, useTogglePayment, usePromoBanner, useUpdatePromoBanner } from '@/hooks/useAppSettings';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const AdminSettingsTab = () => {
  const { data: paymentEnabled, isLoading } = usePaymentEnabled();
  const togglePayment = useTogglePayment();
  const { data: promoBanner, isLoading: promoLoading } = usePromoBanner();
  const updatePromo = useUpdatePromoBanner();

  const [promoLink, setPromoLink] = useState('');
  const [promoEnabled, setPromoEnabled] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync local state with fetched data
  if (!initialized && !promoLoading && promoBanner) {
    setPromoLink(promoBanner.link);
    setPromoEnabled(promoBanner.enabled);
    setInitialized(true);
  }

  const handlePaymentToggle = async (checked: boolean) => {
    try {
      await togglePayment.mutateAsync(checked);
      toast.success(checked ? 'Payment system turned ON' : 'Payment system turned OFF');
    } catch {
      toast.error('Failed to update setting');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const fileName = `banner-${Date.now()}.${ext}`;

      // Delete old banner if exists
      if (promoBanner.imageUrl) {
        const oldPath = promoBanner.imageUrl.split('/promo/')[1];
        if (oldPath) {
          await supabase.storage.from('promo').remove([oldPath]);
        }
      }

      const { error: uploadError } = await supabase.storage
        .from('promo')
        .upload(fileName, file, { cacheControl: '3600', upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('promo')
        .getPublicUrl(fileName);

      await updatePromo.mutateAsync({
        enabled: promoEnabled,
        imageUrl: publicUrl,
        link: promoLink,
      });

      toast.success('Banner image uploaded!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload image');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = async () => {
    if (promoBanner.imageUrl) {
      const oldPath = promoBanner.imageUrl.split('/promo/')[1];
      if (oldPath) {
        await supabase.storage.from('promo').remove([oldPath]);
      }
    }

    await updatePromo.mutateAsync({
      enabled: false,
      imageUrl: '',
      link: promoLink,
    });
    setPromoEnabled(false);
    toast.success('Banner removed');
  };

  const handleSavePromo = async () => {
    try {
      await updatePromo.mutateAsync({
        enabled: promoEnabled,
        imageUrl: promoBanner.imageUrl,
        link: promoLink,
      });
      toast.success('Promo banner settings saved!');
    } catch {
      toast.error('Failed to save settings');
    }
  };

  return (
    <div className="space-y-6">
      {/* Payment System */}
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
                    onCheckedChange={handlePaymentToggle}
                    disabled={togglePayment.isPending}
                  />
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Promo Banner */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="h-5 w-5" />
            Promotional Banner
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {promoLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Enable/Disable */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="promo-toggle" className="text-base font-medium">
                    Show Banner on Home Page
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Display a promotional banner at the top of the home page
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={promoEnabled ? 'default' : 'secondary'}>
                    {promoEnabled ? 'ON' : 'OFF'}
                  </Badge>
                  <Switch
                    id="promo-toggle"
                    checked={promoEnabled}
                    onCheckedChange={setPromoEnabled}
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Banner Image</Label>
                {promoBanner.imageUrl ? (
                  <div className="relative rounded-xl overflow-hidden border bg-muted">
                    <img
                      src={promoBanner.imageUrl}
                      alt="Promo banner preview"
                      className="w-full h-auto max-h-48 object-cover"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={handleRemoveImage}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div
                    className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Click to upload banner image
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Recommended: 1200×400px, max 5MB
                    </p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                {promoBanner.imageUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4 mr-1" />
                    )}
                    Replace Image
                  </Button>
                )}
              </div>

              {/* Link URL */}
              <div className="space-y-2">
                <Label htmlFor="promo-link" className="text-sm font-medium">
                  Banner Link (where to go when clicked)
                </Label>
                <div className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0" />
                  <Input
                    id="promo-link"
                    placeholder="/browse/academic or /nilkhet or /book-demand"
                    value={promoLink}
                    onChange={(e) => setPromoLink(e.target.value)}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Use a path like <code className="bg-muted px-1 rounded">/nilkhet</code> for internal pages, or a full URL for external links.
                </p>
              </div>

              {/* Save Button */}
              <Button
                onClick={handleSavePromo}
                disabled={updatePromo.isPending}
                className="w-full sm:w-auto"
              >
                {updatePromo.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : null}
                Save Banner Settings
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettingsTab;
