'use client';

import { useState, useEffect, useRef, useCallback, type FormEvent } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Terminal,
  Shield,
  ShieldCheck,
} from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────────────

type AuthPhase = 'idle' | 'loading' | 'success' | 'error';

// ─── Constants ──────────────────────────────────────────────────────────────

const BG = '#062F47';
const TEAL = '#079E96';
const NAVY = '#083F5C';
const NAVY_DARK = '#0B2438';
const SLATE = '#607087';
const SURFACE = '#F7F9FB';
const BORDER_LIGHT = '#DCE4EA';

const reducedMotion =
  typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

// ─── Entrance Variants ──────────────────────────────────────────────────────

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: reducedMotion ? 0.01 : 0.7,
      ease: [0.22, 1, 0.36, 1],
    },
  },
  exit: {
    opacity: 0,
    scale: 1.04,
    filter: 'blur(6px)',
    transition: { duration: reducedMotion ? 0.01 : 0.4, ease: 'easeOut' },
  },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: reducedMotion ? 0 : 0.07,
      delayChildren: reducedMotion ? 0 : 0.25,
    },
  },
};

const fadeUpItem = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: reducedMotion ? 0.01 : 0.45,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

// ─── Network Background ─────────────────────────────────────────────────────

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
}

interface Pulse {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  progress: number;
  speed: number;
}

function NetworkBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<Node[]>([]);
  const pulsesRef = useRef<Pulse[]>([]);
  const frameRef = useRef<number>(0);
  const prefersReduced = useRef(false);

  const initNodes = useCallback((w: number, h: number) => {
    const count = Math.min(Math.floor((w * h) / 18000), 60);
    const nodes: Node[] = [];
    for (let i = 0; i < count; i++) {
      nodes.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        r: Math.random() * 1.5 + 0.5,
      });
    }
    nodesRef.current = nodes;
  }, []);

  useEffect(() => {
    prefersReduced.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => { prefersReduced.current = e.matches; };
    mq.addEventListener('change', handler);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      ctx.scale(dpr, dpr);
      initNodes(window.innerWidth, window.innerHeight);
    };
    resize();
    window.addEventListener('resize', resize);

    let lastPulseTime = 0;
    const CONNECTION_DIST = 160;

    const draw = (time: number) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);

      if (prefersReduced.current) {
        // Static: just draw nodes and lines once
        const nodes = nodesRef.current;
        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            const dx = nodes[i].x - nodes[j].x;
            const dy = nodes[i].y - nodes[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < CONNECTION_DIST) {
              ctx.beginPath();
              ctx.moveTo(nodes[i].x, nodes[i].y);
              ctx.lineTo(nodes[j].x, nodes[j].y);
              ctx.strokeStyle = `rgba(7, 158, 150, ${0.06 * (1 - dist / CONNECTION_DIST)})`;
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }
          }
        }
        nodes.forEach((n) => {
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(7, 158, 150, 0.2)';
          ctx.fill();
        });
        frameRef.current = requestAnimationFrame(draw);
        return;
      }

      const nodes = nodesRef.current;
      const pulses = pulsesRef.current;

      // Move nodes
      nodes.forEach((n) => {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
      });

      // Draw connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECTION_DIST) {
            const alpha = 0.06 * (1 - dist / CONNECTION_DIST);
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(7, 158, 150, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      nodes.forEach((n) => {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(7, 158, 150, 0.18)';
        ctx.fill();
      });

      // Spawn pulse every ~4-8 seconds
      if (time - lastPulseTime > 4000 + Math.random() * 4000 && nodes.length >= 2) {
        lastPulseTime = time;
        const a = nodes[Math.floor(Math.random() * nodes.length)];
        let b = nodes[Math.floor(Math.random() * nodes.length)];
        while (b === a && nodes.length > 1) {
          b = nodes[Math.floor(Math.random() * nodes.length)];
        }
        pulses.push({
          x1: a.x, y1: a.y, x2: b.x, y2: b.y,
          progress: 0, speed: 0.004 + Math.random() * 0.004,
        });
      }

      // Draw pulses
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i];
        p.progress += p.speed;
        if (p.progress >= 1) {
          pulses.splice(i, 1);
          continue;
        }
        const px = p.x1 + (p.x2 - p.x1) * p.progress;
        const py = p.y1 + (p.y2 - p.y1) * p.progress;
        const grad = ctx.createRadialGradient(px, py, 0, px, py, 8);
        grad.addColorStop(0, 'rgba(7, 158, 150, 0.35)');
        grad.addColorStop(1, 'rgba(7, 158, 150, 0)');
        ctx.beginPath();
        ctx.arc(px, py, 8, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      }

      frameRef.current = requestAnimationFrame(draw);
    };

    frameRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resize);
      mq.removeEventListener('change', handler);
      cancelAnimationFrame(frameRef.current);
    };
  }, [initNodes]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0"
      aria-hidden="true"
    />
  );
}

