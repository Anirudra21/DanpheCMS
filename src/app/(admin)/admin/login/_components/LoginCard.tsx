'use client';

import { useState, useRef, useEffect, type FormEvent } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Terminal, Shield } from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────────────

type AuthPhase = 'idle' | 'loading' | 'success' | 'error';

export interface LoginCardProps {
  onSuccessStart?: () => void;
}

// ─── Colors ─────────────────────────────────────────────────────────────────

const NAVY = '#083F5C';
const TEAL = '#079E96';
const SLATE = '#607087';

// ─── Animation Variants ─────────────────────────────────────────────────────

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.15 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

// ─── Shield Icon ─────────────────────────────────────────────────────────────

function AnimatedShield({ triggerSuccess }: { triggerSuccess: boolean }) {
  const [phase, setPhase] = useState<'drawing' | 'idle' | 'success'>('drawing');
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) { setPhase('idle'); return; }
    const t = setTimeout(() => setPhase('idle'), 1200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (triggerSuccess && !reduced) {
      setPhase('success');
      const t = setTimeout(() => setPhase('idle'), 1600);
      return () => clearTimeout(t);
    }
  }, [triggerSuccess]);

  const drawn = phase !== 'drawing';
  const checkDrawn = phase === 'idle' || phase === 'success';
  const isOk = phase === 'success';

  return (
    <div className="relative mx-auto flex h-14 w-14 items-center justify-center">
      <AnimatePresence>
        {(phase === 'drawing' || isOk) && !reduced && (
          <motion.div
            key={phase}
            initial={{ scale: 0.8, opacity: 0.5 }}
            animate={{ scale: 1.5, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="absolute inset-0 rounded-xl border-2"
            style={{ borderColor: TEAL }}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>
      <div
        className={
          'relative flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-500 ' +
          (isOk ? 'bg-[#079E96]/15' : 'bg-white/60')
        }
      >
        <svg width="24" height="24" viewBox="0 0 28 28" fill="none" aria-hidden="true">
          <motion.path
            d="M14 2L4 7V13C4 19.075 8.4 24.575 14 26C19.6 24.575 24 19.075 24 13V7L14 2Z"
            stroke={isOk ? TEAL : NAVY}
            strokeWidth={1.8}
            strokeLinejoin="round"
            fill={isOk ? 'rgba(7,158,150,0.08)' : 'none'}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: drawn ? 1 : 0 }}
            transition={{ pathLength: { duration: reduced ? 0.01 : 0.7, ease: 'easeInOut' } }}
          />
          <motion.path
            d="M10 14L13 17L18 11"
            stroke={TEAL}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: checkDrawn ? 1 : 0, opacity: checkDrawn ? 1 : 0 }}
            transition={{
              pathLength: { duration: reduced ? 0.01 : 0.4, ease: 'easeOut', delay: reduced ? 0 : 0.6 },
              opacity: { duration: 0.2, delay: reduced ? 0 : 0.6 },
            }}
          />
        </svg>
      </div>
    </div>
  );
}

// ─── CLI Provision Panel ────────────────────────────────────────────────────

function CLIProvisionPanel() {
  const [show, setShow] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    const t = setTimeout(() => setShow(true), reduced ? 0 : 800);
    return () => clearTimeout(t);
  }, []);

  if (!show) return <div className="h-20" aria-hidden="true" />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduced ? 0.01 : 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="relative rounded-xl bg-white/40 border border-white/50 p-3.5 overflow-hidden"
    >
      {/* One-time traveling glow */}
      <AnimatePresence>
        {!reduced && (
          <motion.div
            initial={{ x: '-30%', opacity: 0 }}
            animate={{ x: '130%', opacity: [0, 0.25, 0.25, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2, ease: 'easeInOut', delay: 0.4 }}
            className="absolute top-1/2 -translate-y-1/2 h-px w-3/4"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(7,158,150,0.4), transparent)' }}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <div className="flex items-start gap-2.5">
        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/60">
          <Terminal className="h-3.5 w-3.5" style={{ color: SLATE }} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 mb-1">
            <Shield className="h-3 w-3" style={{ color: SLATE }} />
            <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: NAVY }}>
              Private administrator access
            </span>
          </div>
          <p className="text-[12px] leading-relaxed" style={{ color: SLATE }}>
            Admin accounts are provisioned securely through the server CLI. Public registration is disabled.
          </p>
          <div className="mt-2 rounded-lg bg-white/50 border border-white/60 px-2.5 py-1.5">
            <code
              className="text-[11px] tracking-wide"
              style={{ color: NAVY, fontFamily: 'var(--font-geist-mono), monospace' }}
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

