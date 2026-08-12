'use client';

import Image from 'next/image';
import Link from 'next/link';
import { TRUSTED_HOSPITALS } from '@/lib/constants';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { ArrowRight } from 'lucide-react';

export default function TrustedSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section
      ref={ref}
      className="bg-danphe-bg-light py-20 md:py-28"
      aria-label="Trusted Hospitals"
    >
      <div className="mx-auto max-w-7xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <h2 className="font-heading mb-3 text-3xl font-bold text-danphe-primary md:text-4xl">
            Trusted by Leading Healthcare Institutions
          </h2>
        </motion.div>

        {/* Row 1 - scrolls left */}
        <div className="overflow-hidden">
          <div className="flex animate-marquee">
            {[...TRUSTED_HOSPITALS, ...TRUSTED_HOSPITALS].map((hospital, idx) => (
              <div
                key={`r1-${idx}`}
                className="mx-2 flex-shrink-0 bg-white rounded-xl border border-danphe-border/30 px-6 py-4 transition-shadow hover:shadow-md"
                aria-label={hospital.name}
              >
                <Image
                  src={hospital.logo}
                  alt={hospital.name}
                  unoptimized
                  width={120}
                  height={32}
                  className="h-8 w-auto object-contain"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Row 2 - scrolls right (reverse) */}
        <div className="mt-4 overflow-hidden">
          <div className="flex animate-marquee" style={{ animationDirection: 'reverse' }}>
            {[...TRUSTED_HOSPITALS, ...TRUSTED_HOSPITALS].map((hospital, idx) => (
              <div
                key={`r2-${idx}`}
                className="mx-2 flex-shrink-0 bg-white rounded-xl border border-danphe-border/30 px-6 py-4 transition-shadow hover:shadow-md"
                aria-label={hospital.name}
              >
                <Image
                  src={hospital.logo}
                  alt={hospital.name}
                  unoptimized
                  width={120}
                  height={32}
                  className="h-8 w-auto object-contain"
                />
              </div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10 text-center"
        >
          <Link
            href="/clients"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-danphe-accent transition-colors hover:text-danphe-accent-light"
          >
            View All
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
