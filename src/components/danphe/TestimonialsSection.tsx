'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { TESTIMONIALS } from '@/lib/constants';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

function StarRating() {
  return (
    <div className="flex gap-1" aria-label="4 out of 5 stars">
      {[...Array(4)].map((_, i) => (
        <Star key={i} className="h-4 w-4 fill-danphe-star text-danphe-star" />
      ))}
      <Star className="h-4 w-4 text-gray-300" />
    </div>
  );
}

function TestimonialCard({
  testimonial,
}: {
  testimonial: (typeof TESTIMONIALS)[number];
}) {
  return (
    <div className="relative bg-white rounded-2xl border border-danphe-border/50 p-6 md:p-8 shadow-premium h-full flex flex-col">
      {/* Decorative Quote icon */}
      <Quote className="absolute top-6 right-6 h-8 w-8 text-danphe-accent/10" />

      <StarRating />

      <blockquote className="mt-4 mb-6 flex-1 text-sm leading-relaxed italic text-danphe-text">
        &ldquo;{testimonial.quote}&rdquo;
      </blockquote>

      <div className="border-t border-danphe-border/50 pt-4">
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full ring-2 ring-danphe-accent/20 ring-offset-2">
            <Image
              src={testimonial.image}
              alt={testimonial.name}
              fill
              unoptimized
              className="object-cover"
            />
          </div>
          <span className="text-sm font-semibold text-danphe-primary">
            {testimonial.name}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function TestimonialsSection() {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % TESTIMONIALS.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  // Compute visible indices: 1 on mobile, 3 on desktop
  // We use CSS to show 1 on mobile, 3 on md+
  const indices = [0, 1, 2].map((i) => (current + i) % TESTIMONIALS.length);

  return (
    <section
      className="relative bg-white py-20 md:py-28"
      aria-label="Testimonials"
    >
      <div className="mx-auto max-w-7xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <h2 className="font-heading mb-3 text-3xl font-bold text-danphe-primary md:text-4xl">
            See what our valuable clients tell about us
          </h2>
        </motion.div>

        <div className="relative">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={indices.join('-')}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              className="grid gap-6 md:grid-cols-3"
            >
              {indices.map((idx) => (
                <div key={TESTIMONIALS[idx].name} className="hidden md:block">
                  <TestimonialCard testimonial={TESTIMONIALS[idx]} />
                </div>
              ))}
              {/* Mobile: show only current */}
              <div className="md:hidden">
                <TestimonialCard testimonial={TESTIMONIALS[current]} />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation dots */}
        <div
          className="mt-8 flex justify-center gap-2"
          role="tablist"
          aria-label="Testimonial navigation"
        >
          {TESTIMONIALS.map((_, idx) => (
            <button
              key={idx}
              role="tab"
              aria-selected={idx === current}
              aria-label={`Testimonial ${idx + 1}`}
              onClick={() => setCurrent(idx)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                idx === current
                  ? 'w-8 bg-danphe-accent'
                  : 'w-2.5 bg-danphe-border hover:bg-danphe-text-light'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
