import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

interface AuthLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const AuthLayout = ({ title, description, children, footer }: AuthLayoutProps) => (
  <div className="min-h-screen gradient-hero flex flex-col">
    <div className="container py-4">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Link>
    </div>

    <div className="flex-1 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
        className="w-full max-w-md"
      >
        <Card className="shadow-card border-0 backdrop-blur">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4 gradient-primary rounded-xl p-3 w-fit shadow-md">
              <BookOpen className="h-7 w-7 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl">{title}</CardTitle>
            <CardDescription className="text-sm">{description}</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            {children}
            {footer && <div className="mt-6 text-center text-sm">{footer}</div>}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  </div>
);
