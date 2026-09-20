'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Stethoscope, BadgeCheck, Code2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Icon mapping (kept local — icons are React components)            */
/* ------------------------------------------------------------------ */
const ICONS: LucideIcon[] = [Stethoscope, BadgeCheck, Code2];

interface ComparisonCard {
  title: string;
  description: string;
}

interface ComparisonSectionProps {
  heading: string;
  subheading: string;
  cards: ComparisonCard[];
}

export default function ComparisonSection({ heading, subheading, cards }: ComparisonSectionProps) {
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
            {heading}
          </h2>
          <p className="mx-auto max-w-2xl text-base text-danphe-text">
            {subheading}
          </p>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-3">
          {cards.map((card, idx) => {
            const Icon = ICONS[idx] || Stethoscope;
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
                <p className="text-sm leading-relaxed text-danphe-text">
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
