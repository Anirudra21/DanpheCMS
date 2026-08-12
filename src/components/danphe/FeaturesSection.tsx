'use client';

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { FEATURE_CARDS } from '@/lib/constants';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

export default function FeaturesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section
      ref={ref}
      className="bg-danphe-bg-light py-16 sm:py-20 lg:py-24"
      aria-label="Features"
    >
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-12 text-center">
          <motion.div
            initial={{ scaleX: 0 }}
            animate={isInView ? { scaleX: 1 } : {}}
            transition={{ duration: 0.5 }}
            className="mx-auto mb-4 h-1 w-12 origin-center rounded-full bg-danphe-accent"
          />
          <h2 className="mb-3 text-2xl font-bold text-danphe-primary sm:text-3xl lg:text-4xl">
            We Provide Trusted and Best Software
          </h2>
          <p className="mx-auto max-w-2xl text-danphe-text-light">
            All-in-one hospital management solution for seamless operations
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURE_CARDS.map((card, idx) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.5,
                ease: 'easeOut',
                delay: idx * 0.15,
              }}
            >
              <Card className="group h-full border-transparent bg-white transition-all duration-300 hover:scale-[1.03] hover:shadow-xl hover:shadow-danphe-primary/5">
                <CardContent className="flex flex-col items-center gap-4 p-6 text-center sm:p-8">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-danphe-primary/5 transition-colors group-hover:bg-danphe-primary/10">
                    <Image
                      src={card.icon}
                      alt={card.title}
                      width={48}
                      height={48}
                      unoptimized
                      className="h-12 w-12 object-contain"
                    />
                  </div>
                  <h3 className="text-lg font-bold text-danphe-primary">
                    {card.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-danphe-text-light">
                    {card.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
