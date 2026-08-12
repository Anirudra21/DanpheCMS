'use client';

import Image from 'next/image';
import Link from 'next/link';
import { TRUSTED_HOSPITALS } from '@/lib/constants';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function TrustedSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section
      ref={ref}
      className="bg-gray-50 py-16 sm:py-20 lg:py-24"
      aria-label="Trusted Hospitals"
    >
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-10 text-center">
          <motion.div
            initial={{ scaleX: 0 }}
            animate={isInView ? { scaleX: 1 } : {}}
            transition={{ duration: 0.5 }}
            className="mx-auto mb-4 h-1 w-12 origin-center rounded-full bg-danphe-accent"
          />
          <h2 className="mb-3 text-2xl font-bold text-danphe-primary sm:text-3xl lg:text-4xl">
            Trusted by
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-4 lg:grid-cols-6">
          {TRUSTED_HOSPITALS.map((hospital, idx) => (
            <motion.div
              key={hospital.name}
              aria-label={hospital.name}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, ease: 'easeOut', delay: idx * 0.04 }}
              whileHover={{ y: -4, scale: 1.05 }}
              className="group flex items-center justify-center rounded-xl border border-gray-100 bg-white p-3 shadow-sm transition-shadow hover:shadow-lg hover:border-danphe-border sm:p-4"
            >
              <div className="relative h-10 w-full max-w-[140px] transition-all group-hover:h-12">
                <Image
                  src={hospital.logo}
                  alt={hospital.name}
                  fill
                  unoptimized
                  className="object-contain transition-opacity group-hover:opacity-100 opacity-80"
                />
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Button
            variant="link"
            className="text-danphe-accent hover:text-danphe-accent-light"
            asChild
          >
            <Link href="/clients">
              View All
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