// ─── Shield Icon with draw animation ────────────────────────────────────────

function AnimatedShield({ triggerSuccess }: { triggerSuccess: boolean }) {
  const [phase, setPhase] = useState<'drawing' | 'idle' | 'success'>('drawing');

  useEffect(() => {
    if (reducedMotion) {
      setPhase('idle');
      return;
    }
    const t = setTimeout(() => setPhase('idle'), 1400);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (triggerSuccess && !reducedMotion) {
      setPhase('success');
      const t = setTimeout(() => setPhase('idle'), 1800);
      return () => clearTimeout(t);
    }
  }, [triggerSuccess]);

  const shieldDrawn = phase !== 'drawing';
  const checkDrawn = phase === 'idle' || phase === 'success';
  const isSuccess = phase === 'success';

  return (
    <div className="relative mx-auto flex h-16 w-16 items-center justify-center">
      {/* Teal ring pulse - only on draw and success */}
      <AnimatePresence>
        {(phase === 'drawing' || isSuccess) && !reducedMotion && (
          <motion.div
            key={phase}
            initial={{ scale: 0.8, opacity: 0.6 }}
            animate={{ scale: 1.6, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="absolute inset-0 rounded-2xl border-2 border-[#079E96]"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Shield SVG */}
      <div
        className={
          'relative flex h-14 w-14 items-center justify-center rounded-2xl transition-colors duration-500 ' +
          (isSuccess
            ? 'bg-[#079E96]/15'
            : 'bg-[#F0FDFA]')
        }
      >
        <svg
          width="28"
          height="28"
          viewBox="0 0 28 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          className={
            isSuccess
              ? 'drop-shadow-[0_0_8px_rgba(7,158,150,0.5)]'
              : ''
          }
          style={{ transition: 'filter 0.5s ease' }}
        >
          {/* Shield path */}
          <motion.path
            d="M14 2L4 7V13C4 19.075 8.4 24.575 14 26C19.6 24.575 24 19.075 24 13V7L14 2Z"
            stroke={isSuccess ? '#079E96' : '#083F5C'}
            strokeWidth={1.8}
            strokeLinejoin="round"
            fill={isSuccess ? 'rgba(7,158,150,0.08)' : 'none'}
            initial={{ pathLength: 0 }}
            animate={{
              pathLength: shieldDrawn ? 1 : 0,
              stroke: isSuccess ? '#079E96' : '#083F5C',
            }}
            transition={{
              pathLength: { duration: reducedMotion ? 0.01 : 0.9, ease: 'easeInOut' },
              stroke: { duration: 0.3 },
            }}
          />
          {/* Checkmark */}
          <motion.path
            d="M10 14L13 17L18 11"
            stroke={isSuccess ? '#079E96' : '#079E96'}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{
              pathLength: checkDrawn ? 1 : 0,
              opacity: checkDrawn ? 1 : 0,
            }}
            transition={{
              pathLength: { duration: reducedMotion ? 0.01 : 0.5, ease: 'easeOut', delay: reducedMotion ? 0 : 0.7 },
              opacity: { duration: 0.2, delay: reducedMotion ? 0 : 0.7 },
            }}
          />
        </svg>
      </div>
    </div>
  );
}

// ─── CLI Provision Panel ────────────────────────────────────────────────────

function CLIProvisionPanel() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), reducedMotion ? 0 : 900);
    return () => clearTimeout(t);
  }, []);

  if (!visible) return <div className="h-24" aria-hidden="true" />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reducedMotion ? 0.01 : 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative rounded-xl border border-[#DCE4EA] bg-[#F0F4F8] p-4 overflow-hidden"
    >
      {/* One-time CLI pulse animation */}
      <AnimatePresence>
        {!reducedMotion && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2.5, delay: 0.3 }}
            onAnimationComplete={() => {}}
            className="absolute inset-0 pointer-events-none"
            aria-hidden="true"
          >
            {/* Subtle traveling pulse from left to right */}
            <motion.div
              initial={{ x: '-20%', opacity: 0 }}
              animate={{ x: '120%', opacity: [0, 0.3, 0.3, 0] }}
              transition={{ duration: 2.2, ease: 'easeInOut', delay: 0.5 }}
              className="absolute top-1/2 -translate-y-1/2 h-px bg-gradient-to-r from-transparent via-[#079E96]/40 to-transparent w-3/4"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#083F5C]/8">
          <Terminal className="h-4 w-4 text-[#607087]" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1.5">
            <Shield className="h-3.5 w-3.5 text-[#607087]" />
            <span className="text-xs font-semibold text-[#083F5C] tracking-wide uppercase">
              Private administrator access
            </span>
          </div>
          <p className="text-[13px] text-[#607087] leading-relaxed mb-2.5">
            Admin accounts are provisioned securely through the server CLI. Public registration is disabled.
          </p>
          <div className="rounded-lg bg-[#083F5C]/5 border border-[#083F5C]/8 px-3 py-2">
            <code
              className="text-xs text-[#083F5C] font-mono tracking-wide"
              style={{ fontFamily: 'var(--font-geist-mono), monospace' }}
              aria-label="danphe admin provision command"
            >
              $ danphe admin provision
            </code>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Login Page ────────────────────────────────────────────────────────

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phase, setPhase] = useState<AuthPhase>('idle');
  const [authError, setAuthError] = useState('');
  const [shakeKey, setShakeKey] = useState(0);
  const [gatewayReady, setGatewayReady] = useState(false);
  const router = useRouter();
  const emailRef = useRef<HTMLInputElement>(null);
  const prefersReduced = useReducedMotion();

  // Auto-focus email field
  useEffect(() => {
    const t = setTimeout(() => emailRef.current?.focus(), reducedMotion ? 0 : 800);
    return () => clearTimeout(t);
  }, []);

  // Gateway initialization animation
  useEffect(() => {
    const t = setTimeout(() => setGatewayReady(true), reducedMotion ? 0 : 1600);
    return () => clearTimeout(t);
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setPhase('loading');

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setAuthError('Unable to verify administrator credentials.');
        setPhase('error');
        setShakeKey((k) => k + 1);
        setTimeout(() => setPhase('idle'), reducedMotion ? 0 : 300);
      } else {
        setPhase('success');
        await new Promise((r) => setTimeout(r, reducedMotion ? 100 : 1600));
        router.push('/admin/dashboard');
        router.refresh();
      }
    } catch {
      setAuthError('Unable to verify administrator credentials.');
      setPhase('error');
      setShakeKey((k) => k + 1);
      setTimeout(() => setPhase('idle'), reducedMotion ? 0 : 300);
    }
  };

  const isLoading = phase === 'loading';
  const isSuccess = phase === 'success';
  const isError = phase === 'error';

  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden"
      style={{ backgroundColor: BG }}
    >
      {/* ── Background Layer ─────────────────────────────────── */}
      {/* Radial teal glow */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 45%, rgba(7,158,150,0.07) 0%, transparent 70%)',
        }}
      />
      {/* Subtle gradient movement */}
      {!prefersReduced && (
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
          style={{
            background:
              'radial-gradient(ellipse 40% 40% at 30% 60%, rgba(8,63,92,0.4) 0%, transparent 70%)',
            animation: 'loginGradientShift 20s ease-in-out infinite alternate',
          }}
        />
      )}
      {/* Network animation */}
      <NetworkBackground />

      {/* ── Login Card ───────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {!isSuccess ? (
          <motion.div
            key={`card-${shakeKey}`}
            variants={cardVariants}
            initial="hidden"
            animate={
              isError
                ? { ...cardVariants.visible.visible, x: [0, -4, 4, -3, 3, 0] }
                : 'visible'
            }
            exit="exit"
            transition={
              isError
                ? { x: { duration: 0.4, ease: 'easeInOut' } }
                : undefined
            }
            className="relative z-10 w-full max-w-[470px] mx-5"
            role="region"
            aria-label="Administrator login"
          >
            <div
              className={
                'rounded-3xl border px-8 pt-10 pb-8 sm:px-10 sm:pt-12 sm:pb-10 ' +
                'bg-white/[0.97] backdrop-blur-sm ' +
                'shadow-[0_4px_24px_rgba(0,0,0,0.15),0_1px_3px_rgba(0,0,0,0.08)] ' +
                'border-white/20'
              }
            >
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="space-y-0"
              >
                {/* ── Security Icon ────────────────────────── */}
                <motion.div variants={fadeUpItem} className="flex justify-center mb-6">
                  <AnimatedShield triggerSuccess={isSuccess} />
                </motion.div>

                {/* ── Branding ──────────────────────────────── */}
                <motion.div variants={fadeUpItem} className="text-center mb-2">
                  <h1
                    className="text-[28px] font-bold tracking-tight leading-tight"
                    style={{ fontFamily: 'var(--font-jakarta), var(--font-geist-sans), sans-serif' }}
                  >
                    <span style={{ color: NAVY }}>Danphe </span>
                    <span style={{ color: TEAL }}>CMS</span>
                  </h1>
                  <p
                    className="mt-1.5 text-sm text-[#607087]"
                    style={{ letterSpacing: '0.01em' }}
                  >
                    Private administrative access
                  </p>
                </motion.div>

                {/* ── Gateway Status Pill ──────────────────── */}
                <motion.div variants={fadeUpItem} className="flex justify-center mb-8">
                  <div
                    className={
                      'inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[11px] font-medium tracking-wider uppercase transition-all duration-500 ' +
                      (gatewayReady
                        ? 'bg-[#079E96]/8 text-[#079E96] border border-[#079E96]/15'
                        : 'bg-[#607087]/8 text-[#607087] border border-[#607087]/15')
                    }
                    role="status"
                    aria-live="polite"
                  >
                    <span className="relative flex h-2 w-2">
                      {gatewayReady && !prefersReduced && (
                        <span
                          className="absolute inset-0 rounded-full bg-[#079E96] animate-ping"
                          style={{ animationDuration: '2s' }}
                        />
                      )}
                      <span
                        className={
                          'relative inline-flex h-2 w-2 rounded-full ' +
                          (gatewayReady ? 'bg-[#079E96]' : 'bg-[#607087]/50')
                        }
                      />
                    </span>
                    <span className="font-mono text-[10px]" style={{ fontFamily: 'var(--font-geist-mono), monospace' }}>
                      {gatewayReady ? 'SECURE GATEWAY READY' : 'INITIALIZING SECURE GATEWAY...'}
                    </span>
                  </div>
                </motion.div>

                {/* ── Form ──────────────────────────────────── */}
                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                  {/* Email Field */}
                  <motion.div variants={fadeUpItem}>
                    <label
                      htmlFor="login-email"
                      className="block text-[13px] font-medium text-[#083F5C] mb-1.5"
                    >
                      Administrator email
                    </label>
                    <div className="relative">
                      <Mail
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#607087] transition-colors duration-200 pointer-events-none"
                        aria-hidden="true"
                      />
                      <input
                        ref={emailRef}
                        id="login-email"
                        type="email"
                        required
                        autoComplete="email"
                        placeholder="admin@danphehealth.com"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setAuthError(''); }}
                        disabled={isLoading || isSuccess}
                        className={
                          'w-full h-12 pl-11 pr-4 rounded-xl border text-[14px] text-[#083F5C] placeholder:text-[#607087]/50 ' +
                          'bg-white outline-none transition-all duration-200 ' +
                          (isError && authError
                            ? 'border-red-300 shadow-[0_0_0_3px_rgba(239,68,68,0.08)]'
                            : 'border-[#DCE4EA] hover:border-[#B0BEC5] focus:border-[#079E96] focus:shadow-[0_0_0_3px_rgba(7,158,150,0.1)]') +
                          ' disabled:opacity-60 disabled:cursor-not-allowed'
                        }
                      />
                    </div>
                  </motion.div>

                  {/* Password Field */}
                  <motion.div variants={fadeUpItem}>
                    <label
                      htmlFor="login-password"
                      className="block text-[13px] font-medium text-[#083F5C] mb-1.5"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <Lock
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#607087] transition-colors duration-200 pointer-events-none"
                        aria-hidden="true"
                      />
                      <input
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        autoComplete="current-password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setAuthError(''); }}
                        disabled={isLoading || isSuccess}
                        aria-label="Password"
                        className={
                          'w-full h-12 pl-11 pr-12 rounded-xl border text-[14px] text-[#083F5C] placeholder:text-[#607087]/50 ' +
                          'bg-white outline-none transition-all duration-200 ' +
                          (isError && authError
                            ? 'border-red-300 shadow-[0_0_0_3px_rgba(239,68,68,0.08)]'
                            : 'border-[#DCE4EA] hover:border-[#B0BEC5] focus:border-[#079E96] focus:shadow-[0_0_0_3px_rgba(7,158,150,0.1)]') +
                          ' disabled:opacity-60 disabled:cursor-not-allowed'
                        }
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading || isSuccess}
                        className={
                          'absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all duration-200 ' +
                          'text-[#607087] hover:text-[#083F5C] hover:bg-[#083F5C]/5 ' +
                          'focus-visible:outline-2 focus-visible:outline-[#079E96] focus-visible:outline-offset-2 ' +
                          'disabled:opacity-40 disabled:pointer-events-none'
                        }
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        tabIndex={0}
                      >
                        <AnimatePresence mode="wait" initial={false}>
                          {showPassword ? (
                            <motion.span
                              key="eye-off"
                              initial={{ opacity: 0, y: -4 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 4 }}
                              transition={{ duration: 0.15 }}
                              className="flex"
                            >
                              <EyeOff className="h-4 w-4" />
                            </motion.span>
                          ) : (
                            <motion.span
                              key="eye-on"
                              initial={{ opacity: 0, y: 4 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -4 }}
                              transition={{ duration: 0.15 }}
                              className="flex"
                            >
                              <Eye className="h-4 w-4" />
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </button>
                    </div>
                  </motion.div>

                  {/* Error Message */}
                  <AnimatePresence>
                    {authError && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, y: -4 }}
                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -4 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                        className="overflow-hidden"
                      >
                        <div
                          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3"
                          role="alert"
                        >
                          <p className="text-[13px] font-medium text-red-700">
                            Unable to verify administrator credentials.
                          </p>
                          <p className="text-[12px] text-red-500 mt-1">
                            Only provisioned administrator accounts can access this environment.
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Login Button */}
                  <motion.div variants={fadeUpItem} className="pt-1">
                    <button
                      type="submit"
                      disabled={isLoading || isSuccess}
                      className={
                        'group relative w-full h-12 rounded-xl text-[14px] font-semibold tracking-wide ' +
                        'transition-all duration-200 outline-none ' +
                        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#079E96] ' +
                        (isLoading || isSuccess
                          ? 'cursor-wait'
                          : 'cursor-pointer hover:-translate-y-[1px] hover:shadow-[0_6px_20px_rgba(8,63,92,0.25),0_2px_6px_rgba(8,63,92,0.15)] active:translate-y-[1px] active:shadow-[0_2px_8px_rgba(8,63,92,0.15)]') +
                        ' disabled:opacity-90'
                      }
                      style={{
                        background: isLoading || isSuccess
                          ? 'linear-gradient(135deg, #083F5C 0%, #0B2438 100%)'
                          : 'linear-gradient(135deg, #083F5C 0%, #0c4a6e 50%, #083F5C 100%)',
                        color: '#ffffff',
                      }}
                    >
                      {/* Light sweep on hover */}
                      {!isLoading && !isSuccess && !prefersReduced && (
                        <span
                          className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                          style={{
                            background:
                              'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.12) 45%, rgba(255,255,255,0.18) 50%, rgba(255,255,255,0.12) 55%, transparent 60%)',
                            backgroundSize: '200% 100%',
                            animation: 'none',
                          }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLElement).style.backgroundPosition = '200% 0';
                            (e.currentTarget as HTMLElement).style.transition = 'background-position 0.6s ease';
                          }}
                        />
                      )}
                      <span className="relative z-10 flex items-center justify-center gap-2.5">
                        {isLoading && (
                          <svg
                            className="h-4 w-4 animate-spin"
                            viewBox="0 0 24 24"
                            fill="none"
                            aria-hidden="true"
                          >
                            <circle
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeDasharray="32"
                              strokeDashoffset="12"
                              className="opacity-25"
                            />
                            <path
                              d="M12 2a10 10 0 0 1 10 10"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                            />
                          </svg>
                        )}
                        {isSuccess && (
                          <svg
                            className="h-4 w-4"
                            viewBox="0 0 24 24"
                            fill="none"
                            aria-hidden="true"
                          >
                            <path
                              d="M5 13l4 4L19 7"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                        {isLoading
                          ? 'Verifying identity...'
                          : isSuccess
                            ? 'Identity verified ✓'
                            : 'Enter Secure Dashboard'}
                      </span>
                    </button>
                  </motion.div>
                </form>

                {/* ── CLI Provision Panel ────────────────────── */}
                <motion.div variants={fadeUpItem} className="mt-7">
                  <CLIProvisionPanel />
                </motion.div>

                {/* ── Restricted Environment ─────────────────── */}
                <motion.div variants={fadeUpItem} className="mt-5 pt-5 border-t border-[#DCE4EA]/60">
                  <div className="flex items-center justify-center gap-2 text-[#607087]">
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                      className="text-[#607087]/60"
                    >
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <span className="text-[11px] font-semibold uppercase tracking-wider">
                      Restricted environment
                    </span>
                  </div>
                  <p className="mt-1.5 text-center text-[12px] text-[#607087]/70">
                    Access is limited to provisioned Danphe administrators.
                  </p>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        ) : (
          /* ── Success Overlay ──────────────────────────────── */
          <motion.div
            key="success-overlay"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: reducedMotion ? 0.01 : 0.3 }}
            className="relative z-10 w-full max-w-[470px] mx-5"
            role="status"
            aria-live="assertive"
          >
            <div
              className={
                'rounded-3xl border border-white/20 px-10 pt-16 pb-12 text-center ' +
                'bg-white/[0.97] backdrop-blur-sm ' +
                'shadow-[0_4px_24px_rgba(0,0,0,0.15)]'
              }
            >
              {/* Success shield glow */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: reducedMotion ? 0 : 0.1, duration: 0.4, ease: 'easeOut' }}
                className="mx-auto mb-6"
              >
                <div className="relative mx-auto flex h-20 w-20 items-center justify-center">
                  <motion.div
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: [1, 1.5, 2], opacity: [0.3, 0.15, 0] }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                    className="absolute inset-0 rounded-full bg-[#079E96]/20"
                    aria-hidden="true"
                  />
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-[#079E96]/10">
                    <svg width="32" height="32" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                      <motion.path
                        d="M14 2L4 7V13C4 19.075 8.4 24.575 14 26C19.6 24.575 24 19.075 24 13V7L14 2Z"
                        stroke="#079E96"
                        strokeWidth={1.8}
                        strokeLinejoin="round"
                        fill="rgba(7,158,150,0.08)"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                      />
                      <motion.path
                        d="M10 14L13 17L18 11"
                        stroke="#079E96"
                        strokeWidth={2.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.4, delay: 0.3, ease: 'easeOut' }}
                      />
                    </svg>
                  </div>
                </div>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: reducedMotion ? 0 : 0.5, duration: 0.4 }}
                className="text-lg font-bold text-[#083F5C] mb-1"
                style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}
              >
                Identity verified
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: reducedMotion ? 0 : 0.65, duration: 0.4 }}
                className="text-sm text-[#607087]"
              >
                Secure access granted
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: reducedMotion ? 0 : 0.9, duration: 0.3 }}
                className="text-xs text-[#607087]/60 mt-4"
              >
                Opening dashboard...
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Keyframe Styles (inline for isolation) ──────────── */}
      <style jsx global>{`
        @keyframes loginGradientShift {
          0% {
            background-position: 0% 50%;
          }
          100% {
            background-position: 100% 50%;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
}
