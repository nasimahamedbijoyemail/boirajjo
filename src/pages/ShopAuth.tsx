import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Store, ArrowLeft, Eye, EyeOff, BookOpen } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { z } from 'zod';
import { SEOHead } from '@/components/seo/SEOHead';
import { motion } from 'framer-motion';

const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  shopName: z.string().min(2, 'Shop name is required'),
  phoneNumber: z.string().min(10, 'Valid phone number is required'),
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

  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({
    email: '',
    password: '',
    shopName: '',
    phoneNumber: '',
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
      const { data: shop } = await supabase
        .from('shops')
        .select('id')
        .eq('user_id', authData.user.id)
        .maybeSingle();

      if (!shop) {
        // Check if profile exists but no shop — redirect to shop onboarding
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', authData.user.id)
          .maybeSingle();

        if (profile) {
          toast.info('Complete your shop setup to continue.');
          navigate('/shop/onboarding');
          return;
        }

        await supabase.auth.signOut();
        toast.error('No shop account found. Please register first.');
        return;
      }

      toast.success('Welcome back!');
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
      await supabase.auth.signOut();

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/shop/onboarding`,
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Failed to create account');

      // Create minimal profile for shop owner
      const { error: profileError } = await supabase.from('profiles').insert({
        user_id: authData.user.id,
        name: signupData.shopName,
        phone_number: signupData.phoneNumber,
        institution_id: null,
        institution_type: null,
        department_id: null,
        academic_department_id: null,
      });

      if (profileError) throw profileError;

      toast.success('Account created! Complete your shop setup.');
      navigate('/shop/onboarding');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <SEOHead title="Shop Portal - Boirajjo" description="Register or login to manage your bookshop on Boirajjo" />
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex flex-col">
        <div className="container px-4 py-8">
          <Button variant="ghost" onClick={() => navigate('/')} className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <div className="max-w-md mx-auto">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center gap-3 mb-8"
            >
              <div className="bg-primary rounded-xl p-3">
                <Store className="h-8 w-8 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Shop Portal</h1>
                <p className="text-muted-foreground text-sm">Manage your book shop on Boirajjo</p>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as 'login' | 'signup'); setErrors({}); }}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="signup">Register</TabsTrigger>
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
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                          {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                        </div>

                        <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                          {isLoading ? 'Logging in…' : 'Login'}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="signup">
                  <Card>
                    <CardHeader>
                      <CardTitle>Register Your Shop</CardTitle>
                      <CardDescription>Create an account — you'll set up shop details next</CardDescription>
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
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                          {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="phone">Contact Number *</Label>
                          <Input
                            id="phone"
                            type="tel"
                            placeholder="01XXXXXXXXX"
                            value={signupData.phoneNumber}
                            onChange={(e) => setSignupData((prev) => ({ ...prev, phoneNumber: e.target.value }))}
                            className={errors.phoneNumber ? 'border-destructive' : ''}
                          />
                          {errors.phoneNumber && <p className="text-sm text-destructive">{errors.phoneNumber}</p>}
                        </div>

                        <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                          {isLoading ? 'Creating account…' : 'Create Account'}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              {/* Student link */}
              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Looking to buy or sell as a student?{' '}
                  <button
                    type="button"
                    onClick={() => navigate('/auth')}
                    className="text-primary hover:underline font-medium"
                  >
                    <BookOpen className="h-3.5 w-3.5 inline mr-1" />
                    Student Sign In
                  </button>
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ShopAuthPage;
