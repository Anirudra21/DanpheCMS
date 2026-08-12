'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MODULES } from '@/lib/constants';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

export default function ModuleSection() {
  const [activeIdx, setActiveIdx] = useState(0);
  const tabsRef = useRef<HTMLDivElement>(null);
  const activeModule = MODULES[activeIdx];

  const goPrev = () =>
    setActiveIdx((i) => (i === 0 ? MODULES.length - 1 : i - 1));
  const goNext = () =>
    setActiveIdx((i) => (i === MODULES.length - 1 ? 0 : i + 1));

  const scrollTabIntoView = (idx: number) => {
    const container = tabsRef.current;
    if (!container) return;
    const tab = container.children[idx] as HTMLElement | undefined;
    tab?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  };

  const selectTab = (idx: number) => {
    setActiveIdx(idx);
    scrollTabIntoView(idx);
  };

  return (
    <section className="bg-white py-16 sm:py-20 lg:py-24" aria-label="Modules">
      <div className="mx-auto max-w-7xl px-4">
        {/* Heading */}
        <div className="mb-10 text-center">
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mx-auto mb-4 h-1 w-12 origin-center rounded-full bg-danphe-accent"
          />
          <h2 className="mb-3 text-2xl font-bold text-danphe-primary sm:text-3xl lg:text-4xl">
            Discover a complete solution for HIMS with EMR
          </h2>
        </div>

        {/* Module tab navigation */}
        <div className="relative mb-8">
          <div
            ref={tabsRef}
            className="scrollbar-hide flex gap-2 overflow-x-auto pb-2"
            role="tablist"
            aria-label="Module tabs"
          >
            {MODULES.map((mod, idx) => (
              <button
                key={mod.name}
                role="tab"
                aria-selected={idx === activeIdx}
                onClick={() => selectTab(idx)}
                className={`flex flex-shrink-0 items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                  idx === activeIdx
                    ? 'bg-danphe-primary text-white shadow-md'
                    : 'bg-danphe-bg-light text-danphe-text hover:bg-danphe-border'
                }`}
              >
                <Image
                  src={mod.icon}
                  alt={`${mod.name} icon`}
                  width={20}
                  height={20}
                  unoptimized
                  className={`h-5 w-5 ${idx === activeIdx ? 'brightness-0 invert' : ''}`}
                />
                <span className="whitespace-nowrap">{mod.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content area */}
        <div className="relative overflow-hidden rounded-2xl border border-danphe-border bg-danphe-bg-light">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIdx}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="grid items-center gap-8 p-6 sm:p-8 lg:grid-cols-2 lg:p-10"
            >
              {/* Text side */}
              <div>
                <span className="mb-3 inline-block rounded-full bg-danphe-primary/10 px-3 py-1 text-xs font-medium text-danphe-primary">
                  {activeModule.name}
                </span>
                <h3 className="mb-4 text-xl font-bold text-danphe-primary sm:text-2xl">
                  {activeModule.title}
                </h3>
                <p className="mb-6 leading-relaxed text-danphe-text-light">
                  {activeModule.description}
                </p>
                <Button
                  variant="link"
                  className="p-0 text-danphe-accent hover:text-danphe-accent-light"
                  asChild
                >
                  <Link href={activeModule.href}>
                    View Detail
                    <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Link>
                </Button>
              </div>

              {/* Image side */}
              <div className="relative aspect-[16/10] overflow-hidden rounded-xl shadow-lg">
                <Image
                  src={activeModule.image}
                  alt={activeModule.name}
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Bottom controls */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between sm:bottom-6 sm:left-6 sm:right-6">
            <span className="text-xs font-medium text-danphe-text-light sm:text-sm">
              <span className="text-danphe-primary font-bold">{String(activeIdx + 1).padStart(2, '0')}</span>
              {' / '}
              {String(MODULES.length).padStart(2, '0')}
            </span>

            <div className="flex gap-2">
              <Button
                size="icon"
                variant="outline"
                className="h-10 w-10 rounded-full border-danphe-primary/30 bg-white/90 hover:bg-danphe-primary hover:text-white"
                onClick={goPrev}
                aria-label="Previous module"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                size="icon"
                variant="outline"
                className="h-10 w-10 rounded-full border-danphe-primary/30 bg-white/90 hover:bg-danphe-primary hover:text-white"
                onClick={goNext}
                aria-label="Next module"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
