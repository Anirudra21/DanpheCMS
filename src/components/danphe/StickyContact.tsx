'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function StickyContact() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
          className="fixed bottom-6 left-6 z-40"
        >
          <Link
            href="/contact"
            aria-label="Contact Us"
            className="relative flex h-12 w-12 items-center justify-center rounded-full bg-danphe-accent text-white shadow-glow-accent transition-all hover:bg-danphe-accent-light hover:shadow-lg"
          >
            {/* Pulse ring */}
            <span className="absolute inset-0 animate-ping rounded-full bg-danphe-accent opacity-20" />
            <MessageCircle className="h-5 w-5" />
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
