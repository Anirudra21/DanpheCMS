'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Calendar, ArrowRight } from 'lucide-react';

interface ValueSectionProps {
  heading: string;
  valuePoints: string[];
  image: string;
  ctaLabel: string;
  ctaUrl: string;
}

export default function ValueSection({ heading, valuePoints, image, ctaLabel, ctaUrl }: ValueSectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section
      ref={ref}
      className="relative bg-white py-20 md:py-28 overflow-x-hidden"
      aria-label="Our Value Proposition"
    >
      {/* Dot pattern overlay */}
      <div className="pointer-events-none absolute inset-0 dot-pattern-light" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-start gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Left: Image - 7 cols */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="relative lg:col-span-7"
          >
            <div className="relative overflow-hidden rounded-3xl shadow-premium-lg border-l-4 border-danphe-accent">
              <Image
                src={image}
                alt="Danphe Health about"
                width={800}
                height={600}
                unoptimized
                className="h-auto w-full object-cover"
              />
            </div>
          </motion.div>

          {/* Right: Content - 5 cols */}
          <div className="flex flex-col gap-4 lg:col-span-5">
            {/* Heading */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
            >
              <h2 className="font-heading mb-3 text-3xl font-bold leading-snug text-danphe-primary md:text-4xl">
                {heading}
              </h2>
              {/* Gradient underline bar */}
              <div className="mt-4 h-1 w-20 rounded-full bg-gradient-to-r from-danphe-accent to-danphe-primary-light" />
            </motion.div>

            {/* Three glassmorphism value cards */}
            {valuePoints.map((point, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{
                  duration: 0.5,
                  ease: 'easeOut',
                  delay: 0.25 + idx * 0.12,
                }}
                whileHover={{ y: -2 }}
                className="glass rounded-2xl p-5 shadow-premium cursor-default"
              >
                <div className="flex items-start gap-4">
                  {/* Number + accent line */}
                  <div className="flex flex-col items-center gap-1 flex-shrink-0">
                    <span className="font-heading text-2xl font-bold gradient-text">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <div className="h-8 w-px bg-gradient-to-b from-danphe-accent/60 to-transparent" />
                  </div>
                  {/* Text */}
                  <p className="text-sm leading-relaxed text-danphe-text pt-1 font-medium">
                    {point}
                  </p>
                </div>
              </motion.div>
            ))}

            {/* CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, ease: 'easeOut', delay: 0.7 }}
              className="mt-2 flex flex-col gap-3 sm:flex-row sm:gap-4"
            >
              <Link
                href={ctaUrl}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-danphe-accent px-6 py-3 text-sm font-semibold text-white shadow-premium transition-all duration-300 hover:shadow-glow-accent hover:bg-danphe-accent-light"
              >
                <Calendar className="h-4 w-4" />
                {ctaLabel}
              </Link>
              <Link
                href="/solutions"
                className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-danphe-primary/20 px-6 py-3 text-sm font-semibold text-danphe-primary transition-all duration-300 hover:border-danphe-primary hover:bg-danphe-primary hover:text-white"
              >
                Learn More
                <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
