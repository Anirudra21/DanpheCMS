'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Eye, Unlock, Users, TrendingDown } from 'lucide-react';

const benefits = [
  {
    icon: Eye,
    title: 'Full Transparency',
    description:
      'Review, audit, and verify every line of code. Complete visibility into how your patient data is handled.',
  },
  {
    icon: Unlock,
    title: 'No Vendor Lock-in',
    description:
      'Own your data and infrastructure. Migrate, customize, and extend without restrictions.',
  },
  {
    icon: Users,
    title: 'Community Driven',
    description:
      'Benefit from contributions, bug fixes, and feature requests from a global community of healthcare technology professionals.',
  },
  {
    icon: TrendingDown,
    title: 'Cost Effective',
    description:
      'Eliminate expensive licensing fees. Invest your budget in what matters — patient care and hospital operations.',
  },
] as const;

export default function OpenSourceSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section
      ref={ref}
      className="bg-white py-20 md:py-28"
      aria-label="Why Open-Source HMIS"
    >
      <div className="mx-auto max-w-7xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <h2 className="font-heading mb-4 text-3xl font-bold text-danphe-primary md:text-4xl">
            Why Open-Source HMIS?
          </h2>
          <p className="mx-auto max-w-2xl text-base text-danphe-text-light">
            Transparency, flexibility, and community-driven innovation — the foundation of
            trustworthy healthcare software.
          </p>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="glass rounded-2xl border border-danphe-border/30 p-6 shadow-premium transition-shadow hover:shadow-premium-lg"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-danphe-accent/10">
                  <Icon className="h-6 w-6 text-danphe-accent" />
                </div>
                <h3 className="font-heading mb-2 text-base font-semibold text-danphe-text">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-danphe-text-light">
                  {item.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
