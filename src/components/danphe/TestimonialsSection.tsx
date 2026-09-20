'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Star } from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface Testimonial {
  name: string;
  quote: string;
  image: string;
}

interface TestimonialsSectionProps {
  heading: string;
  subheading: string;
  testimonials: Testimonial[];
}

const STAR_COUNT = 5;

const starVariants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: {
      delay: 0.15 + i * 0.08,
      duration: 0.35,
      ease: 'backOut' as const,
    },
  }),
};

const quoteFloat = {
  animate: {
    y: [0, -6, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut' as const,
    },
  },
};

function StarRating() {
  return (
    <div className="flex gap-1.5" aria-label={`${STAR_COUNT} out of 5 stars`}>
      {[...Array(STAR_COUNT)].map((_, i) => (
        <motion.span
          key={i}
          custom={i}
          variants={starVariants}
          initial="hidden"
          animate="visible"
        >
          <Star className="h-4.5 w-4.5 fill-danphe-star text-danphe-star drop-shadow-[0_0_6px_rgba(245,158,11,0.45)]" />
        </motion.span>
      ))}
    </div>
  );
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: 'tween', duration: 0.3 }}
      className="group h-full"
    >
      {/* Gradient border wrapper */}
      <div className="relative h-full rounded-2xl bg-gradient-to-br from-danphe-accent/30 via-danphe-primary-light/20 to-danphe-accent/10 p-[1.5px]">
        <div className="relative h-full rounded-[14px] bg-white">
          {/* Left accent bar */}
          <div className="absolute left-0 top-4 bottom-4 w-[3px] rounded-r-full bg-gradient-to-b from-danphe-accent to-danphe-primary-light" />

          {/* Animated decorative quote mark */}
          <motion.span
            className="pointer-events-none absolute -top-2 right-4 select-none font-serif text-[5rem] leading-none text-danphe-accent/[0.08] md:text-[6rem]"
            variants={quoteFloat}
            animate="animate"
            aria-hidden="true"
          >
            {'\u201C'}
          </motion.span>

          <div className="relative flex h-full flex-col px-6 pb-6 pl-8 pt-6 md:px-8 md:pb-8 md:pl-10 md:pt-8">
            <StarRating />

            <blockquote className="mt-4 mb-6 flex-1 text-sm leading-relaxed italic text-danphe-text">
              &ldquo;{testimonial.quote}&rdquo;
            </blockquote>

            <div className="border-t border-danphe-border/40 pt-4">
              <div className="flex items-center gap-3">
                <div className="relative h-12 w-12 flex-shrink-0">
                  {/* Shadow behind avatar */}
                  <div className="absolute inset-0 rounded-full bg-danphe-accent/20 blur-md" />
                  <div className="relative h-12 w-12 overflow-hidden rounded-full ring-2 ring-danphe-accent/40 ring-offset-2 ring-offset-white">
                    {testimonial.image ? (
                      <Image
                        src={testimonial.image}
                        alt={testimonial.name}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    ) : (
                      <div aria-hidden className="h-full w-full bg-gray-50" />
                    )}
                  </div>
                </div>
                <span className="text-sm font-bold text-danphe-primary">
                  {testimonial.name}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function TestimonialsSection({ heading, subheading, testimonials }: TestimonialsSectionProps) {
  const [current, setCurrent] = useState(0);
  const areaRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Provide a safe fallback so the section always renders
  const safeTestimonials = (testimonials && testimonials.length > 0)
    ? testimonials
    : [
        {
          name: 'Danphe Health',
          quote: 'Trusted by hospitals across the region.',
          image: '',
        },
      ];

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % safeTestimonials.length);
    }, 5000);
  }, [safeTestimonials.length]);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    startTimer();
    return () => stopTimer();
  }, [startTimer, stopTimer]);

  const handleMouseEnter = () => stopTimer();
  const handleMouseLeave = () => startTimer();

  // Compute visible indices: 1 on mobile, up to 3 on desktop but avoid duplicates
  const visibleCount = Math.min(3, safeTestimonials.length);
  const indices = Array.from({ length: visibleCount }, (_, i) => (current + i) % safeTestimonials.length);

  return (
    <section
      className="relative overflow-hidden bg-danphe-bg-light py-20 md:py-28"
      aria-label="Testimonials"
    >
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 dot-pattern-light" />
      <div className="pointer-events-none absolute -left-40 top-20 h-80 w-80 rounded-full bg-danphe-accent/[0.07] blur-[100px]" />
      <div className="pointer-events-none absolute -right-40 bottom-10 h-96 w-96 rounded-full bg-danphe-primary/[0.06] blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-4">
        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
          className="mb-14 text-center"
        >
          <h2 className="font-heading mb-3 text-3xl font-bold text-danphe-primary md:text-4xl">
            {heading}
          </h2>
          <p className="mx-auto max-w-xl text-sm leading-relaxed text-danphe-text">
            {subheading}
          </p>
        </motion.div>

        {/* Testimonial cards area */}
        <div
          ref={areaRef}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="relative"
        >
          <AnimatePresence mode="popLayout">
            <motion.div
              key={indices.join('-')}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              className="grid gap-6 md:grid-cols-3"
            >
              {/* Desktop: show 3 cards */}
              {indices.map((idx) => (
                <div key={`t-${idx}-${safeTestimonials[idx].name}`} className="hidden md:block">
                  <TestimonialCard testimonial={safeTestimonials[idx]} />
                </div>
              ))}
              {/* Mobile: show only current, centered and well-padded */}
              <div className="mx-auto w-full max-w-md md:hidden">
                <TestimonialCard testimonial={safeTestimonials[current % safeTestimonials.length]} />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation dots */}
        <nav
          className="mt-10 flex justify-center gap-2.5"
          role="tablist"
          aria-label="Testimonial navigation"
        >
          {safeTestimonials.map((_, idx) => (
            <motion.button
              key={idx}
              role="tab"
              aria-selected={idx === current}
              aria-label={`Testimonial ${idx + 1}`}
              onClick={() => setCurrent(idx)}
              whileHover={{ scale: 1.3 }}
              transition={{ type: 'tween', duration: 0.2 }}
              className={`h-3 rounded-full transition-all duration-300 ${
                idx === current
                  ? 'w-8 bg-danphe-accent shadow-glow-accent'
                  : 'w-3 bg-danphe-border hover:bg-danphe-text-light'
              }`}
            />
          ))}
        </nav>
      </div>
    </section>
  );
}
