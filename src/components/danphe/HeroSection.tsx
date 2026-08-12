'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ArrowRight, Building2, Users, Shield } from 'lucide-react';

const slides = [
  {
    headline: 'All-In-One Solutions for Hospital Information Management',
    subtext: 'Trusted by Top Hospitals. Used in 53+ Hospitals and growing',
  },
  {
    headline: 'Efficient, Reliable and Affordable',
    subtext: 'Transforming healthcare information management with complete Health Care Solutions.',
  },
];

const stats = [
  { icon: Building2, value: '53+', label: 'Hospitals' },
  { icon: Users, value: '9', label: 'Modules' },
  { icon: Shield, value: '100%', label: 'Secure' },
];

export default function HeroSection() {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  const slide = slides[current];

  return (
    <section
      className="relative overflow-hidden bg-gradient-to-br from-danphe-primary via-danphe-dark to-danphe-primary"
      aria-label="Hero"
    >
      {/* Animated background pattern */}
      <div className="pointer-events-none absolute inset-0">
        {/* Decorative gradient blur circles */}
        <div className="absolute -top-24 -left-24 h-72 w-72 animate-pulse rounded-full bg-danphe-accent/15 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 animate-pulse rounded-full bg-danphe-primary-light/15 blur-3xl" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/3 right-1/4 h-64 w-64 animate-pulse rounded-full bg-white/5 blur-2xl" style={{ animationDelay: '2s' }} />
        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="relative mx-auto flex min-h-[520px] max-w-7xl flex-col items-center justify-center px-4 py-20 sm:min-h-[580px] lg:min-h-[640px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="flex flex-col items-center text-center"
          >
            {/* Accent line above heading */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-6 h-1 w-16 origin-center rounded-full bg-danphe-accent"
            />
            <h1 className="mb-4 max-w-4xl text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl">
              {slide.headline}
            </h1>
            <p className="mb-8 max-w-2xl text-base text-white/80 sm:text-lg md:text-xl">
              {slide.subtext}
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
              <Button
                size="lg"
                className="bg-danphe-accent text-white shadow-lg shadow-danphe-accent/25 transition-all hover:bg-danphe-accent-light hover:shadow-xl hover:shadow-danphe-accent/30"
                asChild
              >
                <a
                  href="https://danphehealth.com/contact"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {current === 0 ? 'Schedule a Demo' : 'Schedule a demo'}
                </a>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 bg-white/5 text-white backdrop-blur-sm transition-all hover:bg-white/15 hover:text-white"
                asChild
              >
                <a
                  href="https://danphehealth.com/solutions"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Learn More
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-14 grid w-full max-w-lg grid-cols-3 gap-4 sm:mt-16 sm:gap-8"
        >
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-1">
              <stat.icon className="h-5 w-5 text-danphe-accent-light" />
              <span className="text-2xl font-bold text-white sm:text-3xl">{stat.value}</span>
              <span className="text-xs text-white/60 sm:text-sm">{stat.label}</span>
            </div>
          ))}
        </motion.div>

        {/* Navigation dots */}
        <div className="mt-10 flex gap-2" role="tablist" aria-label="Slide navigation">
          {slides.map((_, idx) => (
            <button
              key={idx}
              role="tab"
              aria-selected={idx === current}
              aria-label={`Slide ${idx + 1}`}
              onClick={() => setCurrent(idx)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                idx === current
                  ? 'w-8 bg-danphe-accent'
                  : 'w-2.5 bg-white/40 hover:bg-white/60'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 w-full leading-[0]">
        <svg
          className="w-full"
          preserveAspectRatio="none"
          viewBox="0 0 1440 80"
          style={{ height: '50px' }}
        >
          <path
            d="M0,40 C360,0 720,0 1080,40 C1260,60 1380,60 1440,40 L0,40 Z"
            fill="white"
          />
        </svg>
      </div>
    </section>
  );
}
