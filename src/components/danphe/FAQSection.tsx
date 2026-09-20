'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface FAQ {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  heading: string;
  subheading: string;
  faqs: FAQ[];
}

export default function FAQSection({ heading, subheading, faqs }: FAQSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section
      ref={ref}
      className="bg-white py-20 md:py-28"
      aria-label="FAQ"
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

        <div className="mx-auto max-w-3xl">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
              >
                <AccordionItem
                  value={`faq-${idx}`}
                  className="border-b border-danphe-border/50"
                >
                  <AccordionTrigger className="font-semibold text-danphe-text hover:no-underline">
                    {faq.question}
                    <ChevronDown className="pointer-events-none h-4 w-4 shrink-0 text-danphe-text-light transition-transform duration-200 [[data-state=open]>&]:rotate-180" />
                  </AccordionTrigger>
                  <AccordionContent className="pl-1 text-sm leading-relaxed text-danphe-text">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}