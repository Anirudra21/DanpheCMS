'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { CheckCircle, Calendar, ArrowRight } from 'lucide-react';

const bulletPoints = [
  'Helping our customer to take lead in their business using Information Technology',
  'Time tested products to increase customer operational efficiency immediately',
  "Availability of information's in right product will help in right decision making",
];

export default function ValueSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} className="bg-white py-16 sm:py-20 lg:py-24" aria-label="Our Value Proposition">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Image with decorative element */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="relative"
          >
            <div className="absolute -top-4 -left-4 h-full w-full rounded-2xl bg-danphe-accent/10 lg:-top-6 lg:-left-6" />
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-xl">
              <Image
                src="https://danphehealth.com/frontend/img/about-img.png"
                alt="Danphe Health about"
                fill
                unoptimized
                className="object-cover"
              />
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.15 }}
          >
            <motion.div
              initial={{ scaleX: 0 }}
              animate={isInView ? { scaleX: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mb-4 h-1 w-12 origin-left rounded-full bg-danphe-accent"
            />
            <h2 className="mb-6 text-2xl font-bold leading-snug text-danphe-primary sm:text-3xl lg:text-4xl">
              What values DANPHE can ADD to your business
            </h2>

            <ul className="mb-8 space-y-4">
              {bulletPoints.map((point, idx) => (
                <motion.li
                  key={idx}
                  initial={{ opacity: 0, x: 20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.25 + idx * 0.1 }}
                  className="flex gap-3"
                >
                  <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-danphe-accent" />
                  <span className="text-danphe-text leading-relaxed">{point}</span>
                </motion.li>
              ))}
            </ul>

            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
              <Button className="bg-danphe-primary hover:bg-danphe-primary-light" asChild>
                <Link href="/schedule-a-demo">
                  <Calendar className="mr-2 h-4 w-4" />
                  Schedule a Demo
                </Link>
              </Button>
              <Button variant="outline" className="border-danphe-primary text-danphe-primary hover:bg-danphe-primary hover:text-white" asChild>
                <Link href="/solutions">
                  Learn More
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
