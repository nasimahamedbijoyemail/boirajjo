import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Store, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { z } from 'zod';

const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  shopName: z.string().min(2, 'Shop name is required'),
  phoneNumber: z.string().min(10, 'Valid phone number is required'),
  whatsappNumber: z.string().optional(),
  address: z.string().min(5, 'Address is required'),
  description: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const ShopAuthPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Login form state
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });

  // Signup form state
  const [signupData, setSignupData] = useState({
    email: '',
    password: '',
    shopName: '',
    phoneNumber: '',
    whatsappNumber: '',
    address: '',
    description: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = loginSchema.safeParse(loginData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      });

      if (authError) throw authError;

      // Check if this user has a shop
      const { data: shop, error: shopError } = await supabase
        .from('shops')
        .select('id')
        .eq('user_id', authData.user.id)
        .maybeSingle();

      if (shopError) throw shopError;

      if (!shop) {
        await supabase.auth.signOut();
        toast.error('No shop found for this account. Please sign up first.');
        return;
      }

      toast.success('Logged in successfully!');
      navigate('/shop/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = signupSchema.safeParse(signupData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/shop/dashboard`,
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Failed to create account');

      // Create profile first (required for RLS)
      const { error: profileError } = await supabase.from('profiles').insert({
        user_id: authData.user.id,
        name: signupData.shopName,
        phone_number: signupData.phoneNumber,
        whatsapp_number: signupData.whatsappNumber || null,
      });

      if (profileError) throw profileError;

      // Create shop
      const { error: shopError } = await supabase.from('shops').insert({
        user_id: authData.user.id,
        name: signupData.shopName,
        phone_number: signupData.phoneNumber,
        whatsapp_number: signupData.whatsappNumber || null,
        address: signupData.address,
        description: signupData.description || null,
      });

      if (shopError) throw shopError;

      toast.success('Shop registered! Please check your email to verify your account.');
      setActiveTab('login');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create shop');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-hero flex flex-col">
      <div className="container px-4 py-8">
        <Button variant="ghost" onClick={() => navigate('/')} className="mb-8">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>

        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="gradient-primary rounded-lg p-3">
              <Store className="h-8 w-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Nilkhet Shop Portal</h1>
              <p className="text-muted-foreground text-sm">Manage your book shop</p>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'login' | 'signup')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Register Shop</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>Shop Login</CardTitle>
                  <CardDescription>Login to manage your shop</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="shop@example.com"
                        value={loginData.email}
                        onChange={(e) => setLoginData((prev) => ({ ...prev, email: e.target.value }))}
                        className={errors.email ? 'border-destructive' : ''}
                      />
                      {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <div className="relative">
                        <Input
                          id="login-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={loginData.password}
                          onChange={(e) => setLoginData((prev) => ({ ...prev, password: e.target.value }))}
                          className={errors.password ? 'border-destructive' : ''}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? 'Logging in...' : 'Login'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="signup">
              <Card>
                <CardHeader>
                  <CardTitle>Register Your Shop</CardTitle>
                  <CardDescription>Create a new shop account for Nilkhet</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="shop-name">Shop Name *</Label>
                      <Input
                        id="shop-name"
                        placeholder="Your shop name"
                        value={signupData.shopName}
                        onChange={(e) => setSignupData((prev) => ({ ...prev, shopName: e.target.value }))}
                        className={errors.shopName ? 'border-destructive' : ''}
                      />
                      {errors.shopName && <p className="text-sm text-destructive">{errors.shopName}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email *</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="shop@example.com"
                        value={signupData.email}
                        onChange={(e) => setSignupData((prev) => ({ ...prev, email: e.target.value }))}
                        className={errors.email ? 'border-destructive' : ''}
                      />
                      {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password *</Label>
                      <div className="relative">
                        <Input
                          id="signup-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="At least 6 characters"
                          value={signupData.password}
                          onChange={(e) => setSignupData((prev) => ({ ...prev, password: e.target.value }))}
                          className={errors.password ? 'border-destructive' : ''}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                          id="phone"
                          placeholder="01XXXXXXXXX"
                          value={signupData.phoneNumber}
                          onChange={(e) => setSignupData((prev) => ({ ...prev, phoneNumber: e.target.value }))}
                          className={errors.phoneNumber ? 'border-destructive' : ''}
                        />
                        {errors.phoneNumber && <p className="text-sm text-destructive">{errors.phoneNumber}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="whatsapp">WhatsApp (Optional)</Label>
                        <Input
                          id="whatsapp"
                          placeholder="01XXXXXXXXX"
                          value={signupData.whatsappNumber}
                          onChange={(e) => setSignupData((prev) => ({ ...prev, whatsappNumber: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Shop Address in Nilkhet *</Label>
                      <Input
                        id="address"
                        placeholder="e.g., Shop #15, Nilkhet Book Market"
                        value={signupData.address}
                        onChange={(e) => setSignupData((prev) => ({ ...prev, address: e.target.value }))}
                        className={errors.address ? 'border-destructive' : ''}
                      />
                      {errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Shop Description (Optional)</Label>
                      <Input
                        id="description"
                        placeholder="Brief description of your shop"
                        value={signupData.description}
                        onChange={(e) => setSignupData((prev) => ({ ...prev, description: e.target.value }))}
                      />
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? 'Registering...' : 'Register Shop'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ShopAuthPage;