// ─── Main Login Card ─────────────────────────────────────────────────────────

export default function LoginCard({ onSuccessStart }: LoginCardProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phase, setPhase] = useState<AuthPhase>('idle');
  const [authError, setAuthError] = useState('');
  const [shakeKey, setShakeKey] = useState(0);
  const router = useRouter();
  const emailRef = useRef<HTMLInputElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const t = setTimeout(() => emailRef.current?.focus(), reduced ? 0 : 900);
    return () => clearTimeout(t);
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setPhase('loading');

    try {
      const result = await signIn('credentials', {
        email, password, redirect: false,
      });

      if (result?.error) {
        setAuthError('Unable to verify administrator credentials.');
        setPhase('error');
        setShakeKey((k) => k + 1);
        setTimeout(() => setPhase('idle'), reduced ? 0 : 300);
      } else {
        setPhase('success');
        onSuccessStart?.();
        await new Promise((r) => setTimeout(r, reduced ? 100 : 1500));
        router.push('/admin/dashboard');
        router.refresh();
      }
    } catch {
      setAuthError('Unable to verify administrator credentials.');
      setPhase('error');
      setShakeKey((k) => k + 1);
      setTimeout(() => setPhase('idle'), reduced ? 0 : 300);
    }
  };

  const isLoading = phase === 'loading';
  const isSuccess = phase === 'success';
  const isError = phase === 'error';

  return (
    <>
      <AnimatePresence mode="wait">
        {!isSuccess ? (
          <motion.div
            key={`card-${shakeKey}`}
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={
              isError
                ? { opacity: 1, y: 0, scale: 1, x: [0, -4, 4, -3, 3, 0] }
                : { opacity: 1, y: 0, scale: 1 }
            }
            exit={{ opacity: 0, scale: 1.03, filter: 'blur(4px)' }}
            transition={
              isError
                ? { opacity: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }, scale: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }, x: { duration: 0.35, ease: 'easeInOut' } }
                : { duration: reduced ? 0.01 : 0.7, ease: [0.22, 1, 0.36, 1] }
            }
            className="relative z-10 w-full max-w-[440px] mx-4 sm:mx-6"
            role="region"
            aria-label="Administrator login"
          >
            <div
              className={
                'rounded-3xl px-7 pt-9 pb-7 sm:px-9 sm:pt-11 sm:pb-9 ' +
                'bg-white/[0.55] backdrop-blur-xl ' +
                'border border-white/50 ' +
                'shadow-[0_8px_32px_rgba(0,0,0,0.08),0_2px_8px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.6)]'
              }
            >
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                {/* Shield */}
                <motion.div variants={fadeUp} className="flex justify-center mb-4">
                  <AnimatedShield triggerSuccess={false} />
                </motion.div>

                {/* Branding */}
                <motion.div variants={fadeUp} className="text-center mb-1.5">
                  <h1
                    className="text-[26px] font-bold tracking-tight leading-tight"
                    style={{ fontFamily: 'var(--font-jakarta), var(--font-geist-sans), sans-serif' }}
                  >
                    <span style={{ color: NAVY }}>Danphe </span>
                    <span style={{ color: TEAL }}>CMS</span>
                  </h1>
                  <p className="mt-1 text-[13px]" style={{ color: SLATE }}>
                    Secure administrative access
                  </p>
                </motion.div>

                {/* Admin Portal Badge */}
                <motion.div variants={fadeUp} className="flex justify-center mb-6">
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-widest bg-white/50 border border-white/60"
                    style={{ color: TEAL }}
                  >
                    <span className="relative flex h-1.5 w-1.5">
                      <span
                        className="absolute inset-0 rounded-full"
                        style={{ backgroundColor: TEAL, animation: 'ping 2s cubic-bezier(0,0,0.2,1) infinite' }}
                      />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full" style={{ backgroundColor: TEAL }} />
                    </span>
                    Admin Portal
                  </span>
                </motion.div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                  {/* Email */}
                  <motion.div variants={fadeUp}>
                    <label
                      htmlFor="login-email"
                      className="block text-[13px] font-medium mb-1.5"
                      style={{ color: NAVY }}
                    >
                      Administrator email
                    </label>
                    <div className="relative">
                      <Mail
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none transition-colors duration-200"
                        style={{ color: SLATE }}
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
                          'w-full h-11 pl-10 pr-4 rounded-xl border text-[14px] placeholder:opacity-50 ' +
                          'bg-white/70 backdrop-blur-sm outline-none transition-all duration-200 ' +
                          (isError && authError
                            ? 'border-red-300/70 shadow-[0_0_0_3px_rgba(239,68,68,0.08)]'
                            : 'border-white/50 hover:border-white/70 focus:border-[#079E96]/50 focus:shadow-[0_0_0_3px_rgba(7,158,150,0.1)]') +
                          ' disabled:opacity-60 disabled:cursor-not-allowed'
                        }
                        style={{ color: NAVY }}
                      />
                    </div>
                  </motion.div>

                  {/* Password */}
                  <motion.div variants={fadeUp}>
                    <label
                      htmlFor="login-password"
                      className="block text-[13px] font-medium mb-1.5"
                      style={{ color: NAVY }}
                    >
                      Password
                    </label>
                    <div className="relative">
                      <Lock
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none transition-colors duration-200"
                        style={{ color: SLATE }}
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
                          'w-full h-11 pl-10 pr-11 rounded-xl border text-[14px] placeholder:opacity-50 ' +
                          'bg-white/70 backdrop-blur-sm outline-none transition-all duration-200 ' +
                          (isError && authError
                            ? 'border-red-300/70 shadow-[0_0_0_3px_rgba(239,68,68,0.08)]'
                            : 'border-white/50 hover:border-white/70 focus:border-[#079E96]/50 focus:shadow-[0_0_0_3px_rgba(7,158,150,0.1)]') +
                          ' disabled:opacity-60 disabled:cursor-not-allowed'
                        }
                        style={{ color: NAVY }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading || isSuccess}
                        className={
                          'absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-all duration-200 ' +
                          'hover:bg-white/40 disabled:opacity-40 disabled:pointer-events-none'
                        }
                        style={{ color: SLATE }}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        <AnimatePresence mode="wait" initial={false}>
                          {showPassword ? (
                            <motion.span key="off" initial={{ opacity: 0, y: -3 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 3 }} transition={{ duration: 0.12 }} className="flex">
                              <EyeOff className="h-4 w-4" />
                            </motion.span>
                          ) : (
                            <motion.span key="on" initial={{ opacity: 0, y: 3 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -3 }} transition={{ duration: 0.12 }} className="flex">
                              <Eye className="h-4 w-4" />
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </button>
                    </div>
                  </motion.div>

                  {/* Error */}
                  <AnimatePresence>
                    {authError && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div
                          className="rounded-xl border border-red-200/60 bg-red-50/80 backdrop-blur-sm px-4 py-2.5"
                          role="alert"
                        >
                          <p className="text-[13px] font-medium text-red-700">
                            Unable to verify administrator credentials.
                          </p>
                          <p className="text-[12px] text-red-500/80 mt-0.5">
                            Only provisioned administrators can access this environment.
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Button */}
                  <motion.div variants={fadeUp} className="pt-0.5">
                    <button
                      type="submit"
                      disabled={isLoading || isSuccess}
                      className={
                        'group relative w-full h-11 rounded-xl text-[14px] font-semibold tracking-wide ' +
                        'transition-all duration-200 outline-none ' +
                        'focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-90 ' +
                        (isLoading || isSuccess
                          ? 'cursor-wait'
                          : 'cursor-pointer hover:-translate-y-[1px] hover:shadow-[0_6px_20px_rgba(8,63,92,0.2)] active:translate-y-[1px]')
                      }
                      style={{
                        background: 'linear-gradient(135deg, #083F5C 0%, #0c4a6e 50%, #083F5C 100%)',
                        color: '#ffffff',
                      }}
                    >
                      {!isLoading && !isSuccess && (
                        <span
                          className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                          style={{
                            background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 45%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.15) 55%, transparent 60%)',
                            backgroundSize: '200% 100%',
                          }}
                        />
                      )}
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        {isLoading && (
                          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="32" strokeDashoffset="12" className="opacity-25" />
                            <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                          </svg>
                        )}
                        {isSuccess && (
                          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
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

                {/* CLI Panel */}
                <motion.div variants={fadeUp} className="mt-5">
                  <CLIProvisionPanel />
                </motion.div>

                {/* Restricted Environment */}
                <motion.div variants={fadeUp} className="mt-4 pt-4 border-t border-white/40">
                  <div className="flex items-center justify-center gap-1.5" style={{ color: SLATE }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="opacity-60">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <span className="text-[10px] font-semibold uppercase tracking-wider">
                      Restricted environment
                    </span>
                  </div>
                  <p className="mt-1 text-center text-[11px] opacity-70" style={{ color: SLATE }}>
                    Access is limited to provisioned Danphe administrators.
                  </p>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        ) : (
          /* Success Overlay */
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: reduced ? 0.01 : 0.3 }}
            className="relative z-10 w-full max-w-[440px] mx-4 sm:mx-6"
            role="status"
            aria-live="assertive"
          >
            <div
              className={
                'rounded-3xl px-10 pt-14 pb-10 text-center ' +
                'bg-white/60 backdrop-blur-xl border border-white/50 ' +
                'shadow-[0_8px_32px_rgba(0,0,0,0.08)]'
              }
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: reduced ? 0 : 0.1, duration: 0.4, ease: 'easeOut' }}
                className="mx-auto mb-5"
              >
                <div className="relative mx-auto flex h-16 w-16 items-center justify-center">
                  <motion.div
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: [1, 1.5, 2], opacity: [0.3, 0.15, 0] }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                    className="absolute inset-0 rounded-full bg-[#079E96]/20"
                    aria-hidden="true"
                  />
                  <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-[#079E96]/10">
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                      <motion.path
                        d="M14 2L4 7V13C4 19.075 8.4 24.575 14 26C19.6 24.575 24 19.075 24 13V7L14 2Z"
                        stroke={TEAL}
                        strokeWidth={1.8}
                        strokeLinejoin="round"
                        fill="rgba(7,158,150,0.08)"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                      />
                      <motion.path
                        d="M10 14L13 17L18 11"
                        stroke={TEAL}
                        strokeWidth={2.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.35, delay: 0.25, ease: 'easeOut' }}
                      />
                    </svg>
                  </div>
                </div>
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: reduced ? 0 : 0.4, duration: 0.4 }}
                className="text-lg font-bold mb-1"
                style={{ color: NAVY, fontFamily: 'var(--font-jakarta), sans-serif' }}
              >
                Identity verified
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: reduced ? 0 : 0.55, duration: 0.4 }}
                className="text-sm" style={{ color: SLATE }}
              >
                Secure access granted
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: reduced ? 0 : 0.8, duration: 0.3 }}
                className="text-xs opacity-60 mt-3" style={{ color: SLATE }}
              >
                Opening dashboard...
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
