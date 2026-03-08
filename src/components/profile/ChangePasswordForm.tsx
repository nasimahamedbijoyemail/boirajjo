import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

const passwordSchema = z.object({
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const ChangePasswordForm = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
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

  return (
    <Card className="border-0 shadow-card">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Lock className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Change Password</CardTitle>
        </div>
        <CardDescription>Update your account password</CardDescription>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
};
