'use client';

import { useState, useEffect, useRef, useCallback, type FormEvent } from 'react';
import Image from 'next/image';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Shield, Terminal } from 'lucide-react';

// ─── Constants ─────────────────────────────────────────────────────────────

const TEAL = '#079E96';
const NAVY = '#083F5C';
const NAVY_LIGHT = '#0c4a6e';
const SLATE = '#607087';
const LOGO_URL = 'https://danphehealth.com/frontend/img/logo.png';

type Phase = 'idle' | 'loading' | 'success' | 'error';

// ─── Animation Variants ────────────────────────────────────────────────────

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

const up = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

// ─── Ambient Background ────────────────────────────────────────────────────

function AmbientBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  const init = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.scale(dpr, dpr);

    // Particles
    const count = Math.min(Math.floor((w * h) / 30000), 40);
    const particles: { x: number; y: number; vx: number; vy: number; r: number; o: number }[] = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.12,
        vy: (Math.random() - 0.5) * 0.12,
        r: 0.8 + Math.random() * 1.2,
        o: 0.12 + Math.random() * 0.18,
      });
    }

    // Connection distance
    const CDIST = 140;

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      // Move particles
      if (!reduced) {
        particles.forEach((p) => {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0 || p.x > w) p.vx *= -1;
          if (p.y < 0 || p.y > h) p.vy *= -1;
        });
      }

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CDIST) {
            const alpha = 0.035 * (1 - dist / CDIST);
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(7, 158, 150, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // Draw particles
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(7, 158, 150, ${p.o})`;
        ctx.fill();
      });

      frameId = requestAnimationFrame(draw);
    };

    let frameId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frameId);
  }, [reduced]);

  useEffect(() => {
    const cleanup = init();
    window.addEventListener('resize', () => { cleanup(); init(); });
    return () => { cleanup(); };
  }, [init]);

  return (
    <>
      {/* Base gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(160deg, #f8fafb 0%, #f0f9ff 40%, #e8f4f8 100%)`,
        }}
      />
      {/* Teal ambient glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 50% 50% at 50% 40%, rgba(7,158,150,0.04) 0%, transparent 70%)',
        }}
      />
      {/* Subtle geometric accent - top right */}
      <div
        className="pointer-events-none absolute"
        style={{
          top: '-10%', right: '-5%', width: '45%', height: '45%',
          background: 'radial-gradient(circle, rgba(12,74,110,0.03) 0%, transparent 60%)',
        }}
      />
      {/* Subtle geometric accent - bottom left */}
      <div
        className="pointer-events-none absolute"
        style={{
          bottom: '-8%', left: '-5%', width: '35%', height: '35%',
          background: 'radial-gradient(circle, rgba(7,158,150,0.025) 0%, transparent 60%)',
        }}
      />
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
      />
    </>
   );
}

// ─── Shield Icon ────────────────────────────────────────────────────────────

