import { Button } from '@/components/ui/button';
import { AuthFormField } from './AuthFormField';

interface ForgotPasswordFormProps {
  email: string;
  error?: string;
  loading: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const ForgotPasswordForm = ({ email, error, loading, onChange, onSubmit }: ForgotPasswordFormProps) => (
  <form onSubmit={onSubmit} className="space-y-4">
    <AuthFormField
      id="email"
      label="Email"
      type="email"
      placeholder="you@example.com"
      value={email}
      error={error}
      onChange={onChange}
    />
    <Button type="submit" className="w-full" size="lg" disabled={loading}>
      {loading ? 'Sending…' : 'Send Reset Link'}
    </Button>
  </form>
);
