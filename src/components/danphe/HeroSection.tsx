'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Calendar,
  ArrowRight,
  Building2,
  Layers,
  Globe,
  Clock,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  useCounter — animates a number from 0 → target using rAF          */
/* ------------------------------------------------------------------ */
function useCounter(target: number, duration = 2000, startOnMount = true, startDelay = 0) {
  const [count, setCount] = useState(0);
  const hasStarted = useRef(false);

  useEffect(() => {
    if (!startOnMount || hasStarted.current) return;
    hasStarted.current = true;

    const timeout = setTimeout(() => {
      let startTime: number | null = null;
      let rafId: number;

      const step = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        // Ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        setCount(Math.floor(eased * target));
        if (progress < 1) {
          rafId = requestAnimationFrame(step);
        } else {
          setCount(target);
        }
      };

      rafId = requestAnimationFrame(step);
      return () => cancelAnimationFrame(rafId);
    }, startDelay);

    return () => clearTimeout(timeout);
  }, [target, duration, startOnMount, startDelay]);

  return count;
}

/* ------------------------------------------------------------------ */
/*  Stats data                                                        */
/* ------------------------------------------------------------------ */
const stats = [
  { icon: Building2, value: 60, suffix: '+', label: 'Hospitals' },
  { icon: Layers, value: 9, suffix: '+', label: 'Integrated Modules' },
  { icon: Globe, value: 100, suffix: '%', label: 'Web-Based' },
  { icon: Clock, value: 24, suffix: '/7', label: 'Support' },
];

