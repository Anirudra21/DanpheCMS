'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MODULES } from '@/lib/constants';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

export default function ModuleSection() {
  const [activeIdx, setActiveIdx] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const detailRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-60px' });
  const activeModule = MODULES[activeIdx];

  const goPrev = () =>
    setActiveIdx((i) => (i === 0 ? MODULES.length - 1 : i - 1));
  const goNext = () =>
    setActiveIdx((i) => (i === MODULES.length - 1 ? 0 : i + 1));

  const selectModule = (idx: number) => {
    setActiveIdx(idx);
    // Scroll detail panel into view on mobile
    setTimeout(() => {
      detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
  };

  return (
    <section
      ref={sectionRef}
      className="relative bg-danphe-bg-light py-20 md:py-28 overflow-hidden"
      aria-label="Modules"
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
            Discover a{' '}
            <span className="gradient-text">complete</span>{' '}
            solution for HIMS with EMR
          </h2>
        </motion.div>

        {/* 3x3 Bento Grid */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
          {MODULES.map((mod, idx) => (
            <motion.button
              key={mod.name}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.4,
                ease: 'easeOut',
                delay: idx * 0.06,
              }}
              onClick={() => selectModule(idx)}
              className={`group relative flex flex-col items-center gap-2.5 rounded-2xl border p-4 md:p-5 text-left transition-all duration-300 md:items-start ${
                idx === activeIdx
                  ? 'ring-2 ring-danphe-accent bg-danphe-bg-alt border-danphe-accent/30 shadow-premium'
                  : 'bg-white border-danphe-border/50 shadow-premium hover:shadow-premium-lg hover:scale-[1.02] hover:border-danphe-accent/30'
              }`}
              aria-label={`View ${mod.name} details`}
            >
              {/* Icon in colored circle */}
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors duration-300 ${
                  idx === activeIdx
                    ? 'bg-danphe-accent/15'
                    : 'bg-danphe-primary/5 group-hover:bg-danphe-accent/10'
                }`}
              >
                <Image
                  src={mod.icon}
                  alt={`${mod.name} icon`}
                  width={22}
                  height={22}
                  unoptimized
                  className={`h-5 w-5 object-contain transition-all duration-300 ${
                    idx === activeIdx
                      ? 'brightness-0 saturate-100'
                      : ''
                  }`}
                />
              </div>
              {/* Module name */}
              <span
                className={`text-xs font-semibold leading-tight ${
                  idx === activeIdx
                    ? 'text-danphe-primary'
                    : 'text-danphe-text group-hover:text-danphe-primary'
                }`}
              >
                {mod.name}
              </span>
              {/* Title - truncated to 1 line */}
              <span className="text-[11px] leading-tight text-danphe-text-light line-clamp-1">
                {mod.title}
              </span>
            </motion.button>
          ))}
        </div>

        {/* Detail Panel */}
        <div ref={detailRef} className="mt-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIdx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              className="glass rounded-3xl p-6 md:p-10 shadow-premium-lg"
            >
              <div className="grid items-center gap-8 lg:grid-cols-2">
                {/* Left: Content */}
                <div>
                  <span className="mb-3 inline-block rounded-full bg-danphe-primary/10 px-4 py-1.5 text-xs font-semibold text-danphe-primary">
                    {activeModule.name}
                  </span>
                  <h3 className="font-heading mb-4 text-xl font-bold text-danphe-primary sm:text-2xl md:text-3xl">
                    {activeModule.title}
                  </h3>
                  <p className="mb-6 leading-relaxed text-danphe-text-light">
                    {activeModule.description}
                  </p>
                  <Link
                    href={activeModule.href}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-danphe-accent transition-colors hover:text-danphe-accent-light"
                  >
                    View Detail
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>

                {/* Right: Image */}
                <div className="relative aspect-[16/10] overflow-hidden rounded-2xl shadow-premium-lg">
                  <Image
                    src={activeModule.image}
                    alt={activeModule.name}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>
              </div>

              {/* Bottom nav: counter + prev/next */}
              <div className="mt-6 flex items-center justify-end gap-3 border-t border-danphe-border/30 pt-4">
                <span className="text-sm font-medium text-danphe-text-light">
                  <span className="font-bold text-danphe-primary">{String(activeIdx + 1).padStart(2, '0')}</span>
                  <span className="mx-1">/</span>
                  {String(MODULES.length).padStart(2, '0')}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={goPrev}
                    aria-label="Previous module"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-danphe-primary/20 bg-white/80 text-danphe-primary transition-all duration-200 hover:bg-danphe-primary hover:text-white hover:border-danphe-primary"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={goNext}
                    aria-label="Next module"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-danphe-primary/20 bg-white/80 text-danphe-primary transition-all duration-200 hover:bg-danphe-primary hover:text-white hover:border-danphe-primary"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
