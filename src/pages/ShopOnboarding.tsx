import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, CreditCard, Package, Check, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { SEOHead } from '@/components/seo/SEOHead';

type ShopType = 'bookstore' | 'library' | 'individual_seller';

interface ShopData {
  name: string;
  shopType: ShopType;
  description: string;
  address: string;
  phoneNumber: string;
  whatsappNumber: string;
  paymentMethod: string;
  bkashNumber: string;
}

const ShopOnboarding = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [shopData, setShopData] = useState<ShopData>({
    name: '',
    shopType: 'individual_seller',
    description: '',
    address: '',
    phoneNumber: '',
    whatsappNumber: '',
    paymentMethod: 'bkash',
    bkashNumber: '',
  });

  const { user } = useAuth();
  const navigate = useNavigate();
  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  const handleChange = (field: keyof ShopData, value: string) => {
    setShopData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Please sign in first');
      return;
    }

    setLoading(true);
    try {
      // Create shop record (shop_type may not be in auto-generated types yet)
      const { error: shopError } = await supabase.from('shops').insert({
        user_id: user.id,
        name: shopData.name,
        description: shopData.description || null,
        address: shopData.address || null,
        phone_number: shopData.phoneNumber,
        whatsapp_number: shopData.whatsappNumber || null,
      } as any);

      if (shopError) throw shopError;

      toast.success('Shop setup complete! Welcome to Boirajjo.');
      navigate('/shop/dashboard');
    } catch (error: any) {
      console.error('Shop onboarding error:', error);
      toast.error(error.message || 'Failed to complete shop setup');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    {
      number: 1,
      title: 'Business Details',
      icon: Building2,
      description: 'Tell us about your shop',
    },
    {
      number: 2,
      title: 'Payment Information',
      icon: CreditCard,
      description: 'Setup payment methods',
    },
    {
      number: 3,
      title: 'Ready to Sell',
      icon: Package,
      description: 'Start managing inventory',
    },
  ];

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Shop Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Campus Book Corner"
                value={shopData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="shopType">Shop Type *</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { value: 'bookstore', label: 'Bookstore', desc: 'Physical store selling books' },
                  { value: 'library', label: 'Library', desc: 'Lending or rental service' },
                  { value: 'individual_seller', label: 'Individual Seller', desc: 'Personal book sales' },
                ].map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => handleChange('shopType', type.value as ShopType)}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      shopData.shopType === type.value
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="font-semibold">{type.label}</div>
                    <div className="text-sm text-muted-foreground mt-1">{type.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of your shop and what you offer..."
                value={shopData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Shop Address</Label>
              <Input
                id="address"
                placeholder="Full address of your shop"
                value={shopData.address}
                onChange={(e) => handleChange('address', e.target.value)}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Contact Number *</Label>
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="01XXXXXXXXX"
                value={shopData.phoneNumber}
                onChange={(e) => handleChange('phoneNumber', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsappNumber">WhatsApp Number (Optional)</Label>
              <Input
                id="whatsappNumber"
                type="tel"
                placeholder="01XXXXXXXXX (if different)"
                value={shopData.whatsappNumber}
                onChange={(e) => handleChange('whatsappNumber', e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Leave empty if same as contact number</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bkashNumber">bKash Number for Payments</Label>
              <Input
                id="bkashNumber"
                type="tel"
                placeholder="01XXXXXXXXX"
                value={shopData.bkashNumber}
                onChange={(e) => handleChange('bkashNumber', e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Customers will use this for payments</p>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                💡 <strong>Tip:</strong> You can update payment information anytime from your shop settings.
              </p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6 text-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Check className="w-10 h-10 text-primary" />
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2">All Set!</h3>
              <p className="text-muted-foreground">Your shop is ready to go. Start adding books to your inventory.</p>
            </div>

            <Card className="text-left">
              <CardHeader>
                <CardTitle className="text-lg">Quick Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shop Name:</span>
                  <span className="font-medium">{shopData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <span className="font-medium capitalize">{shopData.shopType.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Contact:</span>
                  <span className="font-medium">{shopData.phoneNumber}</span>
                </div>
              </CardContent>
            </Card>

            <div className="p-4 bg-primary/5 rounded-lg">
              <p className="text-sm">
                🎉 Welcome to the Boirajjo marketplace! You can now manage orders, add inventory, and connect with
                students.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return shopData.name.trim().length > 0;
      case 2:
        return shopData.phoneNumber.trim().length > 0;
      case 3:
        return true;
      default:
        return false;
    }
  };

  return (
    <>
      <SEOHead
        title="Shop Onboarding - Boirajjo"
        description="Complete your shop setup to start selling on Boirajjo"
      />
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <CardTitle className="text-2xl">Shop Setup</CardTitle>
              <span className="text-sm text-muted-foreground">
                Step {step} of {totalSteps}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between mt-6">
              {steps.map((s) => {
                const Icon = s.icon;
                const isCompleted = step > s.number;
                const isCurrent = step === s.number;
                return (
                  <div key={s.number} className="flex flex-col items-center flex-1">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all ${
                        isCompleted
                          ? 'bg-primary text-primary-foreground'
                          : isCurrent
                          ? 'bg-primary/20 text-primary border-2 border-primary'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                    </div>
                    <div className="text-xs font-medium text-center hidden md:block">{s.title}</div>
                  </div>
                );
              })}
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderStepContent()}
              </motion.div>
            </AnimatePresence>

            <div className="flex gap-3 pt-4">
              {step > 1 && (
                <Button type="button" variant="outline" onClick={handleBack} className="flex-1">
                  Back
                </Button>
              )}
              {step < totalSteps ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={!isStepValid()}
                  className="flex-1"
                >
                  Continue
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading || !isStepValid()}
                  className="flex-1"
                >
                  {loading ? 'Setting up...' : 'Complete Setup'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default ShopOnboarding;
