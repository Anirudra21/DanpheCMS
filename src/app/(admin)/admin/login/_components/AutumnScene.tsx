'use client';

import { useState, useEffect, useRef, useMemo, useSyncExternalStore, useCallback } from 'react';

// ─── Color Palette ───────────────────────────────────────────────────────────

const C = {
  skyTop: '#FFF8F0',
  skyMid: '#FFECD2',
  skyBot: '#FFD4A8',
  sunGlow: 'rgba(249, 180, 60, 0.18)',
  sunCore: 'rgba(255, 200, 80, 0.25)',
  hillFar1: '#F5E0CC',
  hillFar2: '#EEDCC8',
  hillMid1: '#E0C4A8',
  hillMid2: '#D8BCA0',
  ground1: '#C9A882',
  ground2: '#BFA07A',
  ground3: '#B8976E',
  path: '#C4A070',
  trunk: '#5C3D2E',
  trunkLt: '#7A5440',
  trunkDk: '#4A3228',
  branch: '#6B4A38',
  foliage: ['#F97316', '#E56B6F', '#F4B942', '#D4632A', '#C0392B', '#E67E22', '#E8A838'],
  grass: ['#7CB342', '#8BC34A', '#6B9E3A', '#9CCC65', '#558B2F'],
  flower: ['#F4B942', '#E56B6F', '#F97316', '#FFFEF0', '#E8A838'],
  bush: ['#8B6B3E', '#7A5C32', '#6B5030', '#9E7E50'],
  bird: '#6B4A38',
};

// ─── Hooks ──────────────────────────────────────────────────────────────────

function usePrefersReducedMotion() {
  const subscribe = useCallback((callback: () => void) => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    mq.addEventListener('change', callback);
    return () => mq.removeEventListener('change', callback);
  }, []);
  const getSnapshot = useCallback(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches, []);
  const getServerSnapshot = useCallback(() => false, []);
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

