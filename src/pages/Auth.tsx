import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { BD_PHONE_REGEX } from '@/lib/validators';
import { AnimatePresence, motion } from 'framer-motion';

import { AuthLayout } from '@/components/auth/AuthLayout';
import { SignInForm } from '@/components/auth/SignInForm';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';

const signUpSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  phone: z.string().regex(BD_PHONE_REGEX, 'Enter a valid BD number (e.g. 01712345678)'),
  whatsapp: z.string().refine((val) => !val || BD_PHONE_REGEX.test(val), { message: 'Enter a valid BD number' }).optional(),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const AuthPage = () => {
  const [searchParams] = useSearchParams();
  const isSignUp = searchParams.get('mode') === 'signup';
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>(isSignUp ? 'signup' : 'signin');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', whatsapp: '', email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = (schema: z.ZodSchema, data: unknown): boolean => {
    const result = schema.safeParse(data);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return false;
    }
    return true;
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    if (!validate(forgotPasswordSchema, { email: formData.email })) { setLoading(false); return; }

    const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) toast.error(error.message);
    else { toast.success('Password reset link sent! Check your email.'); setMode('signin'); }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      if (mode === 'signup') {
        if (!validate(signUpSchema, formData)) { setLoading(false); return; }
        const { error } = await signUp(formData.email, formData.password, formData.name, formData.phone, formData.whatsapp || null);
        if (error) {
          toast.error(error.message.includes('already registered') ? 'This email is already registered. Please sign in instead.' : error.message);
          setLoading(false); return;
        }
        toast.success('Account created! Please complete your profile.');
        navigate('/onboarding');
      } else {
        if (!validate(signInSchema, formData)) { setLoading(false); return; }
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          toast.error(error.message.includes('Invalid login') ? 'Invalid email or password' : error.message);
          setLoading(false); return;
        }
        toast.success('Welcome back!');
        navigate('/home');
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  const titles = {
    signin: { title: 'Welcome Back', desc: 'Sign in to buy and sell books within your campus' },
    signup: { title: 'Create Account', desc: 'Join your campus community to trade books' },
    forgot: { title: 'Reset Password', desc: 'Enter your email to receive a password reset link' },
  };

  const modeToggle = (
    <div className="space-y-3">
      <p className="text-muted-foreground">
        {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
        <button type="button" onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')} className="text-primary hover:underline font-medium">
          {mode === 'signin' ? 'Sign up' : 'Sign in'}
        </button>
      </p>
      <p className="text-sm text-muted-foreground border-t border-border pt-3">
        Are you a shop owner?{' '}
        <button type="button" onClick={() => navigate('/shop')} className="text-primary hover:underline font-medium">
          Shop Portal →
        </button>
      </p>
    </div>
  );

  const forgotToggle = (
    <button type="button" onClick={() => setMode('signin')} className="text-primary hover:underline font-medium">
      Back to Sign In
    </button>
  );

  return (
    <AuthLayout
      title={titles[mode].title}
      description={titles[mode].desc}
      footer={mode === 'forgot' ? forgotToggle : modeToggle}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          initial={{ opacity: 0, x: mode === 'signup' ? 12 : -12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: mode === 'signup' ? -12 : 12 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          {mode === 'forgot' && (
            <ForgotPasswordForm email={formData.email} error={errors.email} loading={loading} onChange={handleChange} onSubmit={handleForgotPassword} />
          )}
          {mode === 'signin' && (
            <SignInForm formData={formData} errors={errors} loading={loading} onChange={handleChange} onSubmit={handleSubmit} onForgotPassword={() => setMode('forgot')} />
          )}
          {mode === 'signup' && (
            <SignUpForm formData={formData} errors={errors} loading={loading} onChange={handleChange} onSubmit={handleSubmit} />
          )}
        </motion.div>
      </AnimatePresence>
    </AuthLayout>
  );
};

export default AuthPage;
