'use client';

import { useState, useRef } from 'react';
import { Mail, CheckCircle } from 'lucide-react';
import { motion, useInView } from 'framer-motion';

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
      className="relative overflow-hidden mesh-gradient-hero dot-pattern py-20 md:py-24"
      aria-label="Subscribe"
    >
      {/* Floating decorative circles */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 right-1/4 h-80 w-80 rounded-full bg-danphe-accent/10 blur-3xl" />
        <div className="absolute -bottom-20 left-1/4 h-96 w-96 rounded-full bg-danphe-primary-light/10 blur-3xl" />
        <div className="absolute top-1/2 right-0 h-64 w-64 -translate-y-1/2 rounded-full bg-danphe-accent/5 blur-2xl" />
      </div>

      <div className="relative mx-auto max-w-3xl px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-heading mb-4 text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
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
              <CheckCircle className="h-12 w-12 text-danphe-accent-light" />
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
                <Mail className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-white/40" />
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  aria-label="Email address"
                  className="h-12 w-full rounded-xl border border-white/20 bg-white/10 pl-11 pr-4 text-sm text-white outline-none backdrop-blur-sm transition-all placeholder:text-white/40 focus-visible:ring-2 focus-visible:ring-white/30"
                />
              </div>
              <button
                type="submit"
                className="h-12 rounded-xl bg-white px-6 text-sm font-semibold text-danphe-primary shadow-lg transition-all hover:bg-white/90 hover:shadow-xl"
              >
                Subscribe
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}
