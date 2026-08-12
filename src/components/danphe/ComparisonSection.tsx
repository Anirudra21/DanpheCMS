'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Stethoscope, BadgeCheck, Code2 } from 'lucide-react';

const cards = [
  {
    icon: Stethoscope,
    title: 'Built by Healthcare Professionals',
    description:
      'Developed with deep domain expertise from doctors and hospital administrators who understand real clinical workflows.',
  },
  {
    icon: BadgeCheck,
    title: 'Proven in Production',
    description:
      'Battle-tested across 60+ hospitals handling millions of patient records, billing cycles, and clinical workflows daily.',
  },
  {
    icon: Code2,
    title: 'Open-Source Freedom',
    description:
      'Full access to source code. No vendor lock-in. Customize, extend, and integrate with your existing systems.',
  },
] as const;

export default function ComparisonSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section
      ref={ref}
      className="dot-pattern-light bg-danphe-bg-light py-20 md:py-28"
      aria-label="Why Danphe"
    >
      <div className="mx-auto max-w-7xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <h2 className="font-heading mb-4 text-3xl font-bold text-danphe-primary md:text-4xl">
            Why Healthcare Institutions Choose DANPHE
          </h2>
          <p className="mx-auto max-w-2xl text-base text-danphe-text-light">
            The only HMIS built by doctors, for doctors — with the flexibility
            of open source.
          </p>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-3">
          {cards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="rounded-2xl border border-danphe-border/30 bg-white p-6 shadow-premium transition-shadow md:p-8 hover:shadow-premium-lg"
              >
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-danphe-accent/10">
                  <Icon className="h-7 w-7 text-danphe-accent" />
                </div>
                <h3 className="font-heading mb-2 text-lg font-semibold text-danphe-primary">
                  {card.title}
                </h3>
                <p className="text-sm leading-relaxed text-danphe-text-light">
                  {card.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
