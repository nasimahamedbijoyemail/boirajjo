import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AuthFormFieldProps {
  id: string;
  label: string;
  type?: string;
  placeholder: string;
  value: string;
  error?: string;
  hint?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  rightLabel?: React.ReactNode;
}

export const AuthFormField = ({
  id,
  label,
  type = 'text',
  placeholder,
  value,
  error,
  hint,
  onChange,
  rightLabel,
}: AuthFormFieldProps) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <Label htmlFor={id}>{label}</Label>
      {rightLabel}
    </div>
    <Input
      id={id}
      name={id}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={error ? 'border-destructive' : ''}
    />
    {error && <p className="text-sm text-destructive">{error}</p>}
    {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
  </div>
);
