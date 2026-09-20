'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { SHARED_FAQS } from '@/lib/constants';
import { CheckCircle, Calendar, ArrowLeft } from 'lucide-react';

type ModuleData = {
  name: string;
  slug: string;
  href: string;
  icon: string;
  title: string;
  description: string;
  fullDescription: string;
  features: readonly string[];
  image: string;
};

export default function SolutionDetailClient({ module: mod }: { module: ModuleData }) {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-danphe-primary via-danphe-dark to-danphe-primary py-20 sm:py-28">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 -left-24 h-72 w-72 animate-pulse rounded-full bg-danphe-accent/15 blur-3xl" />
          <div className="absolute -bottom-32 -right-32 h-96 w-96 animate-pulse rounded-full bg-danphe-primary-light/15 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link
              href="/solutions"
              className="mb-6 inline-flex items-center gap-1.5 text-sm text-white/70 transition-colors hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Solutions
            </Link>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex items-center gap-4"
          >
            {mod.icon ? (
              <Image
                src={mod.icon}
                alt={mod.name}
                width={48}
                height={48}
                unoptimized
                className="h-12 w-12 brightness-0 invert"
              />
            ) : (
              <div className="h-12 w-12" aria-hidden />
            )}
            <div>
              <h1 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl">{mod.name}</h1>
              <p className="mt-2 text-white/80 sm:text-lg">{mod.title}</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Content + Image */}
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <p className="mb-6 text-danphe-text leading-relaxed">{mod.fullDescription}</p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button className="bg-danphe-primary hover:bg-danphe-primary-light" asChild>
                  <Link href="/schedule-a-demo">
                    <Calendar className="mr-2 h-4 w-4" />
                    Schedule a Demo
                  </Link>
                </Button>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="relative aspect-[16/10] overflow-hidden rounded-2xl shadow-xl"
            >
              {mod.image ? (
                <Image
                  src={mod.image}
                  alt={mod.name}
                  fill
                  unoptimized
                  className="object-cover"
                />
              ) : (
                <div aria-hidden className="h-full w-full bg-gray-50" />
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-danphe-bg-light py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-10 text-center">
            <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-danphe-accent" />
            <h2 className="text-2xl font-bold text-danphe-primary sm:text-3xl">Features</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {mod.features.map((feature, i) => (
              <motion.div
                key={feature}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <Card className="border-danphe-border transition-shadow hover:shadow-md">
                  <CardContent className="flex items-start gap-3 p-4">
                    <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-danphe-accent" />
                    <span className="text-sm text-danphe-text">{feature}</span>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4">
          <div className="mb-10 text-center">
            <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-danphe-accent" />
            <h2 className="text-2xl font-bold text-danphe-primary sm:text-3xl">FAQ&apos;s</h2>
          </div>
          <Accordion type="single" collapsible className="w-full">
            {SHARED_FAQS.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="text-left text-sm font-medium text-danphe-primary hover:text-danphe-primary-light">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-danphe-text-light leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          <div className="mt-8 rounded-xl border border-danphe-border bg-danphe-bg-light p-6 text-center">
            <p className="text-danphe-text-light">
              Still have a questions? If you cannot find answer to your question in our FAQ, you can always{' '}
              <Link href="/contact" className="font-medium text-danphe-accent hover:underline">contact us</Link>
              {' '}. We will answer to you shortly
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
