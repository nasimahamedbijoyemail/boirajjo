import { Button } from '@/components/ui/button';
import { AuthFormField } from './AuthFormField';

interface SignUpFormProps {
  formData: { name: string; phone: string; whatsapp: string; email: string; password: string };
  errors: Record<string, string>;
  loading: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const SignUpForm = ({ formData, errors, loading, onChange, onSubmit }: SignUpFormProps) => (
  <form onSubmit={onSubmit} className="space-y-4">
    <AuthFormField id="name" label="Full Name" placeholder="Enter your full name" value={formData.name} error={errors.name} onChange={onChange} />
    <AuthFormField id="phone" label="Contact Number *" type="tel" placeholder="01XXXXXXXXX" value={formData.phone} error={errors.phone} onChange={onChange} />
    <AuthFormField
      id="whatsapp"
      label="WhatsApp Number (Optional)"
      type="tel"
      placeholder="01XXXXXXXXX (if different)"
      value={formData.whatsapp}
      onChange={onChange}
      hint="Leave empty if same as contact number"
    />
    <AuthFormField id="email" label="Email" type="email" placeholder="you@example.com" value={formData.email} error={errors.email} onChange={onChange} />
    <AuthFormField id="password" label="Password" type="password" placeholder="••••••••" value={formData.password} error={errors.password} onChange={onChange} />
    <Button type="submit" className="w-full" size="lg" disabled={loading}>
      {loading ? 'Creating account…' : 'Create Account'}
    </Button>
  </form>
);
