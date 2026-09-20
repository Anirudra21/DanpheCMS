'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight, Check } from 'lucide-react';

interface Module {
  name: string;
  slug: string;
  href: string;
  icon: string;
  title: string;
  description: string;
  features: string[];
  image: string;
}

interface ModuleSectionProps {
  modules: Module[];
}

const CATEGORY_MAP: Record<string, string[]> = {
  Clinical: [
    'OPD Management',
    'IPD Management',
    'OT Management',
    'Pathology Software',
  ],
  Administrative: [
    'Patient Administration',
    'SSF Management',
    'Pharmacy',
    'Inventory Management',
  ],
  Support: ['Queue Management'],
};

const CATEGORIES = ['All', 'Clinical', 'Administrative', 'Support'] as const;
type Category = (typeof CATEGORIES)[number];

function getModuleCategory(moduleName: string): Category {
  for (const [cat, names] of Object.entries(CATEGORY_MAP)) {
    if (names.includes(moduleName)) return cat as Category;
  }
  return 'Administrative';
}

const FEATURE_STAGGER = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const FEATURE_ITEM = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

export default function ModuleSection({ modules }: ModuleSectionProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [activeFilter, setActiveFilter] = useState<Category>('All');
  const [showAllFeatures, setShowAllFeatures] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const detailRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-60px' });
  const activeModule = modules[activeIdx];

  if (!modules || modules.length === 0) {
    return null;
  }

  const goPrev = () =>
    setActiveIdx((i) => (i === 0 ? modules.length - 1 : i - 1));
  const goNext = () =>
    setActiveIdx((i) => (i === modules.length - 1 ? 0 : i + 1));

  const selectModule = (idx: number, fromFilteredClick = false) => {
    setActiveIdx(idx);
    setShowAllFeatures(false);
    // If clicking a dimmed (non-matching) module, reset filter to All
    if (fromFilteredClick) {
      setActiveFilter('All');
    }
    // Scroll detail panel into view on mobile
    setTimeout(() => {
      detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
  };

  const handleFilterChange = (cat: Category) => {
    setActiveFilter(cat);
    setShowAllFeatures(false);
  };

  const isModuleVisible = (moduleName: string) => {
    if (activeFilter === 'All') return true;
    return CATEGORY_MAP[activeFilter]?.includes(moduleName) ?? false;
  };

  const activeFeatures = activeModule.features ?? [];
  const visibleFeatures = showAllFeatures ? activeFeatures : activeFeatures.slice(0, 4);

  const hasMoreFeatures = activeFeatures.length > 4;

  return (
    <section
      ref={sectionRef}
      className="relative bg-danphe-bg-light py-20 md:py-28 overflow-x-hidden"
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
          className="mb-8 text-center"
        >
          <h2 className="font-heading text-3xl font-bold text-danphe-primary md:text-4xl">
            Discover a{' '}
            <span className="gradient-text">complete</span>{' '}
            solution for HIMS with EMR
          </h2>
        </motion.div>

        {/* Category Filter Pills */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="mb-8 flex flex-wrap items-center justify-center gap-2"
          role="tablist"
          aria-label="Filter modules by category"
        >
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleFilterChange(cat)}
              role="tab"
              aria-selected={activeFilter === cat}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-300 cursor-pointer ${
                activeFilter === cat
                  ? 'bg-danphe-accent text-white shadow-sm'
                  : 'bg-white border border-danphe-border/50 text-danphe-text hover:border-danphe-accent/40 hover:text-danphe-primary'
              }`}
            >
              {cat}
            </button>
          ))}
        </motion.div>

        {/* 3x3 Bento Grid */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {modules.map((mod, idx) => {
              const visible = isModuleVisible(mod.name);
              const isActive = idx === activeIdx;
              return (
                <motion.button
                  key={mod.name}
                  layout
                  initial={{ opacity: 0, y: 20, scale: 0.97 }}
                  animate={
                    isInView
                      ? {
                          opacity: visible ? 1 : 0.4,
                          y: 0,
                          scale: visible ? 1 : 0.98,
                        }
                      : {}
                  }
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{
                    duration: 0.4,
                    ease: 'easeOut',
                    delay: idx * 0.06,
                  }}
                  onClick={() => selectModule(idx, !visible)}
                  className={`group relative flex flex-col items-center gap-2.5 rounded-2xl border p-4 md:p-5 text-left transition-all duration-300 md:items-start ${
                    isActive
                      ? 'ring-2 ring-danphe-accent bg-danphe-bg-alt border-danphe-accent/30 shadow-premium'
                      : 'bg-white border-danphe-border/50 shadow-premium hover:shadow-premium-lg hover:scale-[1.02] hover:border-danphe-accent/30'
                  }`}
                  aria-label={`View ${mod.name} details`}
                >
                  {/* Feature Count Badge */}
                    <span className="absolute top-2 right-2 z-10 rounded-full bg-danphe-accent/10 text-danphe-accent text-[10px] font-bold px-1.5 py-0.5 leading-none">
                    {(mod.features ?? []).length}
                  </span>

                  {/* Icon in colored circle */}
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors duration-300 ${
                      isActive
                        ? 'bg-danphe-accent/15'
                        : 'bg-danphe-primary/5 group-hover:bg-danphe-accent/10'
                    }`}
                  >
                    {mod.icon ? (
                      <Image
                        src={mod.icon}
                        alt={`${mod.name} icon`}
                        width={22}
                        height={22}
                        unoptimized
                        className={`h-5 w-5 object-contain transition-all duration-300 ${
                          isActive
                            ? 'brightness-0 saturate-100'
                            : ''
                        }`}
                      />
                    ) : (
                      <div className="h-5 w-5" aria-hidden />
                    )}
                  </div>
                  {/* Module name */}
                  <span
                    className={`text-xs font-semibold leading-tight ${
                      isActive
                        ? 'text-danphe-primary'
                        : 'text-danphe-text group-hover:text-danphe-primary'
                    }`}
                  >
                    {mod.name}
                  </span>
                  {/* Title - truncated to 1 line */}
                  <span className="text-[11px] leading-tight text-danphe-text/70 line-clamp-1">
                    {mod.title}
                  </span>
                </motion.button>
              );
            })}
          </AnimatePresence>
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

                  {/* Key Features */}
                  <div className="mb-6">
                    <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-danphe-primary/70">
                      Key Features
                    </h4>
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeIdx}
                        variants={FEATURE_STAGGER}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 sm:grid-cols-2 gap-2"
                      >
                        {visibleFeatures.map((feature, fIdx) => (
                          <motion.div
                            key={`${activeIdx}-${fIdx}`}
                            variants={FEATURE_ITEM}
                            className="flex items-start gap-2"
                          >
                            <Check className="h-3.5 w-3.5 flex-shrink-0 mt-0.5 text-danphe-accent" />
                            <span className="text-xs text-danphe-text">
                              {feature}
                            </span>
                          </motion.div>
                        ))}
                      </motion.div>
                    </AnimatePresence>

                    {hasMoreFeatures && (
                      <button
                        onClick={() => setShowAllFeatures((prev) => !prev)}
                        className="mt-3 text-xs font-semibold text-danphe-accent hover:text-danphe-primary transition-colors cursor-pointer underline decoration-danphe-accent/30 underline-offset-2"
                      >
                        {showAllFeatures ? 'Show Less' : 'Show All Features'}
                      </button>
                    )}
                  </div>

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
                  {activeModule.image ? (
                    <Image
                      src={activeModule.image}
                      alt={activeModule.name}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  ) : (
                    <div aria-hidden className="h-full w-full bg-gray-50" />
                  )}
                </div>
              </div>

              {/* Bottom nav: counter + prev/next */}
              <div className="mt-6 flex items-center justify-end gap-3 border-t border-danphe-border/30 pt-4">
                <span className="text-sm font-medium text-danphe-text">
                  <span className="font-bold text-danphe-primary">{String(activeIdx + 1).padStart(2, '0')}</span>
                  <span className="mx-1">/</span>
                  {String(modules.length).padStart(2, '0')}
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
