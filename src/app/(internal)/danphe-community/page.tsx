'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { ArrowLeft, Bell, CheckCircle } from 'lucide-react';

export default function DanpheCommunityPage() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-lg w-full text-center"
      >
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-danphe-text-light transition-colors hover:text-danphe-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Go Back To Home
        </Link>

        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-danphe-primary/10">
          <Bell className="h-12 w-12 text-danphe-primary" />
        </div>

        <h1 className="mb-3 text-3xl font-bold text-danphe-primary sm:text-4xl">
          We will be live soon
        </h1>
        <p className="mb-8 text-danphe-text-light">
          Get notified when we launch.
        </p>

        {subscribed ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-3 rounded-2xl border border-danphe-success/30 bg-danphe-success/5 p-8"
          >
            <CheckCircle className="h-10 w-10 text-danphe-success" />
            <p className="text-danphe-primary font-medium">Thank you for subscribing!</p>
            <p className="text-sm text-danphe-text-light">We will notify you when we launch.</p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubscribe} className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-12 w-full sm:max-w-xs"
            />
            <Button type="submit" className="bg-danphe-primary hover:bg-danphe-primary-light h-12 px-8">
              Subscribe
            </Button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
