'use client';

import { Button } from '@/components/ui/button';
import { Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function StickyContact() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="fixed bottom-6 left-6 z-50"
        >
          <Button
            size="icon"
            aria-label="Contact Us"
            className="h-12 w-12 rounded-full bg-danphe-accent shadow-lg hover:bg-danphe-accent-light"
            asChild
          >
            <a href="#contact" className="flex items-center justify-center">
              <Phone className="h-5 w-5 text-white" />
            </a>
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
