'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  Users,
  Briefcase,
  Newspaper,
  Phone,
  Menu,
  X,
} from 'lucide-react';

interface NavItem {
  label: string;
  icon: React.ElementType;
  href: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Company', icon: Building2, href: '#company' },
  { label: 'Our Clients', icon: Users, href: '#trusted' },
  { label: 'Career', icon: Briefcase, href: '#career' },
  { label: 'News & Events', icon: Newspaper, href: '#news' },
  { label: 'Contact Us', icon: Phone, href: '#contact' },
];

export default function FloatingSideNav() {
  const [expanded, setExpanded] = useState(false);
  const [visible, setVisible] = useState(false);

  const handleScroll = useCallback(() => {
    setVisible(window.scrollY > 300);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setExpanded(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const handleClick = (href: string) => {
    setExpanded(false);
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 60 }}
          transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="fixed right-5 top-1/2 z-40 -translate-y-1/2 hidden lg:flex flex-col items-end gap-2"
          role="navigation"
          aria-label="Quick navigation"
        >
          {/* Expanded pill items - render above the toggle in DOM flow for proper stacking */}
          <AnimatePresence>
            {expanded &&
              NAV_ITEMS.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <motion.button
                    key={item.label}
                    initial={{ opacity: 0, x: 30, scale: 0.8 }}
                    animate={{
                      opacity: 1,
                      x: 0,
                      scale: 1,
                      transition: {
                        duration: 0.3,
                        delay: idx * 0.06,
                        ease: [0.25, 0.46, 0.45, 0.94],
                      },
                    }}
                    exit={{
                      opacity: 0,
                      x: 30,
                      scale: 0.8,
                      transition: {
                        duration: 0.2,
                        delay: (NAV_ITEMS.length - 1 - idx) * 0.04,
                        ease: [0.55, 0.06, 0.68, 0.19],
                      },
                    }}
                    onClick={() => handleClick(item.href)}
                    className="group relative flex items-center gap-2.5 whitespace-nowrap rounded-full
                      border border-cyan-500/20 bg-[#0a1628]/90 px-4 py-2.5
                      shadow-[0_0_15px_rgba(6,182,212,0.08),inset_0_1px_0_rgba(255,255,255,0.04)]
                      backdrop-blur-xl transition-all duration-300
                      hover:border-cyan-400/40 hover:shadow-[0_0_25px_rgba(6,182,212,0.15),0_0_50px_rgba(6,182,212,0.05)]
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50"
                    aria-label={item.label}
                  >
                    {/* Left accent bar on hover */}
                    <span className="absolute left-0 top-1/2 h-0 w-[2px] -translate-y-1/2 rounded-full bg-cyan-400 transition-all duration-300 group-hover:h-5" />

                    <Icon className="h-4 w-4 text-cyan-400/80 transition-colors duration-300 group-hover:text-cyan-300" />
                    <span className="text-[13px] font-medium text-white/80 transition-colors duration-300 group-hover:text-white">
                      {item.label}
                    </span>
                  </motion.button>
                );
              })}
          </AnimatePresence>

          {/* Circular hamburger toggle button */}
          <motion.button
            onClick={() => setExpanded((v) => !v)}
            whileTap={{ scale: 0.92 }}
            className="relative flex h-12 w-12 items-center justify-center rounded-full
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
