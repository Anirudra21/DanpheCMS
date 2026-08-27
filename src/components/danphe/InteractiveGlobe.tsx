'use client';

import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { motion, useInView } from 'framer-motion';
import { MapPin, Globe } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────

export interface GlobeCountryData {
  id: string;
  countryName: string;
  latitude: number;
  longitude: number;
  hospitalCount: number;
  displayLabel: string;
  isHighlighted: boolean;
  isActive: boolean;
  order: number;
}

interface InteractiveGlobeProps {
  countries: GlobeCountryData[];
  heading: string;
  subheading: string;
}

// ─── Constants ────────────────────────────────────────────────────────────

const ACCENT_R = 13;
const ACCENT_G = 148;
const ACCENT_B = 136;
const ACCENT = `rgba(${ACCENT_R}, ${ACCENT_G}, ${ACCENT_B}`;
const HIGHLIGHT_R = 7;
const HIGHLIGHT_G = 194;
const HIGHLIGHT_B = 188;

// Simplified continent outlines as lat/lng polygons
const CONTINENTS: { points: [number, number][] }[] = [
  // North America
  { points: [[-130,55],[-125,60],[-120,65],[-100,70],[-80,70],[-65,60],[-55,47],[-65,45],[-75,35],[-80,25],[-90,18],[-100,20],[-105,25],[-115,30],[-120,35],[-125,45],[-130,55]] },
  // South America
  { points: [[-80,10],[-75,5],[-70,5],[-60,5],[-50,0],[-35,-5],[-35,-15],[-40,-22],[-50,-25],[-55,-35],[-65,-55],[-70,-50],[-75,-40],[-75,-20],[-80,-5],[-80,10]] },
  // Europe
  { points: [[-10,36],[0,38],[5,43],[0,48],[-5,48],[0,52],[5,55],[10,55],[15,55],[20,55],[25,60],[30,65],[35,65],[40,62],[45,55],[30,45],[25,40],[20,36],[15,38],[10,40],[5,42],[0,38],[-10,36]] },
  // Africa
  { points: [[-15,15],[-15,30],[0,35],[10,37],[15,33],[25,32],[30,30],[35,28],[40,15],[50,12],[45,0],[40,-10],[35,-20],[30,-30],[25,-35],[20,-35],[15,-25],[10,-5],[5,5],[0,5],[-5,5],[-10,8],[-15,15]] },
  // Asia
  { points: [[30,35],[35,35],[40,38],[50,40],[55,45],[60,45],[65,50],[70,55],[80,55],[90,50],[100,50],[105,45],[110,40],[115,35],[120,35],[125,40],[130,45],[135,45],[140,45],[145,50],[140,55],[135,60],[130,55],[125,50],[120,55],[110,55],[100,55],[90,60],[80,65],[70,65],[60,60],[50,55],[45,50],[40,45],[35,40],[30,35]] },
  // India subcontinent
  { points: [[68,30],[72,25],[75,20],[78,15],[80,10],[80,8],[78,10],[75,12],[73,15],[70,20],[68,25],[68,30]] },
  // Southeast Asia
  { points: [[100,20],[105,15],[110,10],[110,5],[115,0],[110,-5],[105,-5],[100,0],[100,5],[100,10],[100,20]] },
  // Australia
  { points: [[115,-15],[120,-15],[130,-12],[140,-15],[150,-20],[150,-25],[148,-30],[140,-35],[135,-35],[130,-32],[125,-30],[115,-25],[113,-20],[115,-15]] },
];

// ─── Globe Renderer ───────────────────────────────────────────────────────

function projectToSphere(lat: number, lng: number, rotationY: number, radius: number, cx: number, cy: number) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + rotationY) * (Math.PI / 180);

  const x = radius * Math.sin(phi) * Math.cos(theta);
  const y = -radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);

  return { x: cx + x, y: cy + y, z };
}

function isPointVisible(z: number, radius: number) {
  return z > -radius * 0.15;
}