/* ------------------------------------------------------------------ */
/*  Chart bar heights                                                 */
/* ------------------------------------------------------------------ */
const chartBarHeights = [40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88];

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */
export default function HeroSection() {
  const hospitals = useCounter(60, 2200);
  const modules = useCounter(9, 1600);
  const webBased = useCounter(100, 2400);
  const support = useCounter(24, 1800);

  // Dashboard stat counters (start after 1.5s preloader delay + extra offset)
  const patientsToday = useCounter(247, 1800, true, 2000);
  const bedsOccupied = useCounter(182, 1800, true, 2300);
  // NRs 1.2M is handled via fade-in

  // Floating card counter
  const floatingHospitals = useCounter(60, 1600, true, 2500);

  const counters = [hospitals, modules, webBased, support];

  // Base delay for dashboard animations (accounts for preloader)
  const dashDelay = 1.5;

  return (
    <section
      className="relative min-h-screen overflow-hidden mesh-gradient-hero dot-pattern"
      aria-label="Hero"
    >
      {/* ---- Additional floating blur circles (background enhancement) ---- */}
      <motion.div
        className="absolute top-20 -left-32 h-96 w-96 rounded-full bg-danphe-accent/5 blur-3xl pointer-events-none"
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-1/3 -right-20 h-80 w-80 rounded-full bg-danphe-primary/5 blur-3xl pointer-events-none"
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />
      <motion.div
        className="absolute bottom-32 left-1/4 h-64 w-64 rounded-full bg-danphe-accent-light/5 blur-3xl pointer-events-none"
        animate={{ y: [0, -18, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/3 h-72 w-72 rounded-full bg-danphe-primary-light/5 blur-3xl pointer-events-none"
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
      />

      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col items-center px-4 pt-32 pb-24 lg:flex-row lg:items-center lg:px-6 lg:pt-0 lg:pb-0">
        {/* ---- LEFT: Text content ---- */}
        <div className="relative z-10 flex flex-1 flex-col items-center text-center lg:items-start lg:text-left">
          {/* Badge pill */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-medium tracking-wide text-white/60 backdrop-blur-sm">
              Open-Source &nbsp;•&nbsp; Enterprise-Grade &nbsp;•&nbsp; HMIS/EMR/EHR
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 max-w-2xl font-heading text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl lg:text-[3.25rem] xl:text-6xl"
          >
            Enterprise-Grade, Open-Source Hospital Management System
          </motion.h1>

          {/* Sub-headline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="mt-5 max-w-xl font-heading text-lg font-semibold text-white/80 md:text-xl"
          >
            Complete HIMS with Integrated EMR & EHR — Trusted by 60+ Hospitals
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4"
          >
            <Link
              href="/schedule-a-demo"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-danphe-accent px-6 py-3 text-sm font-semibold text-white shadow-glow-accent transition-all hover:bg-danphe-accent-light hover:shadow-lg"
            >
              <Calendar className="h-4 w-4" />
              Schedule a Demo
            </Link>
            <Link
              href="/solutions"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/10"
            >
              Explore Solutions
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>

          {/* Stats row — glass cards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.65 }}
            className="mt-12 grid w-full max-w-2xl grid-cols-2 gap-3 sm:mt-14 lg:max-w-none lg:grid-cols-4"
          >
            {stats.map((stat, idx) => (
              <div
                key={stat.label}
                className="glass-dark flex flex-col items-center gap-1.5 rounded-xl px-4 py-4"
              >
                <stat.icon className="h-5 w-5 text-danphe-accent-light" />
                <span className="text-2xl font-bold text-white md:text-3xl">
                  {counters[idx]}
                  {stat.suffix}
                </span>
                <span className="text-xs text-white/50">{stat.label}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* ---- RIGHT: Dashboard mockup (lg+ only) ---- */}
        <motion.div
          initial={{ opacity: 0, x: 40, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
          className="relative mt-14 hidden flex-1 lg:mt-0 lg:flex lg:justify-end lg:pl-8"
        >
          <div className="relative w-full max-w-lg">
            {/* Decorative glow behind */}
            <div className="absolute -inset-4 rounded-3xl bg-danphe-accent/10 blur-3xl" />

            {/* Main dashboard card */}
            <div className="relative rounded-2xl border border-white/10 bg-danphe-dark/90 shadow-premium-lg overflow-hidden">
              {/* Top bar */}
              <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
                <div className="flex gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-green-400/80" />
                </div>
                <div className="ml-3 flex-1 rounded-md bg-white/5 px-3 py-1 text-xs text-white/30">
                  danphehealth.com/hims/dashboard
                </div>
              </div>

              <div className="flex">
                {/* Fake sidebar */}
                <div className="hidden w-44 flex-shrink-0 border-r border-white/10 p-3 sm:block">
                  <div className="mb-4 flex items-center gap-2">
                    <div className="h-6 w-6 rounded-md bg-danphe-accent/80" />
                    <div className="h-2.5 w-16 rounded bg-white/20" />
                  </div>
                  {['Dashboard', 'Patient Admin', 'OPD', 'IPD', 'Pharmacy', 'Lab', 'Inventory', 'Reports'].map(
                    (item, i) => (
                      <div
                        key={item}
                        className={`mb-1 flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[10px] ${
                          i === 0
                            ? 'bg-danphe-accent/20 text-danphe-accent-light font-medium'
                            : 'text-white/40'
                        }`}
                      >
                        <div
                          className={`h-3 w-3 rounded-sm ${
                            i === 0 ? 'bg-danphe-accent-light/60' : 'bg-white/10'
                          }`}
                        />
                        {item}
                      </div>
                    )
                  )}
                </div>

                {/* Fake content area */}
                <div className="flex-1 p-4">
                  {/* Stat cards row — animated */}
                  <div className="mb-4 grid grid-cols-3 gap-2">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: dashDelay + 0.2 }}
                      className="rounded-lg bg-danphe-accent/30 p-2.5"
                    >
                      <div className="text-[9px] text-white/40">Patients Today</div>
                      <div className="mt-0.5 text-sm font-semibold text-white">
                        {patientsToday}
                      </div>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: dashDelay + 0.5 }}
                      className="rounded-lg bg-danphe-primary-light/30 p-2.5"
                    >
                      <div className="text-[9px] text-white/40">Beds Occupied</div>
                      <div className="mt-0.5 text-sm font-semibold text-white">
                        {bedsOccupied}
                      </div>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: dashDelay + 0.8 }}
                      className="rounded-lg bg-emerald-500/20 p-2.5"
                    >
                      <div className="text-[9px] text-white/40">Revenue</div>
                      <div className="mt-0.5 text-sm font-semibold text-white">
                        NRs 1.2M
                      </div>
                    </motion.div>
                  </div>

                  {/* Chart placeholder — animated bars */}
                  <div className="mb-4 rounded-lg border border-white/5 bg-white/[0.03] p-3">
                    <div className="mb-2 h-2.5 w-24 rounded bg-white/15" />
                    <div className="flex items-end gap-1.5 h-20">
                      {chartBarHeights.map((h, i) => (
                        <motion.div
                          key={i}
                          className="flex-1 rounded-t-sm bg-gradient-to-t from-danphe-accent/50 to-danphe-accent-light/70"
                          initial={{ height: '0%' }}
                          animate={{ height: `${h}%` }}
                          transition={{
                            duration: 0.6,
                            delay: dashDelay + 0.3 + i * 0.08,
                            ease: 'easeOut',
                          }}
                        >
                          <motion.div
                            className="h-full w-full rounded-t-sm bg-gradient-to-t from-danphe-accent/50 to-danphe-accent-light/70"
                            animate={{ opacity: [0.85, 1, 0.85] }}
                            transition={{
                              duration: 3,
                              repeat: Infinity,
                              ease: 'easeInOut',
                              delay: dashDelay + 0.3 + i * 0.08 + 0.6,
                            }}
                          />
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Recent activity — animated rows with pulsing dots */}
                  <div className="rounded-lg border border-white/5 bg-white/[0.03] p-3">
                    <div className="mb-2 h-2.5 w-20 rounded bg-white/15" />
                    {[
                      'OPD-1024 • Dr. Sharma',
                      'IPD-Bed 12 • Discharged',
                      'Lab Report Ready • Patient #890',
                    ].map((row, i) => (
                      <motion.div
                        key={row}
                        className="mb-1.5 flex items-center gap-2 text-[10px] text-white/40"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          duration: 0.4,
                          delay: dashDelay + 0.5 + i * 0.15,
                          ease: 'easeOut',
                        }}
                      >
                        <motion.span
                          className="inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-400"
                          animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: 'easeInOut',
                            delay: i * 0.3,
                          }}
                        />
                        {row}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Floating decoration card — System Status (enhanced glassmorphism) */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -bottom-4 -left-6 rounded-xl shadow-lg"
            >
              {/* Rotating border glow effect */}
              <motion.div
                className="absolute -inset-px rounded-xl overflow-hidden"
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                style={{ zIndex: 0 }}
              >
                <div
                  className="h-full w-full"
                  style={{
                    background: 'conic-gradient(from 0deg, transparent 0%, rgba(22, 160, 133, 0.2) 25%, transparent 50%, rgba(22, 160, 133, 0.15) 75%, transparent 100%)',
                  }}
                />
              </motion.div>
              <div className="relative z-10 flex items-center gap-2 rounded-xl border border-white/[0.12] bg-white/[0.08] px-3 py-2 backdrop-blur-md">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/20">
                  <span className="text-xs">✓</span>
                </div>
                <div>
                  <div className="text-[10px] text-white/40">System Status</div>
                  <div className="text-xs font-medium text-emerald-400">All Systems Operational</div>
                </div>
              </div>
            </motion.div>

            {/* Floating decoration card — Active Hospitals (enhanced glassmorphism + animated counter) */}
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="absolute -top-3 -right-4 rounded-xl shadow-lg"
            >
              {/* Rotating border glow effect */}
              <motion.div
                className="absolute -inset-px rounded-xl overflow-hidden"
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                style={{ zIndex: 0 }}
              >
                <div
                  className="h-full w-full"
                  style={{
                    background: 'conic-gradient(from 180deg, transparent 0%, rgba(26, 82, 118, 0.2) 25%, transparent 50%, rgba(22, 160, 133, 0.15) 75%, transparent 100%)',
                  }}
                />
              </motion.div>
              <div className="relative z-10 flex items-center gap-2 rounded-xl border border-white/[0.12] bg-white/[0.08] px-3 py-2 backdrop-blur-md">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-danphe-accent/20">
                  <Building2 className="h-3.5 w-3.5 text-danphe-accent-light" />
                </div>
                <div>
                  <div className="text-[10px] text-white/40">Active Hospitals</div>
                  <div className="text-xs font-medium text-white">
                    {floatingHospitals}+ Connected
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Bottom gradient fade to white (subtle, 160px) */}
      <div className="absolute bottom-0 left-0 w-full"
        style={{
          height: '160px',
          background: 'linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.3) 40%, rgba(255,255,255,0.7) 70%, white 100%)',
        }}
      />
    </section>
  );
}
