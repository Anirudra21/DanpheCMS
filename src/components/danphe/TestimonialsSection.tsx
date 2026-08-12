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
        <Star key={i} className="h-5 w-5 fill-danphe-star text-danphe-star" />
      ))}
      <Star className="h-5 w-5 text-gray-300" />
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

  const testimonial = TESTIMONIALS[current];

  return (
    <section className="relative bg-white py-16 sm:py-20 lg:py-24" aria-label="Testimonials">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-12 text-center">
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mx-auto mb-4 h-1 w-12 origin-center rounded-full bg-danphe-accent"
          />
          <h2 className="mb-3 text-2xl font-bold text-danphe-primary sm:text-3xl lg:text-4xl">
            See what our valuable clients tell about us
          </h2>
        </div>

        <div className="relative mx-auto max-w-3xl">
          {/* Large decorative quote mark */}
          <div className="absolute -top-6 left-0 z-0 text-danphe-accent/10 sm:-top-8 sm:left-4">
            <Quote className="h-16 w-16 sm:h-24 sm:w-24" />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              className="relative z-10 rounded-2xl border border-danphe-border bg-gradient-to-b from-danphe-bg-light to-white p-6 shadow-sm sm:p-10 text-center"
            >
              <StarRating />
              <blockquote className="mt-6 mb-6 text-base leading-relaxed text-danphe-text sm:text-lg italic">
                &ldquo;{testimonial.quote}&rdquo;
              </blockquote>
              <div className="flex flex-col items-center gap-3">
                <div className="relative h-14 w-14 overflow-hidden rounded-full ring-2 ring-danphe-accent/20 ring-offset-2">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.name}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>
                <span className="font-semibold text-danphe-primary">
                  {testimonial.name}
                </span>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation dots */}
          <div className="mt-6 flex justify-center gap-2" role="tablist" aria-label="Testimonial navigation">
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
      </div>
    </section>
  );
}
