'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  Users,
  Briefcase,
  Newspaper,
  Phone,
  Menu,
  X,
  Layers,
  MessageCircle,
} from 'lucide-react';

interface SideNavItem {
  label: string;
  icon: React.ElementType;
  href: string;
}

/* All 7 site navigation links */
const SIDE_NAV_ITEMS: SideNavItem[] = [
  { label: 'Company', icon: Building2, href: '/company' },
  { label: 'Our Solution', icon: Layers, href: '/solutions' },
  { label: 'Our Clients', icon: Users, href: '/clients' },
  { label: 'Career', icon: Briefcase, href: '/careers' },
  { label: 'News & Events', icon: Newspaper, href: '/news-events' },
  { label: 'Danphe Community', icon: MessageCircle, href: '/danphe-community' },
  { label: 'Contact Us', icon: Phone, href: '/contact' },
];

const easeOut = [0.25, 0.46, 0.45, 0.94];
const easeIn = [0.55, 0.06, 0.68, 0.19];

export default function FloatingSideNav() {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(false);
  const [visible, setVisible] = useState(false);

  const handleScroll = useCallback(() => {
    setVisible(window.scrollY > 300);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  /* Close on route change */
  useEffect(() => {
    const id = requestAnimationFrame(() => setExpanded(false));
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  /* Close on Escape */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setExpanded(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 60 }}
          transition={{ duration: 0.35, ease: easeOut }}
          className="fixed right-5 top-1/2 z-40 -translate-y-1/2 hidden lg:flex flex-col items-end gap-2"
          role="navigation"
          aria-label="Quick navigation"
        >
          {/* ── Expanded pill items (white design) ── */}
          <AnimatePresence>
            {expanded &&
              SIDE_NAV_ITEMS.map((item, idx) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: 30, scale: 0.8 }}
                    animate={{
                      opacity: 1,
                      x: 0,
                      scale: 1,
                      transition: {
                        duration: 0.3,
                        delay: idx * 0.05,
                        ease: easeOut,
                      },
                    }}
                    exit={{
                      opacity: 0,
                      x: 30,
                      scale: 0.8,
                      transition: {
                        duration: 0.2,
                        delay: (SIDE_NAV_ITEMS.length - 1 - idx) * 0.03,
                        ease: easeIn,
                      },
                    }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setExpanded(false)}
                      aria-label={item.label}
                      aria-current={isActive ? 'page' : undefined}
                      className={
                        'group relative flex items-center gap-2.5 whitespace-nowrap rounded-full px-4 py-2.5 ' +
                        'backdrop-blur-xl transition-all duration-300 ' +
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50 ' +
                        (isActive
                          ? 'bg-cyan-50 border border-cyan-400/40 shadow-[0_0_20px_rgba(6,182,212,0.15),0_2px_8px_rgba(0,0,0,0.06)]'
                          : 'bg-white/95 border border-gray-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_12px_rgba(0,0,0,0.04)] ' +
                            'hover:border-cyan-300/50 hover:shadow-[0_0_20px_rgba(6,182,212,0.12),0_4px_16px_rgba(0,0,0,0.08)]'
                        )
                      }
                    >
                      {/* Left accent bar on hover / active */}
                      <span className={
                        'absolute left-0 top-1/2 w-[2.5px] -translate-y-1/2 rounded-full bg-cyan-400 transition-all duration-300 ' +
                        (isActive ? 'h-6' : 'h-0 group-hover:h-5')
                      } />

                      <Icon className={
                        'h-4 w-4 transition-colors duration-300 ' +
                        (isActive
                          ? 'text-cyan-600'
                          : 'text-cyan-500/70 group-hover:text-cyan-500'
                        )
                      } />
                      <span className={
                        'text-[13px] font-medium transition-colors duration-300 ' +
                        (isActive
                          ? 'text-cyan-700'
                          : 'text-gray-700 group-hover:text-gray-900'
                        )
                      }>
                        {item.label}
                      </span>
                    </Link>
                  </motion.div>
                );
              })}
          </AnimatePresence>

          {/* ── Circular hamburger toggle (dark) ── */}
          <motion.button
            onClick={() => setExpanded((v) => !v)}
            whileTap={{ scale: 0.92 }}
            className="group relative flex h-12 w-12 items-center justify-center rounded-full
              border border-cyan-500/30 bg-[#0a1628]/95
              shadow-[0_0_20px_rgba(6,182,212,0.12),0_4px_20px_rgba(0,0,0,0.3)]
              backdrop-blur-xl transition-all duration-300
              hover:border-cyan-400/50 hover:shadow-[0_0_30px_rgba(6,182,212,0.2),0_4px_25px_rgba(0,0,0,0.4)]
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50"
            aria-label={expanded ? 'Close quick navigation' : 'Open quick navigation'}
            aria-expanded={expanded}
          >
            {/* Subtle rotating ring glow */}
            <span className="pointer-events-none absolute inset-0 rounded-full border border-cyan-400/10 transition-all duration-500 group-hover:border-cyan-400/20" />
            <span className="pointer-events-none absolute -inset-0.5 rounded-full bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

            <AnimatePresence mode="wait" initial={false}>
              {expanded ? (
                <motion.span
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-cyan-400"
                >
                  <X className="h-5 w-5" />
                </motion.span>
              ) : (
                <motion.span
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-cyan-400"
                >
                  <Menu className="h-5 w-5" />
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
