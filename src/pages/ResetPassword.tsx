import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, CheckCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import { SEOHead } from '@/components/seo/SEOHead';

const passwordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  // Detect if request came from shop portal
  const fromShop = new URLSearchParams(window.location.search).get('from') === 'shop';
  const successRedirect = fromShop ? '/shop/dashboard' : '/home';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if user arrived via a recovery link (Supabase sets session automatically)
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Also check URL hash for recovery type
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const type = hashParams.get('type');
      
      if (session || type === 'recovery') {
        setIsValidSession(true);
      } else {
        setIsValidSession(false);
      }
    };

    // Listen for auth events - PASSWORD_RECOVERY event fires when user clicks reset link
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsValidSession(true);
      }
    });

    checkSession();

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = passwordSchema.safeParse({ password, confirmPassword });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      toast.error(error.message);
    } else {
      setSuccess(true);
      toast.success('Password updated successfully!');
      setTimeout(() => navigate(successRedirect), 2500);
    }
    setLoading(false);
  };

  if (isValidSession === null) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <div className="animate-pulse-soft">
          <BookOpen className="h-12 w-12 text-primary" />
        </div>
      </div>
    );
  }

  if (isValidSession === false) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
        <SEOHead title="Reset Password" path="/reset-password" />
        <Card className="w-full max-w-md animate-fade-in-up shadow-card text-center">
          <CardHeader>
            <div className="mx-auto mb-4 bg-destructive/10 rounded-xl p-3 w-fit">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-2xl">Invalid or Expired Link</CardTitle>
            <CardDescription>
              This password reset link is invalid or has expired. Please request a new one.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" size="lg" onClick={() => navigate(fromShop ? '/shop' : '/auth')}>
              {fromShop ? 'Back to Shop Portal' : 'Back to Sign In'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
        <SEOHead title="Password Updated" path="/reset-password" />
        <Card className="w-full max-w-md animate-fade-in-up shadow-card text-center">
          <CardHeader>
            <div className="mx-auto mb-4 bg-success/10 rounded-xl p-3 w-fit">
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
            <CardTitle className="text-2xl">Password Updated!</CardTitle>
            <CardDescription>
              Your password has been reset successfully. Redirecting you now...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      <SEOHead title="Reset Password" path="/reset-password" />
      <Card className="w-full max-w-md animate-fade-in-up shadow-card">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 gradient-primary rounded-xl p-3 w-fit">
            <BookOpen className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">Set New Password</CardTitle>
          <CardDescription>
            Enter your new password below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: '' })); }}
                className={errors.password ? 'border-destructive' : ''}
              />
              {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setErrors((p) => ({ ...p, confirmPassword: '' })); }}
                className={errors.confirmPassword ? 'border-destructive' : ''}
              />
              {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? 'Updating...' : 'Update Password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPasswordPage;
