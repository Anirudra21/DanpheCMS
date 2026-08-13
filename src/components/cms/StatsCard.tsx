'use client';

import { useEffect, useRef, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/cms-utils';
import { motion } from 'framer-motion';

interface StatsCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  trend?: string;
  color?: string;
}

function useCountUp(target: number, duration = 1200) {
  const [count, setCount] = useState(0);
  const startTime = useRef<number | null>(null);
  const rafId = useRef<number>(0);

  useEffect(() => {
    startTime.current = null;

    const animate = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp;
      const progress = Math.min((timestamp - startTime.current) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      setCount(Math.floor(eased * target));

      if (progress < 1) {
        rafId.current = requestAnimationFrame(animate);
      } else {
        setCount(target);
      }
    };

    rafId.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(rafId.current);
  }, [target, duration]);

  return count;
}

export function StatsCard({ title, value, icon: Icon, trend, color = 'bg-danphe-accent/10 text-danphe-accent' }: StatsCardProps) {
  const animatedValue = useCountUp(value);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <Card className="border-danphe-border/60 hover:shadow-premium transition-shadow">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <p className="text-3xl font-bold text-danphe-text tabular-nums">
                {animatedValue.toLocaleString()}
              </p>
              {trend && (
                <p className={cn(
                  'text-xs font-medium',
                  trend.startsWith('+') ? 'text-danphe-success' : 'text-red-500'
                )}>
                  {trend}
                </p>
              )}
            </div>
            <div className={cn('rounded-lg p-2.5', color)}>
              <Icon className="h-5 w-5" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
