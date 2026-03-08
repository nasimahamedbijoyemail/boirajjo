import { Button } from '@/components/ui/button';
import { AuthFormField } from './AuthFormField';

interface SignInFormProps {
  formData: { email: string; password: string };
  errors: Record<string, string>;
  loading: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onForgotPassword: () => void;
}

export const SignInForm = ({ formData, errors, loading, onChange, onSubmit, onForgotPassword }: SignInFormProps) => (
  <form onSubmit={onSubmit} className="space-y-4">
    <AuthFormField
      id="email"
      label="Email"
      type="email"
      placeholder="you@example.com"
      value={formData.email}
      error={errors.email}
      onChange={onChange}
    />
    <AuthFormField
      id="password"
      label="Password"
      type="password"
      placeholder="••••••••"
      value={formData.password}
      error={errors.password}
      onChange={onChange}
      rightLabel={
        <button type="button" onClick={onForgotPassword} className="text-xs text-primary hover:underline">
          Forgot Password?
        </button>
      }
    />
    <Button type="submit" className="w-full" size="lg" disabled={loading}>
      {loading ? 'Signing in…' : 'Sign In'}
    </Button>
  </form>
);
