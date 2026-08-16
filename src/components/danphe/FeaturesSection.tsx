'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Stethoscope, Settings, Cloud } from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  Stethoscope,
  Settings,
  Cloud,
};

interface FeatureCard {
  title: string;
  description: string;
  icon: string;
}

interface FeaturesSectionProps {
  heading: string;
  subheading: string;
  featureCards: FeatureCard[];
}

export default function FeaturesSection({ heading, subheading, featureCards }: FeaturesSectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section
      ref={ref}
      className="relative bg-danphe-bg-light py-20 md:py-28 overflow-x-hidden"
      aria-label="Features"
    >
      {/* Dot pattern overlay */}
      <div className="pointer-events-none absolute inset-0 dot-pattern-light" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <h2 className="font-heading text-3xl font-bold text-danphe-primary md:text-4xl">
            {heading}
          </h2>
          <p className="mt-3 text-danphe-text">
            {subheading}
          </p>
          {/* Decorative gradient bar */}
          <div className="mx-auto mt-5 h-1 w-20 rounded-full bg-gradient-to-r from-danphe-accent to-danphe-primary-light" />
        </motion.div>

        {/* Asymmetric bento grid: first card spans 2 cols, second & third in a row */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featureCards.map((card, idx) => {
            const isFirst = idx === 0;
            const IconComponent = iconMap[card.icon];

            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{
                  duration: 0.5,
                  ease: 'easeOut',
                  delay: idx * 0.15,
                }}
                className={isFirst ? 'sm:col-span-2 lg:col-span-2' : ''}
              >
                {isFirst ? (
                  /* First (large) card - gradient background */
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-danphe-primary to-danphe-primary-light p-8 md:p-10 text-white shadow-premium-lg h-full"
                  >
                    <div className="relative">
                      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
                        {IconComponent ? (
                          <IconComponent className="h-8 w-8 text-white" />
                        ) : (
                          <Stethoscope className="h-8 w-8 text-white" />
                        )}
                      </div>
                      <h3 className="font-heading mb-3 text-xl font-bold md:text-2xl">
                        {card.title}
                      </h3>
                      <p className="max-w-lg text-white/90 leading-relaxed">
                        {card.description}
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  /* Second and third cards - glass */
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="group glass rounded-2xl p-6 md:p-8 shadow-premium transition-shadow duration-300 hover:shadow-premium-lg h-full"
                  >
                    <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-danphe-accent/10">
                      {IconComponent ? (
                        <IconComponent className="h-8 w-8 text-danphe-accent" />
                      ) : (
                        <Settings className="h-8 w-8 text-danphe-accent" />
                      )}
                    </div>
                    <h3 className="font-heading mb-3 text-lg font-bold text-danphe-primary">
                      {card.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-danphe-text">
                      {card.description}
                    </p>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