function drawGlobe(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  countries: GlobeCountryData[],
  rotationY: number,
  hoveredId: string | null,
  time: number,
) {
  const dpr = window.devicePixelRatio || 1;
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) * 0.4;

  // ── Outer glow ──────────────────────────────────────────────────────
  const glowGrad = ctx.createRadialGradient(cx, cy, radius * 0.9, cx, cy, radius * 1.3);
  glowGrad.addColorStop(0, `${ACCENT}, 0.08)`);
  glowGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = glowGrad;
  ctx.fillRect(0, 0, width, height);

  // ── Globe sphere ────────────────────────────────────────────────────
  const sphereGrad = ctx.createRadialGradient(cx - radius * 0.25, cy - radius * 0.25, radius * 0.05, cx, cy, radius);
  sphereGrad.addColorStop(0, '#1a3a4a');
  sphereGrad.addColorStop(0.7, '#0e2f44');
  sphereGrad.addColorStop(1, '#091e2e');
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fillStyle = sphereGrad;
  ctx.fill();

  // ── Grid lines (latitude) ───────────────────────────────────────────
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.clip();

  ctx.strokeStyle = 'rgba(255,255,255,0.04)';
  ctx.lineWidth = 0.5;
  for (let lat = -60; lat <= 60; lat += 30) {
    ctx.beginPath();
    let started = false;
    for (let lng = -180; lng <= 180; lng += 3) {
      const p = projectToSphere(lat, lng, rotationY, radius, cx, cy);
      if (p.z > 0) {
        if (!started) { ctx.moveTo(p.x, p.y); started = true; }
        else ctx.lineTo(p.x, p.y);
      } else {
        started = false;
      }
    }
    ctx.stroke();
  }
  // Longitude lines
  for (let lng = -180; lng <= 180; lng += 30) {
    ctx.beginPath();
    let started = false;
    for (let lat = -90; lat <= 90; lat += 3) {
      const p = projectToSphere(lat, lng, rotationY, radius, cx, cy);
      if (p.z > 0) {
        if (!started) { ctx.moveTo(p.x, p.y); started = true; }
        else ctx.lineTo(p.x, p.y);
      } else {
        started = false;
      }
    }
    ctx.stroke();
  }

  // ── Continent outlines ──────────────────────────────────────────────
  ctx.strokeStyle = 'rgba(255,255,255,0.12)';
  ctx.lineWidth = 1;
  for (const continent of CONTINENTS) {
    ctx.beginPath();
    let started = false;
    for (let i = 0; i < continent.points.length; i++) {
      const [lat, lng] = continent.points[i];
      const p = projectToSphere(lat, lng, rotationY, radius, cx, cy);
      if (p.z > -radius * 0.1) {
        if (!started) { ctx.moveTo(p.x, p.y); started = true; }
        else ctx.lineTo(p.x, p.y);
      } else {
        started = false;
      }
    }
    ctx.stroke();

    // Fill continents with very subtle color
    ctx.fillStyle = 'rgba(13, 148, 136, 0.04)';
    ctx.fill();
  }

  // ── Connection arcs from Nepal to other countries ───────────────────
  const nepal = countries.find((c) => c.isHighlighted);
  if (nepal) {
    const np = projectToSphere(nepal.latitude, nepal.longitude, rotationY, radius, cx, cy);
    if (np.z > 0) {
      for (const country of countries) {
        if (country.id === nepal.id) continue;
        const cp = projectToSphere(country.latitude, country.longitude, rotationY, radius, cx, cy);
        if (cp.z > 0) {
          const midX = (np.x + cp.x) / 2;
          const midY = (np.y + cp.y) / 2 - 30;
          ctx.beginPath();
          ctx.moveTo(np.x, np.y);
          ctx.quadraticCurveTo(midX, midY, cp.x, cp.y);
          ctx.strokeStyle = `${ACCENT}, ${0.08 + 0.04 * Math.sin(time * 0.002 + country.order)})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }
  }

  // ── Country markers ─────────────────────────────────────────────────
  const visibleCountries: { country: GlobeCountryData; x: number; y: number; z: number }[] = [];

  for (const country of countries) {
    const p = projectToSphere(country.latitude, country.longitude, rotationY, radius, cx, cy);
    if (isPointVisible(p.z, radius)) {
      visibleCountries.push({ country, x: p.x, y: p.y, z: p.z });
    }
  }

  // Sort by z (back to front)
  visibleCountries.sort((a, b) => a.z - b.z);

  for (const { country, x, y, z } of visibleCountries) {
    const depth = (z + radius) / (2 * radius); // 0 = back, 1 = front
    const baseSize = country.isHighlighted ? 6 : 4;
    const size = baseSize * (0.5 + depth * 0.6);
    const isHovered = hoveredId === country.id;

    // Pulse ring for highlighted
    if (country.isHighlighted) {
      const pulseScale = 1 + 0.6 * Math.sin(time * 0.003);
      const pulseAlpha = 0.3 * (1 - (pulseScale - 1) / 0.6);
      ctx.beginPath();
      ctx.arc(x, y, size * pulseScale * 2.5, 0, Math.PI * 2);
      ctx.fillStyle = `${ACCENT}, ${pulseAlpha * depth})`;
      ctx.fill();
    }

    // Outer glow
    if (isHovered || country.isHighlighted) {
      const glowSize = isHovered ? size * 4 : size * 2.5;
      const grad = ctx.createRadialGradient(x, y, 0, x, y, glowSize);
      grad.addColorStop(0, country.isHighlighted ? `rgba(${HIGHLIGHT_R}, ${HIGHLIGHT_G}, ${HIGHLIGHT_B}, ${0.4 * depth})` : `${ACCENT}, ${0.3 * depth})`);
      grad.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(x, y, glowSize, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
    }

    // Dot
    ctx.beginPath();
    ctx.arc(x, y, isHovered ? size * 1.3 : size, 0, Math.PI * 2);
    if (country.isHighlighted) {
      ctx.fillStyle = `rgba(${HIGHLIGHT_R}, ${HIGHLIGHT_G}, ${HIGHLIGHT_B}, ${0.7 + depth * 0.3})`;
    } else {
      ctx.fillStyle = `${ACCENT}, ${0.5 + depth * 0.5})`;
    }
    ctx.fill();

    // Bright center
    ctx.beginPath();
    ctx.arc(x, y, size * 0.4, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${0.6 + depth * 0.4})`;
    ctx.fill();

    // Label for highlighted or hovered
    if ((country.isHighlighted || isHovered) && depth > 0.3) {
      const label = country.displayLabel || `${country.hospitalCount}+ Hospitals`;
      const name = country.countryName;

      ctx.font = `bold ${Math.round(11 * dpr)}px Inter, system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillStyle = `rgba(255, 255, 255, ${0.9 * depth})`;
      ctx.fillText(name, x, y - size * 2.2 - 6);

      ctx.font = `${Math.round(9 * dpr)}px Inter, system-ui, sans-serif`;
      ctx.fillStyle = `rgba(${HIGHLIGHT_R}, ${HIGHLIGHT_G}, ${HIGHLIGHT_B}, ${0.8 * depth})`;
      ctx.fillText(label, x, y - size * 2.2 + 6);
    }
  }

  ctx.restore();

  // ── Sphere edge highlight ───────────────────────────────────────────
  const edgeGrad = ctx.createRadialGradient(cx, cy, radius * 0.92, cx, cy, radius);
  edgeGrad.addColorStop(0, 'transparent');
  edgeGrad.addColorStop(1, 'rgba(0,0,0,0.4)');
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fillStyle = edgeGrad;
  ctx.fill();

  // ── Rim light ───────────────────────────────────────────────────────
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.strokeStyle = `${ACCENT}, 0.15)`;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  return visibleCountries;
}

// ─── Tooltip ───────────────────────────────────────────────────────────────

function Tooltip({ country, x, y }: { country: GlobeCountryData; x: number; y: number }) {
  return (
    <div
      className="pointer-events-none absolute z-50 rounded-xl bg-white/95 px-4 py-3 shadow-lg backdrop-blur-sm"
      style={{ left: x + 16, top: y - 20, transform: 'translateY(-50%)' }}
    >
      <p className="font-heading text-sm font-semibold text-danphe-primary">{country.countryName}</p>
      <p className="mt-0.5 text-xs font-medium text-danphe-accent">{country.displayLabel || `${country.hospitalCount}+ Hospitals`}</p>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────

export default function InteractiveGlobe({ countries, heading, subheading }: InteractiveGlobeProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-80px' });

  const rotationRef = useRef(0);
  const autoRotateRef = useRef(true);
  const dragRef = useRef({ active: false, startX: 0, startRotation: 0 });
  const hoveredIdRef = useRef<string | null>(null);
  const hoveredPosRef = useRef({ x: 0, y: 0 });
  const animFrameRef = useRef<number>(0);
  const visibleCountriesRef = useRef<{ country: GlobeCountryData; x: number; y: number; z: number }[]>([]);

  const [tooltip, setTooltip] = useState<{ country: GlobeCountryData; x: number; y: number } | null>(null);
  const activeCountries = useMemo(() => countries.filter((c) => c.isActive), [countries]);
  const totalHospitals = useMemo(() => activeCountries.reduce((sum, c) => sum + c.hospitalCount, 0), [activeCountries]);
  const nepalData = useMemo(() => countries.find((c) => c.isHighlighted) || null, [countries]);
  const activeCount = activeCountries.length;

  const renderRef = useRef<(time: number) => void>();

  // Animation loop
  useEffect(() => {
    if (!isInView) return;

    const tick = (time: number) => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const dpr = window.devicePixelRatio || 1;
      const rect = container.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      if (autoRotateRef.current) {
        rotationRef.current += 0.08;
      }

      const visible = drawGlobe(ctx, width, height, countries, rotationRef.current, hoveredIdRef.current, time);
      visibleCountriesRef.current = visible;

      ctx.restore();

      animFrameRef.current = requestAnimationFrame(tick);
    };

    renderRef.current = tick;
    animFrameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [isInView, countries]);

  // Mouse / touch interaction
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    autoRotateRef.current = false;
    dragRef.current = { active: true, startX: e.clientX, startRotation: rotationRef.current };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (dragRef.current.active) {
      const dx = e.clientX - dragRef.current.startX;
      rotationRef.current = dragRef.current.startRotation + dx * 0.3;
    }

    // Hit test for tooltips
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    let found: GlobeCountryData | null = null;
    for (const { country, x, y } of visibleCountriesRef.current) {
      const dist = Math.sqrt((mx - x) ** 2 + (my - y) ** 2);
      if (dist < 18) {
        found = country;
        break;
      }
    }

    if (found) {
      hoveredIdRef.current = found.id;
      setTooltip({ country: found, x: mx, y: my });
      canvas.style.cursor = 'pointer';
    } else {
      hoveredIdRef.current = null;
      setTooltip(null);
      canvas.style.cursor = dragRef.current.active ? 'grabbing' : 'grab';
    }
  }, []);

  const handlePointerUp = useCallback(() => {
    dragRef.current.active = false;
    // Resume auto-rotate after 3s of inactivity
    setTimeout(() => {
      if (!dragRef.current.active) {
        autoRotateRef.current = true;
      }
    }, 3000);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="bg-white py-20 md:py-28"
      aria-label="Trusted Across Borders"
    >
      <div className="mx-auto max-w-7xl px-4">
        {/* ── Heading ──────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-14 text-center"
        >
          <h2 className="font-heading mb-4 text-3xl font-bold text-danphe-primary md:text-4xl">
            {heading}
          </h2>
          <p className="mx-auto max-w-2xl text-base text-danphe-text">
            {subheading}
          </p>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-12">
          {/* ── Left: Stats ────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="flex flex-col gap-5 lg:col-span-4"
          >
            {/* Nepal Card */}
            {nepalData && (
              <div className="glass rounded-2xl p-6 shadow-premium">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-danphe-accent/10">
                    <MapPin className="h-5 w-5 text-danphe-accent" />
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-semibold text-danphe-primary">
                      {nepalData.countryName}
                    </h3>
                    <p className="text-xs text-danphe-text/60">Headquarters</p>
                  </div>
                </div>
                <p className="font-heading text-3xl font-bold text-danphe-primary">
                  {nepalData.displayLabel || `${nepalData.hospitalCount}+`}
                </p>
              </div>
            )}

            {/* Global Stats Card */}
            <div className="glass rounded-2xl p-6 shadow-premium">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-danphe-accent/10">
                  <Globe className="h-5 w-5 text-danphe-accent" />
                </div>
                <h3 className="font-heading text-lg font-semibold text-danphe-primary">
                  Global Reach
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-heading text-2xl font-bold text-danphe-primary">{activeCount}+</p>
                  <p className="text-xs text-danphe-text">Countries Served</p>
                </div>
                <div>
                  <p className="font-heading text-2xl font-bold text-danphe-primary">{totalHospitals}+</p>
                  <p className="text-xs text-danphe-text">Hospitals &amp; Partners</p>
                </div>
              </div>
            </div>

            {/* Country list */}
            <div className="glass rounded-2xl p-5 shadow-premium">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-danphe-text/50">
                Active Regions
              </p>
              <div className="max-h-48 space-y-2.5 overflow-y-auto pr-1">
                {countries
                  .filter((c) => c.isActive)
                  .sort((a, b) => b.hospitalCount - a.hospitalCount)
                  .map((c) => (
                    <div key={c.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`h-2 w-2 rounded-full ${c.isHighlighted ? 'bg-danphe-accent shadow-[0_0_8px_rgba(13,148,136,0.6)]' : 'bg-danphe-accent/50'}`}
                        />
                        <span className="text-sm text-danphe-text">{c.countryName}</span>
                      </div>
                      <span className="text-xs font-medium text-danphe-primary">
                        {c.displayLabel || `${c.hospitalCount}+`}
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            <p className="text-center text-xs text-danphe-text/40 lg:text-left">
              Drag the globe to explore &middot; Auto-rotates after 3s
            </p>
          </motion.div>

          {/* ── Right: Globe ────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="lg:col-span-8"
          >
            <div
              ref={containerRef}
              className="relative aspect-square w-full overflow-hidden rounded-3xl bg-danphe-dark"
              style={{ cursor: 'grab' }}
            >
              <canvas
                ref={canvasRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                className="absolute inset-0 h-full w-full"
              />

              {/* Tooltip overlay */}
              {tooltip && <Tooltip country={tooltip.country} x={tooltip.x} y={tooltip.y} />}

              {/* Corner branding */}
              <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-danphe-accent animate-pulse" />
                <span className="text-xs font-medium text-white/50">
                  Live Globe &middot; Data-Driven
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
