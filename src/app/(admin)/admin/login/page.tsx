'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod/v4';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/cms-utils';
import { useToast } from '@/hooks/use-toast';

const loginSchema = z.object({
  email: z.email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginForm) {
    setIsLoading(true);
    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        toast({
          title: 'Authentication failed',
          description: 'Invalid email or password. Please try again.',
          variant: 'destructive',
        });
      } else {
        router.push('/admin/dashboard');
        router.refresh();
      }
    } catch {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
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
        <Card className="border-white/10 bg-white/95 shadow-premium-lg backdrop-blur-xl">
          <CardHeader className="pb-2 text-center pt-8">
            <h1 className="text-2xl font-bold tracking-tight text-danphe-dark">
              Danphe{' '}
              <span className="text-danphe-accent">CMS</span>
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Sign in to your dashboard
            </p>
          </CardHeader>
          <CardContent className="pt-4 pb-8 px-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@danphe.com"
                  autoComplete="email"
                  className={cn(
                    'bg-white border-danphe-border focus:border-danphe-accent',
                    errors.email && 'border-red-400 focus:border-red-400'
                  )}
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className={cn(
                    'bg-white border-danphe-border focus:border-danphe-accent',
                    errors.password && 'border-red-400 focus:border-red-400'
                  )}
                  {...register('password')}
                />
                {errors.password && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-danphe-primary hover:bg-danphe-primary-light text-white font-medium mt-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign in to Dashboard'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
