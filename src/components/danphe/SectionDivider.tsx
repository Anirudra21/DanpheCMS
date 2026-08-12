'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

type DividerVariant = 'wave-top' | 'wave-bottom' | 'curve-top' | 'curve-bottom' | 'dots';

interface SectionDividerProps {
  variant?: DividerVariant;
  bgColor?: string;
  fillColor?: string;
}

export default function SectionDivider({ 
  variant = 'wave-bottom',
  bgColor = 'white',
  fillColor = '#f0f6fa',
}: SectionDividerProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-20px' });

  if (variant === 'dots') {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : undefined}
        className="flex items-center justify-center py-4"
      >
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-2 w-2 rounded-full bg-danphe-accent/30"
            />
          ))}
        </div>
      </motion.div>
    );
  }

  const isTop = variant === 'wave-top' || variant === 'curve-top';
  const isCurve = variant === 'curve-top' || variant === 'curve-bottom';

  return (
    <div
      className={`w-full ${isTop ? 'mb-[-1px]' : 'mt-[-1px]'} relative leading-[0]`}
      style={{ backgroundColor: isTop ? fillColor : bgColor }}
    >
      <svg
        className="w-full"
        preserveAspectRatio="none"
        viewBox={isCurve ? '0 0 1440 60' : '0 0 1440 80'}
        style={{ height: isCurve ? '60px' : '80px' }}
      >
        {isCurve ? (
          <path
            d={isTop
              ? 'M0,60 C480,0 960,0 1440,60 L1440,60 L0,60 Z'
              : 'M0,0 C480,60 960,60 1440,0 L1440,60 L0,60 Z'
            }
            fill={isTop ? bgColor : fillColor}
          />
        ) : (
          <path
            d={isTop
              ? 'M0,40 C360,80 720,80 1080,40 C1260,20 1380,20 1440,40 L1440,80 L0,80 Z'
              : 'M0,40 C360,0 720,0 1080,40 C1260,60 1380,60 1440,40 L0,40 Z'
            }
            fill={isTop ? bgColor : fillColor}
          />
        )}
      </svg>
    </div>
  );
}
