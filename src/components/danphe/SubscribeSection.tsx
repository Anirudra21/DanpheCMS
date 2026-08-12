'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Mail, CheckCircle, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

export default function SubscribeSection() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
      setEmail('');
    }
  };

  return (
    <section
      ref={ref}
      className="relative overflow-hidden bg-gradient-to-r from-danphe-primary to-danphe-accent py-16 sm:py-20"
      aria-label="Subscribe"
    >
      {/* Decorative elements */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-white/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-3xl px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-4 flex items-center justify-center gap-2">
            <Sparkles className="h-6 w-6 text-white/80" />
          </div>
          <h2 className="mb-4 text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
            Subscribe for a Transformative Demo of Our Cutting-Edge Solutions!
          </h2>
          <p className="mb-8 text-base text-white/80 sm:text-lg">
            Subscribe now for a personalized demo and unlock the future with innovative solutions tailored to enhance efficiency and elevate your overall experience.
          </p>

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-3 text-white"
            >
              <CheckCircle className="h-12 w-12" />
              <p className="text-lg font-medium">Thank you for subscribing!</p>
              <button
                onClick={() => setSubmitted(false)}
                className="text-sm text-white/70 underline transition-colors hover:text-white"
              >
                Subscribe another email
              </button>
            </motion.div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row"
            >
              <div className="relative flex-1">
                <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 rounded-xl border-0 bg-white pl-10 text-gray-900 shadow-lg placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-white/50"
                  aria-label="Email address"
                />
              </div>
              <Button
                type="submit"
                className="h-12 rounded-xl bg-danphe-dark px-6 text-white shadow-lg transition-all hover:bg-danphe-dark/80 hover:shadow-xl"
              >
                Subscribe
              </Button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}
