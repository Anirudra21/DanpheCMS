'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { MapPin, Globe } from 'lucide-react';

const mapDots = [
  { name: 'Kathmandu, Nepal', top: '48%', left: '68%', primary: true },
  { name: 'Pokhara', top: '52%', left: '62%', primary: false },
  { name: 'Biratnagar', top: '46%', left: '78%', primary: false },
  { name: 'Butwal', top: '56%', left: '60%', primary: false },
];

const connectionLines = [
  { x1: '68%', y1: '48%', x2: '62%', y2: '52%' },
  { x1: '68%', y1: '48%', x2: '78%', y2: '46%' },
  { x1: '68%', y1: '48%', x2: '60%', y2: '56%' },
];

export default function InternationalSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section
      ref={ref}
      className="bg-white py-20 md:py-28"
      aria-label="International Reach"
    >
      <div className="mx-auto max-w-7xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <h2 className="font-heading mb-4 text-3xl font-bold text-danphe-primary md:text-4xl">
            Trusted Across Borders
          </h2>
          <p className="mx-auto max-w-2xl text-base text-danphe-text-light">
            From urban hospitals in Kathmandu to healthcare institutions across
            regions, DANPHE powers critical hospital operations wherever they
            are needed.
          </p>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-12">
          {/* Left side — stat blocks */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="flex flex-col gap-6 lg:col-span-5"
          >
            {/* Nepal card */}
            <div className="glass rounded-2xl p-6 shadow-premium">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-danphe-accent/10">
                  <MapPin className="h-5 w-5 text-danphe-accent" />
                </div>
                <h3 className="font-heading text-lg font-semibold text-danphe-primary">
                  Nepal
                </h3>
              </div>
              <p className="font-heading mb-1 text-2xl font-bold text-danphe-text">
                60+ Hospitals
              </p>
              <p className="text-sm text-danphe-text-light">
                Headquarters: Kathmandu
              </p>
            </div>

            {/* Growing presence card */}
            <div className="glass rounded-2xl p-6 shadow-premium">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-danphe-accent/10">
                  <Globe className="h-5 w-5 text-danphe-accent" />
                </div>
                <h3 className="font-heading text-lg font-semibold text-danphe-primary">
                  Growing Global Presence
                </h3>
              </div>
              <p className="text-sm leading-relaxed text-danphe-text-light">
                Expanding to serve healthcare institutions internationally,
                bringing modern HMIS solutions to regions that need them most.
              </p>
            </div>
          </motion.div>

          {/* Right side — stylized map */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="lg:col-span-7"
          >
            <div className="relative overflow-hidden rounded-3xl bg-danphe-dark p-8 md:p-10">
              {/* Dot grid background */}
              <div
                className="absolute inset-0 opacity-[0.08]"
                style={{
                  backgroundImage:
                    'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
                  backgroundSize: '24px 24px',
                }}
              />

              {/* SVG world outline (simplified continent shapes) */}
              <svg
                className="absolute inset-0 h-full w-full opacity-[0.12]"
                viewBox="0 0 800 500"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* North America */}
                <path
                  d="M120 80 L180 60 L220 70 L240 100 L250 130 L240 160 L220 180 L200 200 L170 210 L140 200 L110 180 L100 150 L105 120 L115 100 Z"
                  stroke="rgba(255,255,255,0.6)"
                  strokeWidth="1"
                />
                {/* South America */}
                <path
                  d="M200 230 L220 220 L240 240 L250 280 L240 320 L230 360 L210 380 L190 370 L180 340 L185 300 L190 260 Z"
                  stroke="rgba(255,255,255,0.6)"
                  strokeWidth="1"
                />
                {/* Europe */}
                <path
                  d="M370 60 L400 50 L430 55 L445 70 L440 90 L425 105 L400 110 L380 100 L370 85 Z"
                  stroke="rgba(255,255,255,0.6)"
                  strokeWidth="1"
                />
                {/* Africa */}
                <path
                  d="M380 140 L410 130 L440 145 L460 170 L465 210 L460 260 L445 300 L420 320 L400 310 L385 280 L380 240 L375 200 L375 170 Z"
                  stroke="rgba(255,255,255,0.6)"
                  strokeWidth="1"
                />
                {/* Asia */}
                <path
                  d="M450 40 L500 30 L560 35 L610 50 L650 70 L670 100 L680 130 L670 160 L650 170 L620 160 L590 150 L560 155 L530 150 L500 140 L470 130 L450 110 L445 80 L445 55 Z"
                  stroke="rgba(255,255,255,0.6)"
                  strokeWidth="1"
                />
                {/* Southeast Asia */}
                <path
                  d="M580 180 L610 170 L640 185 L655 210 L645 240 L620 255 L595 245 L580 220 L575 200 Z"
                  stroke="rgba(255,255,255,0.6)"
                  strokeWidth="1"
                />
                {/* Australia */}
                <path
                  d="M620 300 L660 290 L690 300 L700 320 L695 350 L675 365 L650 360 L630 345 L620 325 Z"
                  stroke="rgba(255,255,255,0.6)"
                  strokeWidth="1"
                />
              </svg>

              {/* Connection lines */}
              <svg
                className="absolute inset-0 h-full w-full"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                {connectionLines.map((line, i) => (
                  <line
                    key={i}
                    x1={line.x1}
                    y1={line.y1}
                    x2={line.x2}
                    y2={line.y2}
                    stroke="rgba(13, 148, 136, 0.3)"
                    strokeWidth="0.15"
                    strokeDasharray="2,2"
                  />
                ))}
              </svg>

              {/* Glowing dots for hospital locations */}
              {mapDots.map((dot, idx) => (
                <motion.div
                  key={dot.name}
                  className="absolute"
                  style={{ top: dot.top, left: dot.left }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={
                    isInView ? { opacity: 1, scale: 1 } : {}
                  }
                  transition={{
                    duration: 0.4,
                    delay: 0.4 + idx * 0.12,
                    type: 'spring',
                    stiffness: 200,
                  }}
                >
                  {/* Ping ring for primary dot */}
                  {dot.primary && (
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-danphe-accent opacity-30" />
                  )}
                  <div
                    className={`rounded-full ${
                      dot.primary
                        ? 'h-3.5 w-3.5 bg-danphe-accent shadow-[0_0_16px_rgba(13,148,136,0.5)]'
                        : 'h-2.5 w-2.5 bg-danphe-accent/70 shadow-[0_0_10px_rgba(13,148,136,0.3)]'
                    }`}
                  />
                  {/* Label for primary dot */}
                  {dot.primary && (
                    <span className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-white/10 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
                      {dot.name}
                    </span>
                  )}
                </motion.div>
              ))}

              {/* Corner branding */}
              <div className="relative z-10 mt-auto flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-danphe-accent" />
                <span className="text-xs font-medium text-white/50">
                  Hospital Network Coverage
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