function useIsMobile() {
  const subscribe = useCallback((callback: () => void) => {
    window.addEventListener('resize', callback);
    return () => window.removeEventListener('resize', callback);
  }, []);
  const getSnapshot = useCallback(() => window.innerWidth < 768, []);
  const getServerSnapshot = useCallback(() => false, []);
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

// ─── Tree Component ─────────────────────────────────────────────────────────

interface TreeDef {
  x: number; y: number; scale: number; colors: string[];
  delay: number; opacity: number; flip?: boolean; type?: 'full' | 'slim';
}

function Tree({ d }: { d: TreeDef }) {
  const { x, y, scale, colors, delay, opacity, flip, type } = d;
  const sx = flip ? -1 : 1;
  const isSlim = type === 'slim';

  return (
    <g
      transform={`translate(${x}, ${y}) scale(${sx * scale})`}
      opacity={opacity}
      style={{
        animation: `treeSway ${3.2 + delay * 0.6}s ease-in-out ${delay * 0.3}s infinite`,
        transformOrigin: `${x}px ${y}px`,
      }}
    >
      {/* Trunk with taper */}
      <path
        d={isSlim
          ? 'M0,0 Q-1.5,-20 -2,-45 Q-1.5,-55 -1,-70 L1,-70 Q1.2,-55 1.5,-45 Q1,-20 0,0Z'
          : 'M0,0 Q-3,-25 -5,-55 Q-4,-80 -2.5,-110 L2.5,-110 Q3.5,-80 4.5,-55 Q3,-25 0,0Z'
        }
        fill={C.trunk}
      />
      {/* Bark texture lines */}
      {!isSlim && <>
        <line x1="-1" y1="-20" x2="1" y2="-25" stroke={C.trunkLt} strokeWidth="0.6" opacity="0.4" />
        <line x1="-2" y1="-50" x2="0" y2="-55" stroke={C.trunkLt} strokeWidth="0.5" opacity="0.3" />
        <line x1="1" y1="-70" x2="2" y2="-75" stroke={C.trunkLt} strokeWidth="0.5" opacity="0.3" />
      </>}
      {/* Branches */}
      {!isSlim ? <>
        <path d="M-2,-60 Q-22,-78 -35,-90" stroke={C.branch} strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <path d="M2,-70 Q18,-85 30,-95" stroke={C.branch} strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M-1,-82 Q-16,-98 -26,-112" stroke={C.branch} strokeWidth="2.2" fill="none" strokeLinecap="round" />
        <path d="M1,-90 Q14,-105 22,-115" stroke={C.branch} strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M-2,-45 Q-15,-55 -22,-60" stroke={C.branch} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M2,-50 Q14,-58 20,-62" stroke={C.branch} strokeWidth="2" fill="none" strokeLinecap="round" />
      </> : <>
        <path d="M-1,-40 Q-12,-52 -20,-60" stroke={C.branch} strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M1,-45 Q10,-55 16,-62" stroke={C.branch} strokeWidth="1.8" fill="none" strokeLinecap="round" />
      </>}
      {/* Foliage - layered clusters for organic look */}
      {isSlim ? <>
        <circle cx="-14" cy="-68" r="18" fill={colors[0]} opacity="0.85" />
        <circle cx="12" cy="-72" r="16" fill={colors[1]} opacity="0.8" />
        <circle cx="0" cy="-78" r="20" fill={colors[2]} opacity="0.75" />
        <circle cx="-8" cy="-84" r="14" fill={colors[0]} opacity="0.65" />
        <circle cx="8" cy="-82" r="12" fill={colors[1]} opacity="0.6" />
      </> : <>
        {/* Back layer - darker, larger */}
        <circle cx="-20" cy="-100" r="30" fill={colors[4 % colors.length]} opacity="0.55" />
        <circle cx="25" cy="-105" r="28" fill={colors[5 % colors.length]} opacity="0.5" />
        <circle cx="0" cy="-115" r="34" fill={colors[3 % colors.length]} opacity="0.45" />
        {/* Mid layer */}
        <circle cx="-28" cy="-92" r="26" fill={colors[0]} opacity="0.88" />
        <circle cx="22" cy="-98" r="24" fill={colors[1]} opacity="0.83" />
        <circle cx="0" cy="-108" r="32" fill={colors[2]} opacity="0.78" />
        <circle cx="-12" cy="-118" r="22" fill={colors[0]} opacity="0.72" />
        <circle cx="14" cy="-124" r="20" fill={colors[1]} opacity="0.68" />
        {/* Highlight clusters */}
        <circle cx="32" cy="-82" r="18" fill={colors[6 % colors.length]} opacity="0.8" />
        <circle cx="-36" cy="-80" r="16" fill={colors[2]} opacity="0.72" />
        <circle cx="6" cy="-132" r="16" fill={colors[6 % colors.length]} opacity="0.6" />
        <circle cx="-18" cy="-90" r="14" fill={colors[0]} opacity="0.5" />
        {/* Small accent clusters */}
        <circle cx="-30" cy="-108" r="10" fill={colors[1]} opacity="0.4" />
        <circle cx="28" cy="-112" r="12" fill={colors[0]} opacity="0.45" />
        <circle cx="0" cy="-138" r="10" fill={colors[2]} opacity="0.35" />
      </>}
    </g>
  );
}

// ─── Bush Component ─────────────────────────────────────────────────────────

function Bush({ x, y, scale, color, delay }: { x: number; y: number; scale: number; color: string; delay: number }) {
  return (
    <g
      transform={`translate(${x}, ${y}) scale(${scale})`}
      style={{
        animation: `treeSway ${3 + delay * 0.4}s ease-in-out ${delay * 0.3}s infinite`,
        transformOrigin: `${x}px ${y}px`,
      }}
    >
      <ellipse cx="0" cy="-8" rx="22" ry="16" fill={color} opacity="0.7" />
      <ellipse cx="-12" cy="-5" rx="14" ry="12" fill={color} opacity="0.6" />
      <ellipse cx="14" cy="-6" rx="16" ry="13" fill={color} opacity="0.55" />
      <ellipse cx="0" cy="-14" rx="12" ry="10" fill={color} opacity="0.5" />
    </g>
  );
}

// ─── Cyclist ────────────────────────────────────────────────────────────────

function Cyclist() {
  return (
    <g className="cyclist-group">
      {/* Back wheel */}
      <g style={{ animation: 'wheelSpin 1s linear infinite' }}>
        <circle cx="0" cy="0" r="17" fill="none" stroke={C.trunkDk} strokeWidth="2" />
        <circle cx="0" cy="0" r="1.5" fill={C.trunkDk} />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
          <line key={a} x1="0" y1="0"
            x2={17 * Math.cos((a * Math.PI) / 180)}
            y2={17 * Math.sin((a * Math.PI) / 180)}
            stroke={C.trunkDk} strokeWidth="0.6" opacity="0.4" />
        ))}
      </g>
      {/* Front wheel */}
      <g style={{ animation: 'wheelSpin 1s linear infinite' }}>
        <circle cx="52" cy="0" r="17" fill="none" stroke={C.trunkDk} strokeWidth="2" />
        <circle cx="52" cy="0" r="1.5" fill={C.trunkDk} />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
          <line key={`f${a}`} x1="52" y1="0"
            x2={52 + 17 * Math.cos((a * Math.PI) / 180)}
            y2={17 * Math.sin((a * Math.PI) / 180)}
            stroke={C.trunkDk} strokeWidth="0.6" opacity="0.4" />
        ))}
      </g>
      {/* Frame */}
      <path d="M0,0 L15,-20 L52,0" stroke={C.trunkDk} strokeWidth="2.5" fill="none" strokeLinejoin="round" />
      <path d="M15,-20 L38,-20 L52,0" stroke={C.trunkDk} strokeWidth="2" fill="none" />
      <path d="M15,-20 L19,-34" stroke={C.trunkDk} strokeWidth="2" fill="none" />
      {/* Handlebars */}
      <path d="M38,-20 L42,-30" stroke={C.trunkDk} strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* Seat */}
      <line x1="13" y1="-22" x2="17" y2="-22" stroke={C.trunkDk} strokeWidth="3.5" strokeLinecap="round" />
      {/* Body */}
      <path d="M19,-34 L23,-52 L29,-57" stroke={C.trunkDk} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {/* Head */}
      <circle cx="30" cy="-60" r="5.5" fill={C.trunkDk} />
      {/* Helmet */}
      <path d="M24.5,-62 Q30,-68 35.5,-62" stroke={C.trunkDk} strokeWidth="1.5" fill={C.trunkLt} />
      {/* Arms */}
      <path d="M23,-50 L40,-28" stroke={C.trunkDk} strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* Legs pedaling */}
      <g style={{ animation: 'pedalL 1s ease-in-out infinite', transformOrigin: '19px -34px' }}>
        <path d="M19,-34 L10,-12 L0,0" stroke={C.trunkDk} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <g style={{ animation: 'pedalR 1s ease-in-out infinite', transformOrigin: '19px -34px' }}>
        <path d="M19,-34 L30,-12 L52,0" stroke={C.trunkDk} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      {/* Scarf */}
      <path d="M27,-57 Q18,-53 11,-57 Q6,-60 1,-57" stroke="#E56B6F" strokeWidth="3" fill="none" strokeLinecap="round" style={{ animation: 'scarfFlow 1.8s ease-in-out infinite' }} />
      <path d="M27,-55 Q20,-51 14,-53 Q8,-56 3,-54" stroke="#E56B6F" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5" style={{ animation: 'scarfFlow 2s ease-in-out 0.2s infinite' }} />
    </g>
  );
}

