'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod/v4';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, ShieldCheck, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/cms-utils';

const loginSchema = z.object({
  email: z.email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginForm) {
    setAuthError('');
    setIsLoading(true);
    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setAuthError('Invalid email or password. Please try again.');
      } else {
        router.push('/admin/dashboard');
        router.refresh();
      }
    } catch {
      setAuthError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-danphe-primary to-danphe-dark overflow-hidden">
      {/* Floating blur decorations */}
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute left-[10%] top-[20%] h-72 w-72 rounded-full bg-danphe-accent/20 blur-3xl"
        />
        <motion.div
          animate={{ y: [0, 15, 0], x: [0, -15, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute bottom-[15%] right-[10%] h-96 w-96 rounded-full bg-danphe-primary-light/20 blur-3xl"
        />
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
          className="absolute right-[30%] top-[10%] h-48 w-48 rounded-full bg-danphe-accent/10 blur-2xl"
        />
      </div>

      {/* Dot pattern overlay */}
      <div className="pointer-events-none absolute inset-0 dot-pattern opacity-40" />

      {/* Login card */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md px-4"
      >
        <Card className="border-white/10 bg-white/95 shadow-2xl backdrop-blur-xl">
          <CardContent className="pt-8 pb-8 px-8">
            {/* Header */}
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-danphe-primary/10">
                <ShieldCheck className="h-7 w-7 text-danphe-accent" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-danphe-dark">
                Danphe{' '}
                <span className="text-danphe-accent">CMS</span>
              </h1>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Sign in to your dashboard
              </p>
            </div>

            {/* Auth error banner */}
            {authError && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-5 flex items-center gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                {authError}
              </motion.div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-danphe-text">
                  Email address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@danphehealth.com"
                  autoComplete="email"
                  autoFocus
                  className={cn(
                    'h-11 bg-white border-danphe-border text-danphe-text placeholder:text-muted-foreground/60 focus:border-danphe-accent focus:ring-danphe-accent/20',
                    errors.email && 'border-red-400 focus:border-red-400 focus:ring-red-400/20',
                  )}
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-danphe-text">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className={cn(
                    'h-11 bg-white border-danphe-border text-danphe-text placeholder:text-muted-foreground/60 focus:border-danphe-accent focus:ring-danphe-accent/20',
                    errors.password && 'border-red-400 focus:border-red-400 focus:ring-red-400/20',
                  )}
                  {...register('password')}
                />
                {errors.password && (
                  <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="h-11 w-full bg-danphe-primary hover:bg-danphe-primary/90 text-white font-medium mt-1 transition-colors"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in…
                  </>
                ) : (
                  'Sign in to Dashboard'
                )}
              </Button>
            </form>

            {/* Footer note */}
            <p className="mt-6 text-center text-xs text-muted-foreground">
              Admin accounts are seeded via the CLI. No public registration.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
