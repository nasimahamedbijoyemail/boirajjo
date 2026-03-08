import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Eye, EyeOff, Mail, CheckCircle } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { z } from 'zod';
import { Separator } from '@/components/ui/separator';


const getPasswordStrength = (password: string): { score: number; label: string; color: string } => {
  if (!password) return { score: 0, label: '', color: '' };
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score: 20, label: 'Weak', color: 'bg-destructive' };
  if (score === 2) return { score: 40, label: 'Fair', color: 'bg-warning' };
  if (score === 3) return { score: 60, label: 'Good', color: 'bg-yellow-500' };
  if (score === 4) return { score: 80, label: 'Strong', color: 'bg-primary' };
  return { score: 100, label: 'Very Strong', color: 'bg-success' };
};

const passwordSchema = z.object({
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const ChangePasswordForm = () => {
  const { user } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = passwordSchema.safeParse({ newPassword, confirmPassword });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setShowConfirmDialog(true);
  };

  const handleConfirmUpdate = async () => {
    setShowConfirmDialog(false);
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Password updated successfully!');
      setNewPassword('');
      setConfirmPassword('');
    }
    setLoading(false);
  };

  const handleSendResetLink = async () => {
    if (!user?.email) {
      toast.error('No email associated with your account');
      return;
    }
    setResetLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      toast.error(error.message);
    } else {
      setResetSent(true);
      toast.success('Reset link sent to your email!');
    }
    setResetLoading(false);
  };

  return (
    <Card className="border-0 shadow-card">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Lock className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Change Password</CardTitle>
        </div>
        <CardDescription>Update your password directly or request a reset link via email</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Direct password change */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNew ? 'text' : 'password'}
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => { setNewPassword(e.target.value); setErrors((p) => ({ ...p, newPassword: '' })); }}
                className={errors.newPassword ? 'border-destructive pr-10' : 'pr-10'}
              />
              <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {newPassword && (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Password strength</span>
                  <span className={`text-xs font-medium ${
                    getPasswordStrength(newPassword).score <= 20 ? 'text-destructive' :
                    getPasswordStrength(newPassword).score <= 40 ? 'text-warning' :
                    getPasswordStrength(newPassword).score <= 60 ? 'text-yellow-500' :
                    'text-primary'
                  }`}>{getPasswordStrength(newPassword).label}</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${getPasswordStrength(newPassword).color}`}
                    style={{ width: `${getPasswordStrength(newPassword).score}%` }}
                  />
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
                  {[
                    { test: /.{6,}/, label: '6+ chars' },
                    { test: /[A-Z]/, label: 'Uppercase' },
                    { test: /[0-9]/, label: 'Number' },
                    { test: /[^A-Za-z0-9]/, label: 'Special char' },
                  ].map(({ test, label }) => (
                    <span
                      key={label}
                      className={`text-[11px] transition-colors ${
                        test.test(newPassword) ? 'text-primary font-medium' : 'text-muted-foreground'
                      }`}
                    >
                      {test.test(newPassword) ? '✓' : '○'} {label}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {errors.newPassword && <p className="text-sm text-destructive">{errors.newPassword}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setErrors((p) => ({ ...p, confirmPassword: '' })); }}
                className={errors.confirmPassword ? 'border-destructive pr-10' : 'pr-10'}
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
          </div>
          <Button type="submit" disabled={loading} className="w-full rounded-xl">
            {loading ? 'Updating…' : 'Update Password'}
          </Button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <Separator className="flex-1" />
          <span className="text-xs text-muted-foreground font-medium">OR</span>
          <Separator className="flex-1" />
        </div>

        {/* Forgot password / reset via email */}
        <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
          <div className="flex items-start gap-3">
            <Mail className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
            <div className="space-y-1">
              <p className="text-sm font-medium">Forgot your current password?</p>
              <p className="text-xs text-muted-foreground">
                We'll send a password reset link to <span className="font-medium text-foreground">{user?.email}</span>
              </p>
            </div>
          </div>
          {resetSent ? (
            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
              <CheckCircle className="h-4 w-4" />
              Reset link sent! Check your inbox.
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSendResetLink}
              disabled={resetLoading}
              className="w-full rounded-xl"
            >
              {resetLoading ? 'Sending…' : 'Send Reset Link'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
