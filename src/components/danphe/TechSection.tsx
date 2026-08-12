'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Globe, Server, ShieldCheck } from 'lucide-react';

const features = [
  {
    icon: Globe,
    title: '100% Web-Based',
    description:
      'Access your hospital management system from any device with a modern web browser. No installations, no compatibility issues — just seamless access from anywhere.',
    span: 2,
  },
  {
    icon: Server,
    title: 'Scalable Architecture',
    description:
      'From small clinics to large multi-specialty hospitals, Danphe scales with your organization. Handle increasing patient volumes and complex workflows effortlessly.',
    span: 1,
  },
  {
    icon: ShieldCheck,
    title: 'Secure by Design',
    description:
      'Role-based access controls, password-protected modules, and centralized database security ensure your sensitive healthcare data remains protected.',
    span: 1,
  },
] as const;

export default function TechSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section
      ref={ref}
      className="relative bg-danphe-bg-light py-20 md:py-28 dot-pattern-light"
      aria-label="Technology"
    >
      <div className="mx-auto max-w-7xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <h2 className="font-heading mb-4 text-3xl font-bold text-danphe-primary md:text-4xl">
            Built on Modern Technology
          </h2>
          <p className="mx-auto max-w-2xl text-base text-danphe-text-light">
            Designed for reliability, scalability, and performance in mission-critical healthcare
            environments.
          </p>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-3">
          {features.map((item, idx) => {
            const Icon = item.icon;
            const isFirst = idx === 0;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className={
                  isFirst
                    ? 'lg:col-span-2 bg-gradient-to-br from-danphe-primary to-danphe-primary-dark rounded-3xl p-8 md:p-10 text-white shadow-premium-lg relative overflow-hidden'
                    : 'glass rounded-2xl p-6 md:p-8 shadow-premium'
                }
              >
                {isFirst && (
                  <div className="pointer-events-none absolute -right-8 -top-8 opacity-[0.07] rotate-12">
                    <Icon className="h-48 w-48" />
                  </div>
                )}
                <div
                  className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${
                    isFirst
                      ? 'bg-white/10'
                      : 'bg-danphe-accent/10'
                  }`}
                >
                  <Icon
                    className={`h-6 w-6 ${
                      isFirst
                        ? 'brightness-0 invert'
                        : 'text-danphe-accent'
                    }`}
                  />
                </div>
                <h3
                  className={`font-heading mb-3 text-lg font-semibold ${
                    isFirst ? 'text-white' : 'text-danphe-text'
                  }`}
                >
                  {item.title}
                </h3>
                <p
                  className={`text-sm leading-relaxed ${
                    isFirst ? 'text-white/80' : 'text-danphe-text-light'
                  }`}
                >
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
