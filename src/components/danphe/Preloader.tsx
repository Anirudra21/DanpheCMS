'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

export default function Preloader() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          key="preloader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: 'easeInOut' }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-danphe-dark"
        >
          <div className="flex flex-col items-center gap-5">
            <motion.div
              animate={{ scale: [1, 1.04, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Image
                src="/images/logo/logo.png"
                alt="Danphe Health"
                width={192}
                height={48}
                unoptimized
                className="h-12 w-auto brightness-0 invert"
              />
            </motion.div>

            {/* Progress bar with shimmer effect */}
            <div className="h-1 w-40 overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-danphe-accent via-danphe-accent-light to-danphe-accent"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 1.2, ease: 'easeInOut' }}
              />
            </div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.6, 0.6] }}
              transition={{ duration: 1.2 }}
              className="text-xs text-white/60"
            >
              Loading your healthcare solution…
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