function SecurityShield({ triggerSuccess }: { triggerSuccess: boolean }) {
  const [phase, setPhase] = useState<'draw' | 'idle' | 'glow'>('draw');
  const reduced = useReducedMotion();

  useEffect(() => {
    const delay = reduced ? 0 : 1000;
    const t = setTimeout(() => setPhase('idle'), delay);
    return () => clearTimeout(t);
  }, [reduced]);

  useEffect(() => {
    if (triggerSuccess && !reduced) {
      const t = setTimeout(() => setPhase('glow'), 0);
      const t2 = setTimeout(() => setPhase('idle'), 1400);
      return () => { clearTimeout(t); clearTimeout(t2); };
    }
  }, [triggerSuccess, reduced]);

  const drawn = phase !== 'draw';
  const checkOk = phase === 'idle' || phase === 'glow';
  const glowing = phase === 'glow';

  return (
    <div className="relative mx-auto flex h-10 w-10 items-center justify-center">
      {/* One-time teal glow ring */}
      <AnimatePresence>
        {(phase === 'draw' || glowing) && !reduced && (
          <motion.div
            key={phase}
            initial={{ scale: 0.7, opacity: 0.5 }}
            animate={{ scale: 1.5, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
            className="absolute inset-0 rounded-lg border-2"
            style={{ borderColor: TEAL }}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>
      <div className={
        'flex h-8 w-8 items-center justify-center rounded-lg transition-colors duration-400 ' +
        (glowing ? 'bg-[#079E96]/10' : 'bg-[#079E96]/5')
      }>
        <svg width="20" height="20" viewBox="0 0 28 28" fill="none" aria-hidden="true">
          <motion.path
            d="M14 2L4 7V13C4 19.075 8.4 24.575 14 26C19.6 24.575 24 19.075 24 13V7L14 2Z"
            stroke={TEAL}
            strokeWidth={1.8}
            strokeLinejoin="round"
            fill={glowing ? 'rgba(7,158,150,0.06)' : 'none'}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: drawn ? 1 : 0 }}
            transition={{ pathLength: { duration: reduced ? 0.01 : 0.6, ease: 'easeInOut' } }}
          />
          <motion.path
            d="M10 14L13 17L18 11"
            stroke={TEAL}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: checkOk ? 1 : 0, opacity: checkOk ? 1 : 0 }}
            transition={{
              pathLength: { duration: reduced ? 0.01 : 0.35, delay: reduced ? 0 : 0.5, ease: 'easeOut' },
              opacity: { duration: 0.15, delay: reduced ? 0 : 0.5 },
            }}
          />
        </svg>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [phase, setPhase] = useState<Phase>('idle');
  const [error, setError] = useState('');
  const [shakeKey, setShakeKey] = useState(0);
  const [successGlow, setSuccessGlow] = useState(false);
  const router = useRouter();
  const emailRef = useRef<HTMLInputElement>(null);
  const reduced = useReducedMotion();

  // Auto-focus
  useEffect(() => {
    const t = setTimeout(() => emailRef.current?.focus(), reduced ? 0 : 700);
    return () => clearTimeout(t);
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setPhase('loading');

    try {
      const result = await signIn('credentials', {
        email, password, redirect: false,
      });
      if (result?.error) {
        setError('Unable to sign in. Please check your credentials and try again.');
        setPhase('error');
        setShakeKey((k) => k + 1);
        setTimeout(() => setPhase('idle'), reduced ? 0 : 300);
      } else {
        setPhase('success');
        setSuccessGlow(true);
        await new Promise((r) => setTimeout(r, reduced ? 100 : 1200));
        router.push('/admin/dashboard');
        router.refresh();
      }
    } catch {
      setError('Unable to sign in. Please check your credentials and try again.');
      setPhase('error');
      setShakeKey((k) => k + 1);
      setTimeout(() => setPhase('idle'), reduced ? 0 : 300);
    }
  };

  const loading = phase === 'loading';
  const success = phase === 'success';

  return (
    <div className={`relative flex min-h-screen items-center justify-center overflow-hidden ${successGlow ? 'bg-[#079E96]/[0.02]' : ''} transition-colors duration-700`}>
      <AmbientBackground />

      {/* Skip link */}
      <a
        href="#login-email"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-lg focus:bg-[#079E96] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg focus:outline-none"
      >
        Skip to login form
      </a>

      {/* Login card */}
      <AnimatePresence mode="wait">
        {!success ? (
          <motion.div
            key={`c${shakeKey}`}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={
              phase === 'error'
                ? { opacity: 1, y: 0, scale: 1, x: [0, -3, 3, -2, 2, 0] }
                : { opacity: 1, y: 0, scale: 1 }
            }
            exit={{ opacity: 0, scale: 1.02, filter: 'blur(4px)' }}
            transition={
              phase === 'error'
                ? { x: { duration: 0.35, ease: 'easeInOut' }, opacity: { duration: 0.4 }, scale: { duration: 0.4 }, y: { duration: 0.4 } }
                : { duration: reduced ? 0.01 : 0.55, ease: [0.22, 1, 0.36, 1] }
            }
            className="relative z-10 w-full max-w-[400px] mx-4 sm:mx-6"
            role="region"
            aria-label="Administrator login"
          >
            <div className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] px-7 pt-8 pb-7 sm:px-9 sm:pt-10 sm:pb-9">
              <motion.div variants={stagger} initial="hidden" animate="visible">
                {/* Danphe Health Logo */}
                <motion.div variants={up} className="flex justify-center mb-4">
                  <Image
                    src={LOGO_URL}
                    alt="Danphe Health"
                    width={140}
                    height={38}
                    unoptimized
                    priority
                    className="h-9 w-auto sm:h-10"
                  />
                </motion.div>

                {/* Security shield + Admin Portal */}
                <motion.div variants={up} className="flex flex-col items-center mb-1">
                  <SecurityShield triggerSuccess={false} />
                  <h1
                    className="mt-2.5 text-[22px] font-bold tracking-tight"
                    style={{ color: NAVY, fontFamily: 'var(--font-jakarta), var(--font-geist-sans), sans-serif' }}
                  >
                    Admin Portal
                  </h1>
                  <p className="mt-1 text-[13px]" style={{ color: SLATE }}>
                    Secure administrative access
                  </p>
                </motion.div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="mt-7 space-y-4" noValidate>
                  {/* Email */}
                  <motion.div variants={up}>
                    <label htmlFor="login-email" className="block text-[13px] font-medium mb-1.5" style={{ color: NAVY }}>
                      Administrator email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" style={{ color: SLATE }} aria-hidden="true" />
                      <input
                        ref={emailRef}
                        id="login-email"
                        type="email"
                        required
                        autoComplete="email"
                        placeholder="admin@danphehealth.com"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setError(''); }}
                        disabled={loading || success}
                        className={
                          'w-full h-11 pl-10 pr-4 rounded-xl border text-[14px] bg-white outline-none transition-all duration-200 ' +
                          'placeholder:text-slate-400 disabled:opacity-60 disabled:cursor-not-allowed ' +
                          (error
                            ? 'border-red-300 shadow-[0_0_0_3px_rgba(239,68,68,0.08)]'
                            : 'border-slate-200 hover:border-slate-300 focus:border-[#079E96] focus:shadow-[0_0_0_3px_rgba(7,158,150,0.08)]'
                          )
                        }
                        style={{ color: NAVY }}
                      />
                    </div>
                  </motion.div>

                  {/* Password */}
                  <motion.div variants={up}>
                    <label htmlFor="login-password" className="block text-[13px] font-medium mb-1.5" style={{ color: NAVY }}>
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" style={{ color: SLATE }} aria-hidden="true" />
                      <input
                        id="login-password"
                        type={showPw ? 'text' : 'password'}
                        required
                        autoComplete="current-password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setError(''); }}
                        disabled={loading || success}
                        aria-label="Password"
                        className={
                          'w-full h-11 pl-10 pr-11 rounded-xl border text-[14px] bg-white outline-none transition-all duration-200 ' +
                          'placeholder:text-slate-400 disabled:opacity-60 disabled:cursor-not-allowed ' +
                          (error
                            ? 'border-red-300 shadow-[0_0_0_3px_rgba(239,68,68,0.08)]'
                            : 'border-slate-200 hover:border-slate-300 focus:border-[#079E96] focus:shadow-[0_0_0_3px_rgba(7,158,150,0.08)]'
                          )
                        }
                        style={{ color: NAVY }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw(!showPw)}
                        disabled={loading || success}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-colors duration-150 hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none"
                        style={{ color: SLATE }}
                        aria-label={showPw ? 'Hide password' : 'Show password'}
                      >
                        <AnimatePresence mode="wait" initial={false}>
                          {showPw ? (
                            <motion.span key="off" initial={{ opacity: 0, y: -2 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 2 }} transition={{ duration: 0.1 }} className="flex">
                              <EyeOff className="h-4 w-4" />
                            </motion.span>
                          ) : (
                            <motion.span key="on" initial={{ opacity: 0, y: 2 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -2 }} transition={{ duration: 0.1 }} className="flex">
                              <Eye className="h-4 w-4" />
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </button>
                    </div>
                  </motion.div>

                  {/* Error */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="rounded-xl border border-red-200/70 bg-red-50/80 px-4 py-2.5" role="alert">
                          <p className="text-[13px] font-medium text-red-700">{error}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Submit */}
                  <motion.div variants={up} className="pt-0.5">
                    <button
                      type="submit"
                      disabled={loading || success}
                      className={
                        'group relative w-full h-11 rounded-xl text-[14px] font-semibold tracking-wide transition-all duration-200 outline-none ' +
                        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#079E96] disabled:opacity-90 ' +
                        (loading || success
                          ? 'cursor-wait'
                          : 'cursor-pointer hover:-translate-y-[1px] hover:shadow-[0_4px_16px_rgba(12,74,110,0.15)] active:translate-y-[0.5px] active:shadow-[0_1px_4px_rgba(12,74,110,0.1)]')
                      }
                      style={{
                        background: 'linear-gradient(135deg, #083F5C 0%, #0c4a6e 100%)',
                        color: '#ffffff',
                      }}
                    >
                      {/* Light sweep on hover */}
                      <span
                        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                        style={{
                          background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.1) 45%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.1) 55%, transparent 60%)',
                          backgroundSize: '200% 100%',
                        }}
                        aria-hidden="true"
                      />
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        {loading && (
                          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="32" strokeDashoffset="12" className="opacity-25" />
                            <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                          </svg>
                        )}
                        {loading ? 'Signing in...' : success ? 'Access granted ✓' : 'Sign in to Admin Portal'}
                      </span>
                    </button>
                  </motion.div>
                </form>

                {/* Private access panel */}
                <motion.div variants={up} className="mt-6">
                  <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3.5">
                    <div className="flex items-start gap-2.5">
                      <Shield className="mt-0.5 h-4 w-4 shrink-0" style={{ color: SLATE }} aria-hidden="true" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[12px] font-semibold" style={{ color: NAVY }}>
                          Private administrator access
                        </p>
                        <p className="text-[12px] leading-relaxed mt-0.5" style={{ color: SLATE }}>
                          Admin accounts are provisioned securely through the server CLI. Public registration is disabled.
                        </p>
                        <div className="mt-2 rounded-md bg-white border border-slate-100 px-2.5 py-1.5">
                          <code
                            className="text-[11px] tracking-wide"
                            style={{ color: SLATE, fontFamily: 'var(--font-geist-mono), monospace' }}
                            aria-label="danphe admin provision command"
                          >
                            $ danphe admin provision
                          </code>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        ) : (
          /* Success state */
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative z-10 w-full max-w-[400px] mx-4 sm:mx-6"
            role="status"
            aria-live="assertive"
          >
            <div className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_8px_24px_rgba(0,0,0,0.06)] px-10 pt-14 pb-10 text-center">
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1, duration: 0.35, ease: 'easeOut' }} className="mx-auto mb-4">
                <div className="relative mx-auto flex h-14 w-14 items-center justify-center">
                  <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: [1, 1.5, 2], opacity: [0.25, 0.12, 0] }} transition={{ duration: 1.2, ease: 'easeOut' }} className="absolute inset-0 rounded-full bg-[#079E96]/15" aria-hidden="true" />
                  <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-[#079E96]/8">
                    <svg width="24" height="24" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                      <motion.path d="M14 2L4 7V13C4 19.075 8.4 24.575 14 26C19.6 24.575 24 19.075 24 13V7L14 2Z" stroke={TEAL} strokeWidth={1.8} strokeLinejoin="round" fill="rgba(7,158,150,0.06)" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, ease: 'easeOut' }} />
                      <motion.path d="M10 14L13 17L18 11" stroke={TEAL} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" fill="none" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.3, delay: 0.25, ease: 'easeOut' }} />
                    </svg>
                  </div>
                </div>
              </motion.div>
              <motion.h2 initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.35 }} className="text-lg font-bold mb-1" style={{ color: NAVY, fontFamily: 'var(--font-jakarta), sans-serif' }}>
                Access granted
              </motion.h2>
              <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45, duration: 0.35 }} className="text-sm" style={{ color: SLATE }}>
                Redirecting to dashboard…
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
