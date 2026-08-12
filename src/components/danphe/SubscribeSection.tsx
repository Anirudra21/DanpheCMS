'use client';

import { useState, useRef } from 'react';
import { Mail, CheckCircle, Sparkles } from 'lucide-react';
import { motion, useInView, AnimatePresence } from 'framer-motion';

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
      className="relative overflow-x-hidden mesh-gradient-hero dot-pattern py-24 md:py-32"
      aria-label="Subscribe"
    >
      {/* Floating decorative circles */}
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          className="absolute -top-20 right-1/4 h-80 w-80 rounded-full bg-danphe-accent/10 blur-3xl"
          animate={{ y: [0, -15, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-20 left-1/4 h-96 w-96 rounded-full bg-danphe-primary-light/10 blur-3xl"
          animate={{ y: [0, 12, 0], scale: [1, 1.03, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
        <motion.div
          className="absolute top-1/2 right-0 h-64 w-64 -translate-y-1/2 rounded-full bg-danphe-accent/5 blur-2xl"
          animate={{ x: [0, 10, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-3xl px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          {/* Icon badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 backdrop-blur-sm"
          >
            <Sparkles className="h-4 w-4 text-danphe-accent-light" />
            <span className="text-sm font-medium text-white/70">Transform Your Healthcare Operations</span>
          </motion.div>

          <h2 className="font-heading mb-4 text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
            Subscribe for a Transformative Demo of Our Cutting-Edge Solutions!
          </h2>
          <p className="mb-8 max-w-2xl mx-auto text-base text-white/80 sm:text-lg">
            Subscribe now for a personalized demo and unlock the future with innovative solutions tailored to enhance efficiency and elevate your overall experience.
          </p>

          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="flex flex-col items-center gap-3 text-white"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                >
                  <CheckCircle className="h-14 w-14 text-danphe-accent-light" />
                </motion.div>
                <p className="text-lg font-medium">Thank you for subscribing!</p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="text-sm text-white/70 underline transition-colors hover:text-white"
                >
                  Subscribe another email
                </button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
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
                    className="h-12 w-full rounded-xl border border-white/20 bg-white/10 pl-11 pr-4 text-sm text-white outline-none backdrop-blur-sm transition-all duration-300 placeholder:text-white/40 focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:bg-white/15"
                  />
                </div>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="h-12 rounded-xl bg-white px-8 text-sm font-semibold text-danphe-primary shadow-lg transition-all duration-300 hover:bg-white/90 hover:shadow-xl"
                >
                  Subscribe
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
