'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { ArrowRight, ExternalLink, FileText, Download, CheckCircle } from 'lucide-react';

const outcomePoints = [
  'Improve your patient experience by improving your process with DANPHE HMIS Software',
  'Significant reduction in time and effort required to manage your Health Institution',
];

export default function OutcomesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const efficiencyRef = useRef(null);
  const isEffInView = useInView(efficiencyRef, { once: true, margin: '-60px' });
  const downloadRef = useRef(null);
  const isDlInView = useInView(downloadRef, { once: true, margin: '-60px' });

  return (
    <section ref={ref} className="bg-white py-20 md:py-28 overflow-x-hidden" aria-label="Outcomes">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main content: 7/5 split */}
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-16">
          {/* Left: Content - 7 cols */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              <h2 className="font-heading mb-8 text-3xl font-bold leading-snug text-danphe-primary md:text-4xl">
                Delivering better outcomes by working together to build smart system solutions for you
              </h2>
            </motion.div>

            {/* Bullet cards */}
            <div className="flex flex-col gap-4">
              {outcomePoints.map((point, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, ease: 'easeOut', delay: 0.2 + idx * 0.12 }}
                  whileHover={{ y: -2 }}
                  className="glass-subtle rounded-xl p-4 cursor-default"
                >
                  <div className="flex items-start gap-3">
                    <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-danphe-accent" />
                    <span className="text-sm leading-relaxed text-danphe-text">{point}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, ease: 'easeOut', delay: 0.5 }}
              className="mt-8"
            >
              <Link
                href="/solutions"
                className="inline-flex items-center gap-2 rounded-full bg-danphe-accent px-6 py-3 text-sm font-semibold text-white shadow-premium transition-all duration-300 hover:shadow-glow-accent hover:bg-danphe-accent-light"
              >
                Explore More
                <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
          </div>

          {/* Right: Doctor image - 5 cols */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.15 }}
            className="relative lg:col-span-5 order-first lg:order-last"
          >
            {/* Decorative accent shape behind image */}
            <div className="absolute -top-6 -right-6 -bottom-4 -left-4 rounded-2xl bg-danphe-accent/10 -rotate-3" />
            <div className="relative overflow-hidden rounded-3xl shadow-premium-lg">
              <Image
                src="https://danphehealth.com/frontend/img/doctor.png"
                alt="Doctor using Danphe HMIS"
                width={600}
                height={700}
                unoptimized
                className="h-auto w-full object-cover"
              />
            </div>
          </motion.div>
        </div>

        {/* Danphe Efficiency sub-section - full-width glass card */}
        <motion.div
          ref={efficiencyRef}
          initial={{ opacity: 0, y: 30 }}
          animate={isEffInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="mt-16 lg:mt-20"
        >
          <div className="glass rounded-2xl p-6 md:p-8 shadow-premium relative overflow-hidden">
            {/* Subtle accent decoration */}
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-danphe-accent/5" />
            <div className="pointer-events-none absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-danphe-primary/5" />

            <div className="relative flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h3 className="font-heading mb-2 text-xl font-bold text-danphe-primary sm:text-2xl">
                  Danphe Efficiency
                </h3>
                <p className="max-w-2xl text-danphe-text-light">
                  Explore more about Danphe! One solution, no software clutter – Comprehensive EHR and HIMS in a nutshell.
                </p>
              </div>
              <Link
                href="/solutions"
                className="inline-flex flex-shrink-0 items-center gap-2 text-sm font-semibold text-danphe-accent transition-colors hover:text-danphe-accent-light"
              >
                View Detail
                <ExternalLink className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Download cards - 2 col grid */}
        <motion.div
          ref={downloadRef}
          initial={{ opacity: 0, y: 30 }}
          animate={isDlInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
          className="mt-8 grid gap-4 sm:grid-cols-2 lg:mt-12"
        >
          {/* Brochure card */}
          <motion.div
            whileHover={{ y: -2 }}
            className="group bg-white rounded-2xl border border-danphe-border/50 p-6 shadow-premium transition-shadow duration-300 hover:shadow-premium-lg"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-danphe-accent/10">
                <FileText className="h-6 w-6 text-danphe-accent" />
              </div>
              <div>
                <h4 className="mb-1 font-bold text-danphe-primary">Brochure</h4>
                <p className="mb-3 text-sm text-danphe-text-light">
                  One solution, no software clutter – Comprehensive EHR and HIMS in a nutshell.
                </p>
                <a
                  href="https://danphehealth.com/downloads/danphe-hmis-brochure.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full bg-danphe-accent px-4 py-2 text-xs font-semibold text-white transition-all duration-300 hover:bg-danphe-accent-light hover:shadow-glow-accent"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download Now
                </a>
              </div>
            </div>
          </motion.div>

          {/* Presentation card */}
          <motion.div
            whileHover={{ y: -2 }}
            className="group bg-white rounded-2xl border border-danphe-border/50 p-6 shadow-premium transition-shadow duration-300 hover:shadow-premium-lg"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-danphe-accent/10">
                <FileText className="h-6 w-6 text-danphe-accent" />
              </div>
              <div>
                <h4 className="mb-1 font-bold text-danphe-primary">Presentation</h4>
                <p className="mb-3 text-sm text-danphe-text-light">
                  One solution, no software clutter – Comprehensive EHR and HIMS in a nutshell.
                </p>
                <a
                  href="https://danphehealth.com/downloads/danphe-presentation.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full bg-danphe-accent px-4 py-2 text-xs font-semibold text-white transition-all duration-300 hover:bg-danphe-accent-light hover:shadow-glow-accent"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download Now
                </a>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
