'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { ArrowRight, ExternalLink, FileText, Download, CheckCircle } from 'lucide-react';

export default function OutcomesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} className="bg-danphe-bg-light py-16 sm:py-20 lg:py-24" aria-label="Outcomes">
      <div className="mx-auto max-w-7xl px-4">
        {/* Main content */}
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <motion.div
              initial={{ scaleX: 0 }}
              animate={isInView ? { scaleX: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="mb-4 h-1 w-12 origin-left rounded-full bg-danphe-accent"
            />
            <h2 className="mb-4 text-2xl font-bold leading-snug text-danphe-primary sm:text-3xl lg:text-4xl">
              Delivering better outcomes by working together to build smart system solutions for you
            </h2>
            <ul className="mb-8 space-y-4">
              <motion.li
                initial={{ opacity: 0, x: 20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="flex gap-3"
              >
                <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-danphe-accent" />
                <span className="text-danphe-text leading-relaxed">
                  Improve your patient experience by improving your process with DANPHE HMIS Software
                </span>
              </motion.li>
              <motion.li
                initial={{ opacity: 0, x: 20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="flex gap-3"
              >
                <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-danphe-accent" />
                <span className="text-danphe-text leading-relaxed">
                  Significant reduction in time and effort required to manage your Health Institution
                </span>
              </motion.li>
            </ul>
            <Button className="bg-danphe-primary hover:bg-danphe-primary-light" asChild>
              <Link href="/solutions">
                Explore More
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>

          {/* Image with decorative frame */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.15 }}
            className="relative"
          >
            <div className="absolute -top-4 -right-4 h-full w-full rounded-2xl bg-danphe-accent/10 lg:-top-6 lg:-right-6" />
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-xl">
              <Image
                src="https://danphehealth.com/frontend/img/doctor.png"
                alt="Doctor using Danphe HMIS"
                fill
                unoptimized
                className="object-cover"
              />
            </div>
          </motion.div>
        </div>

        {/* Danphe Efficiency sub-section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.4 }}
          className="mt-16 rounded-2xl border border-danphe-border bg-white p-6 shadow-sm sm:p-8 lg:mt-20"
        >
          <h3 className="mb-3 text-xl font-bold text-danphe-primary sm:text-2xl">
            Danphe Efficiency
          </h3>
          <p className="mb-4 text-danphe-text-light">
            Explore more about Danphe! One solution, no software clutter – Comprehensive EHR and HIMS in a nutshell.
          </p>
          <Button variant="link" className="p-0 text-danphe-accent hover:text-danphe-accent-light" asChild>
            <Link href="/solutions">
              View Detail
              <ExternalLink className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>
        </motion.div>

        {/* Download cards - PDFs stay external */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.5 }}
          className="mt-8 grid gap-4 sm:grid-cols-2 lg:mt-12"
        >
          <Card className="group overflow-hidden border-danphe-border transition-all duration-300 hover:shadow-lg">
            <CardContent className="flex items-start gap-4 p-6">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-danphe-primary/10 transition-colors group-hover:bg-danphe-primary group-hover:text-white">
                <FileText className="h-6 w-6 text-danphe-primary transition-colors group-hover:text-white" />
              </div>
              <div>
                <h4 className="mb-1 font-bold text-danphe-primary">Brochure</h4>
                <p className="mb-3 text-sm text-danphe-text-light">
                  One solution, no software clutter – Comprehensive EHR and HIMS in a nutshell.
                </p>
                <Button size="sm" className="bg-danphe-accent hover:bg-danphe-accent-light" asChild>
                  <a
                    href="https://danphehealth.com/downloads/danphe-hmis-brochure.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Download className="mr-1.5 h-3.5 w-3.5" />
                    Download Now
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="group overflow-hidden border-danphe-border transition-all duration-300 hover:shadow-lg">
            <CardContent className="flex items-start gap-4 p-6">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-danphe-primary/10 transition-colors group-hover:bg-danphe-primary group-hover:text-white">
                <FileText className="h-6 w-6 text-danphe-primary transition-colors group-hover:text-white" />
              </div>
              <div>
                <h4 className="mb-1 font-bold text-danphe-primary">Presentation</h4>
                <p className="mb-3 text-sm text-danphe-text-light">
                  One solution, no software clutter – Comprehensive EHR and HIMS in a nutshell.
                </p>
                <Button size="sm" className="bg-danphe-accent hover:bg-danphe-accent-light" asChild>
                  <a
                    href="https://danphehealth.com/downloads/danphe-presentation.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Download className="mr-1.5 h-3.5 w-3.5" />
                    Download Now
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