// ─── Cloud ──────────────────────────────────────────────────────────────────

function Cloud({ x, y, scale, speed, delay, opacity }: {
  x: number; y: number; scale: number; speed: number; delay: number; opacity: number;
}) {
  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`} opacity={opacity}
      style={{ animation: `cloudDrift ${speed}s linear ${delay}s infinite` }}>
      <ellipse cx="0" cy="0" rx="65" ry="22" fill="rgba(255,250,245,0.75)" />
      <ellipse cx="-32" cy="-9" rx="38" ry="20" fill="rgba(255,250,245,0.7)" />
      <ellipse cx="28" cy="-12" rx="44" ry="22" fill="rgba(255,250,245,0.72)" />
      <ellipse cx="0" cy="-16" rx="32" ry="18" fill="rgba(255,250,245,0.65)" />
      <ellipse cx="-15" cy="-6" rx="28" ry="16" fill="rgba(255,252,248,0.5)" />
    </g>
  );
}

// ─── Bird ───────────────────────────────────────────────────────────────────

function BirdV({ x, y, delay, scale }: { x: number; y: number; delay: number; scale: number }) {
  return (
    <g style={{ animation: `birdFly ${18 + delay * 4}s linear ${delay}s infinite` }}>
      <g transform={`translate(${x}, ${y}) scale(${scale})`}>
        <path d="M0,0 Q-4,-5 -8,-2" stroke={C.bird} strokeWidth="1.2" fill="none" strokeLinecap="round" style={{ animation: 'wingFlap 0.8s ease-in-out infinite' }} />
        <path d="M0,0 Q4,-5 8,-2" stroke={C.bird} strokeWidth="1.2" fill="none" strokeLinecap="round" style={{ animation: 'wingFlap 0.8s ease-in-out infinite' }} />
      </g>
    </g>
  );
}

// ─── Grass & Flower ─────────────────────────────────────────────────────────

function GrassBlade({ x, y, h, color, delay }: { x: number; y: number; h: number; color: string; delay: number }) {
  return (
    <line x1={x} y1={y} x2={x + 1} y2={y - h} stroke={color} strokeWidth="1.8" strokeLinecap="round" opacity="0.65"
      style={{ animation: `grassSway ${1.8 + delay * 0.3}s ease-in-out ${delay * 0.4}s infinite`, transformOrigin: `${x}px ${y}px` }} />
  );
}

function Flower({ x, y, color, delay }: { x: number; y: number; color: string; delay: number }) {
  return (
    <g style={{ animation: `grassSway ${2.2 + delay * 0.3}s ease-in-out ${delay * 0.5}s infinite`, transformOrigin: `${x}px ${y}px` }}>
      <line x1={x} y1={y} x2={x} y2={y - 15} stroke="#6B9E3A" strokeWidth="1.3" />
      <circle cx={x} cy={y - 17} r="3.8" fill={color} opacity="0.8" />
      <circle cx={x} cy={y - 17} r="1.6" fill="#F4B942" opacity="0.9" />
    </g>
  );
}

// ─── Falling Leaf (HTML) ────────────────────────────────────────────────────

function FallingLeaf({ index, mobile }: { index: number; mobile: boolean }) {
  const leaf = useMemo(() => {
    const cols = C.foliage;
    return {
      color: cols[index % cols.length],
      left: 3 + ((index * 17 + 13) % 94),
      size: 8 + ((index * 7 + 3) % 14),
      dur: 7 + ((index * 3 + 2) % 9),
      delay: index * 1.4,
      drift: -40 + ((index * 23 + 7) % 80),
      rot: ((index * 47 + 11) % 360),
      z: index % 3 === 0 ? 5 : 20,
      shape: index % 3, // 0=oval, 1=maple-like, 2=round
    };
  }, [index]);

  if (mobile && index > 9) return null;

  const leafPath = leaf.shape === 0
    ? 'M10 0C10 0 2 8 2 16C2 21 5.5 25 10 25C14.5 25 18 21 18 16C18 8 10 0 10 0Z'
    : leaf.shape === 1
    ? 'M10 0L8 6L2 8L8 10L10 18L12 10L18 8L12 6Z'
    : 'M10 2C5 2 1 7 1 12C1 18 5 22 10 22C15 22 19 18 19 12C19 7 15 2 10 2Z';

  return (
    <div
      className="pointer-events-none absolute"
      style={{
        left: `${leaf.left}%`, top: '-25px', zIndex: leaf.z,
        animation: `leafFall ${leaf.dur}s ease-in-out ${leaf.delay}s infinite`,
        '--ld': `${leaf.drift}px`, '--lr': `${leaf.rot}deg`,
      } as React.CSSProperties}
      aria-hidden="true"
    >
      <svg width={leaf.size} height={leaf.size * 1.3} viewBox="0 0 20 26" fill="none">
        <path d={leafPath} fill={leaf.color} opacity="0.82" />
        <path d="M10 3V24" stroke={leaf.color} strokeWidth="0.6" opacity="0.4" />
      </svg>
    </div>
  );
}

// ─── Main Scene ──────────────────────────────────────────────────────────────

export default function AutumnScene() {
  const reduced = usePrefersReducedMotion();
  const mobile = useIsMobile();
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (mobile || reduced) return;
    const h = (e: MouseEvent) => {
      setMouse({
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      });
    };
    window.addEventListener('mousemove', h);
    return () => window.removeEventListener('mousemove', h);
  }, [mobile, reduced]);

  // Trees
  const trees = useMemo<TreeDef[]>(() => [
    // Background (distant, faded)
    { x: 320, y: 440, scale: 0.6, colors: [C.foliage[2], C.foliage[0], C.foliage[1]], delay: 0.6, opacity: 0.4, type: 'slim' },
    { x: 560, y: 445, scale: 0.55, colors: [C.foliage[0], C.foliage[3], C.foliage[2]], delay: 0.9, opacity: 0.35, type: 'slim' },
    { x: 820, y: 435, scale: 0.65, colors: [C.foliage[1], C.foliage[2], C.foliage[0]], delay: 0.4, opacity: 0.42, type: 'slim' },
    { x: 1080, y: 442, scale: 0.5, colors: [C.foliage[3], C.foliage[0], C.foliage[4]], delay: 1.0, opacity: 0.35, type: 'slim' },
    // Midground
    { x: 170, y: 520, scale: 1.15, colors: [C.foliage[0], C.foliage[1], C.foliage[2], C.foliage[6]], delay: 0.2, opacity: 0.72 },
    { x: 1220, y: 510, scale: 1.05, colors: [C.foliage[4], C.foliage[2], C.foliage[0], C.foliage[5]], delay: 0.7, opacity: 0.68, flip: true },
    // Foreground (large framing trees)
    { x: 80, y: 610, scale: 2.4, colors: [C.foliage[0], C.foliage[2], C.foliage[1], C.foliage[4], C.foliage[6]], delay: 0.1, opacity: 0.95 },
    { x: 1340, y: 590, scale: 2.7, colors: [C.foliage[1], C.foliage[0], C.foliage[3], C.foliage[5], C.foliage[2]], delay: 0.3, opacity: 0.92, flip: true },
  ], []);

  // Clouds
  const clouds = useMemo(() => [
    { x: 180, y: 70, scale: 0.9, speed: 85, delay: 0, opacity: 0.55 },
    { x: 600, y: 45, scale: 1.1, speed: 105, delay: 18, opacity: 0.5 },
    { x: 950, y: 90, scale: 0.75, speed: 95, delay: 10, opacity: 0.48 },
    { x: -80, y: 110, scale: 0.65, speed: 115, delay: 30, opacity: 0.42 },
  ], []);

  // Bushes
  const bushes = useMemo(() => [
    { x: 280, y: 555, scale: 1, color: C.bush[0], delay: 0.5 },
    { x: 950, y: 550, scale: 0.9, color: C.bush[1], delay: 0.8 },
    { x: 680, y: 560, scale: 0.8, color: C.bush[2], delay: 1.2 },
    { x: 1150, y: 555, scale: 1.1, color: C.bush[3], delay: 0.3 },
  ], []);

  // Grass
  const grass = useMemo(() => {
    const g = [];
    for (let i = 0; i < (mobile ? 8 : 22); i++) {
      g.push({ x: 40 + (i * 67 + 19) % 1360, y: 610 + (i * 11) % 30, h: 10 + (i * 7) % 16, color: C.grass[i % C.grass.length], delay: i * 0.18 });
    }
    return g;
  }, [mobile]);

  // Flowers
  const flowers = useMemo(() => {
    const f = [];
    for (let i = 0; i < (mobile ? 3 : 8); i++) {
      f.push({ x: 80 + (i * 183 + 37) % 1280, y: 618 + (i * 13) % 22, color: C.flower[i % C.flower.length], delay: i * 0.3 });
    }
    return f;
  }, [mobile]);

  // Birds
  const birds = mobile ? [] : [
    { x: 400, y: 100, delay: 0, scale: 0.8 },
    { x: 500, y: 80, delay: 1.5, scale: 0.6 },
    { x: 450, y: 120, delay: 3, scale: 0.5 },
  ];

  // Parallax
  const px = (layer: number) => mouse.x * layer * 3;
  const py = (layer: number) => mouse.y * layer * 2;

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Sky gradient */}
      <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${C.skyTop} 0%, ${C.skyMid} 40%, ${C.skyBot} 75%, #FFC898 100%)` }} />

      {/* Sun glow */}
      <div className="absolute pointer-events-none" style={{
        left: '25%', top: '8%', width: '50%', height: '50%',
        background: `radial-gradient(ellipse at center, ${C.sunCore} 0%, ${C.sunGlow} 40%, transparent 70%)`,
        animation: reduced ? undefined : 'atmosShift 18s ease-in-out infinite alternate',
      }} />

      {/* Main SVG */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1440 700" preserveAspectRatio="xMidYMax slice"
        style={{ transform: reduced ? undefined : `translate(${px(0.2)}px, ${py(0.2)}px)`, transition: 'transform 0.6s ease-out' }}>

        {/* Distant hills */}
        <path d="M0,410 Q180,370 360,390 Q540,355 720,375 Q900,345 1080,370 Q1260,350 1440,380 L1440,480 L0,480Z" fill={C.hillFar1} opacity="0.6" />
        <path d="M0,430 Q240,400 480,415 Q720,385 960,405 Q1200,390 1440,410 L1440,490 L0,490Z" fill={C.hillFar2} opacity="0.5" />

        {/* Background trees */}
        {trees.slice(0, 4).map((t, i) => <Tree key={`bg${i}`} d={t} />)}

        {/* Birds */}
        {birds.map((b, i) => <BirdV key={`bird${i}`} {...b} />)}

        {/* Mid hills */}
        <path d="M0,470 Q200,450 440,465 Q680,440 920,458 Q1160,442 1440,460 L1440,540 L0,540Z" fill={C.hillMid1} opacity="0.75" />
        <path d="M0,490 Q300,475 600,485 Q900,470 1200,480 L1440,478 L1440,545 L0,545Z" fill={C.hillMid2} opacity="0.6" />

        {/* Mid trees */}
        {trees.slice(4, 6).map((t, i) => <Tree key={`mid${i}`} d={t} />)}

        {/* Cyclist path */}
        <path d="M0,560 Q360,548 720,555 Q1080,545 1440,558" fill="none" stroke={C.path} strokeWidth="6" strokeDasharray="10 7" opacity="0.25" strokeLinecap="round" />

        {/* Cyclist */}
        {!reduced && (
          <g style={{ animation: 'cyclistRide 30s linear infinite', transform: 'translate(-100px, 548px)' }}>
            <Cyclist />
          </g>
        )}

        {/* Ground */}
        <path d="M0,575 Q360,565 720,570 Q1080,562 1440,575 L1440,700 L0,700Z" fill={C.ground1} />
        <path d="M0,595 Q360,588 720,592 Q1080,585 1440,595 L1440,700 L0,700Z" fill={C.ground2} opacity="0.6" />
        <path d="M0,615 Q360,610 720,612 Q1080,608 1440,615 L1440,700 L0,700Z" fill={C.ground3} opacity="0.35" />

        {/* Bushes */}
        {bushes.map((b, i) => <Bush key={`bush${i}`} {...b} />)}

        {/* Foreground trees */}
        {trees.slice(6).map((t, i) => <Tree key={`fg${i}`} d={t} />)}

        {/* Clouds */}
        {clouds.map((c, i) => <Cloud key={`c${i}`} {...c} />)}

        {/* Grass */}
        {grass.map((g, i) => <GrassBlade key={`g${i}`} {...g} />)}

        {/* Flowers */}
        {flowers.map((f, i) => <Flower key={`f${i}`} {...f} />)}
      </svg>

      {/* Falling leaves (HTML overlay) */}
      {Array.from({ length: mobile ? 10 : 22 }, (_, i) => (
        <FallingLeaf key={i} index={i} mobile={mobile} />
      ))}

      {/* Keyframes */}
      <style>{`
        @keyframes treeSway {
          0%, 100% { transform: translateX(0) rotate(0deg); }
          30% { transform: translateX(1.5px) rotate(0.25deg); }
          70% { transform: translateX(-1px) rotate(-0.15deg); }
        }
        @keyframes cloudDrift {
          0% { transform: translateX(-220px); opacity: 0; }
          8% { opacity: 1; }
          92% { opacity: 1; }
          100% { transform: translateX(1660px); opacity: 0; }
        }
        @keyframes cyclistRide {
          0% { transform: translateX(-120px) translateY(548px); }
          100% { transform: translateX(1560px) translateY(548px); }
        }
        @keyframes wheelSpin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes pedalL { 0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(14deg); } }
        @keyframes pedalR { 0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(-14deg); } }
        @keyframes scarfFlow {
          0%, 100% { d: path('M27,-57 Q18,-53 11,-57 Q6,-60 1,-57'); }
          50% { d: path('M27,-57 Q15,-55 8,-59 Q2,-62 -3,-59'); }
        }
        @keyframes grassSway {
          0%, 100% { transform: rotate(0deg); }
          35% { transform: rotate(3.5deg); }
          65% { transform: rotate(-2.5deg); }
        }
        @keyframes leafFall {
          0% { transform: translateY(-25px) translateX(0) rotate(0deg); opacity: 0; }
          5% { opacity: 0.8; }
          25% { transform: translateY(25vh) translateX(var(--ld, 20px)) rotate(80deg); }
          50% { transform: translateY(50vh) translateX(calc(var(--ld, 20px) * -0.6)) rotate(200deg); }
          75% { transform: translateY(75vh) translateX(var(--ld, 20px)) rotate(300deg); }
          95% { opacity: 0.65; }
          100% { transform: translateY(108vh) translateX(calc(var(--ld, 20px) * 0.4)) rotate(400deg); opacity: 0; }
        }
        @keyframes atmosShift { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.75; } }
        @keyframes birdFly {
          0% { transform: translateX(-100px) translateY(0); }
          100% { transform: translateX(1540px) translateY(-30px); }
        }
        @keyframes wingFlap {
          0%, 100% { d: path('M0,0 Q-4,-5 -8,-2'); }
          50% { d: path('M0,0 Q-4,2 -8,0'); }
        }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
}
