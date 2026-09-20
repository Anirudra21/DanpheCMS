'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const RADIUS = 18;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS; // ~113.1

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleScroll = useCallback(() => {
    const scrollY = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;

    setVisible(scrollY > 400);
    setProgress(Math.min(scrollPercent, 100));
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const strokeDashoffset = CIRCUMFERENCE * (1 - progress / 100);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Scroll to top"
          className="fixed bottom-6 right-6 z-40 flex h-11 w-11 items-center justify-center rounded-full glass shadow-premium"
        >
          <svg
            className="absolute inset-0 h-11 w-11 -rotate-90"
            viewBox="0 0 44 44"
            fill="none"
          >
            <circle
              cx="22"
              cy="22"
              r={RADIUS}
              stroke="currentColor"
              strokeWidth={2}
              className="text-white/20"
            />
            <circle
              cx="22"
              cy="22"
              r={RADIUS}
              stroke="#0d9488"
              strokeWidth={2}
              fill="none"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.15s ease-out' }}
            />
          </svg>
          <ChevronUp className="h-4 w-4 text-danphe-primary" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
