'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import {
  Loader2,
  Save,
  ShieldAlert,
  AlertTriangle,
  Clock,
  ShieldCheck,
  ToggleLeft,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import type { MaintenanceConfig } from '@/lib/system-config';

// ─── Animation Variants ──────────────────────────────────────────────────

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

// ─── Default Config ──────────────────────────────────────────────────────

const defaults: MaintenanceConfig = {
  enabled: false,
  heading: "We'll Be Back Soon",
  message: "We're performing scheduled maintenance. We'll be back up shortly.",
  returnTime: '',
  ipAllowlist: '',
};

// ─── Page Component ──────────────────────────────────────────────────────

export default function MaintenancePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [config, setConfig] = useState<MaintenanceConfig>(defaults);

  // ── Fetch config on mount ──
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    fetch('/api/settings/maintenance')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load maintenance settings');
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        setConfig(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load maintenance settings');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // ── Update a single field ──
  const update = useCallback(<K extends keyof MaintenanceConfig>(key: K, value: MaintenanceConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  }, []);

  // ── Submit handler ──
  const handleSave = async () => {
    setSaving(true);
    setError('');

    try {
      const res = await fetch('/api/settings/maintenance', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save maintenance settings');
      }

      const updated = await res.json();
      setConfig(updated);
      toast.success('Maintenance settings saved successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  // ── Loading state ──
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* ── Page Header ── */}
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Maintenance Mode</h1>
        <p className="text-sm text-slate-500 mt-1">
          Enable maintenance mode to display a public-facing message while your site is offline.
        </p>
      </motion.div>

      {/* ── Error Banner ── */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="flex items-center gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {error}
        </motion.div>
      )}

      {/* ── Amber Alert Banner when enabled ── */}
      <AnimatePresence>
        {config.enabled && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
          >
            <Alert className="border-amber-200 bg-amber-50 text-amber-800">
              <ShieldAlert className="h-4 w-4 text-amber-600" />
              <AlertTitle className="text-amber-800">Maintenance Mode is Active</AlertTitle>
              <AlertDescription className="text-amber-700">
                Your site is currently in maintenance mode. Visitors will see the maintenance page instead of your website.
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Toggle Card ── */}
      <motion.div
        variants={item}
        className="rounded-xl border border-slate-200 bg-white p-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${config.enabled ? 'bg-amber-50' : 'bg-slate-100'}`}>
              <ToggleLeft className={`h-5 w-5 ${config.enabled ? 'text-amber-600' : 'text-slate-500'}`} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Enable Maintenance Mode</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {config.enabled
                  ? 'Site visitors will see the maintenance page'
                  : 'Site is accessible to all visitors'}
              </p>
            </div>
          </div>
          <Switch
            checked={config.enabled}
            onCheckedChange={(checked) => update('enabled', checked)}
            className="data-[state=checked]:bg-amber-500"
          />
        </div>
      </motion.div>

      {/* ── Form Fields ── */}
      <motion.div
        variants={container}
        className="grid gap-6 md:grid-cols-2"
      >
        {/* Heading */}
        <motion.div
          variants={item}
          className="rounded-xl border border-slate-200 bg-white p-5 space-y-4"
        >
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50">
              <ShieldAlert className="h-4 w-4 text-sky-600" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">Maintenance Page Content</h3>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="heading" className="text-sm font-medium text-slate-700">
              Heading
            </Label>
            <Input
              id="heading"
              value={config.heading}
              onChange={(e) => update('heading', e.target.value)}
              placeholder="We'll Be Back Soon"
              className="h-9 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="message" className="text-sm font-medium text-slate-700">
              Message
            </Label>
            <Textarea
              id="message"
              value={config.message}
              onChange={(e) => update('message', e.target.value)}
              placeholder="We're performing scheduled maintenance..."
              rows={4}
              className="text-sm resize-y"
            />
          </div>
        </motion.div>

        {/* Schedule & Access */}
        <motion.div
          variants={item}
          className="rounded-xl border border-slate-200 bg-white p-5 space-y-4"
        >
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50">
              <Clock className="h-4 w-4 text-violet-600" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">Schedule & Access</h3>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="returnTime" className="text-sm font-medium text-slate-700">
              Estimated Return Time
            </Label>
            <Input
              id="returnTime"
              type="datetime-local"
              value={config.returnTime}
              onChange={(e) => update('returnTime', e.target.value)}
              className="h-9 text-sm"
            />
            <p className="text-[11px] text-slate-400">
              Displayed to visitors so they know when to check back.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ipAllowlist" className="text-sm font-medium text-slate-700">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5" />
                IP Allowlist
              </span>
            </Label>
            <Textarea
              id="ipAllowlist"
              value={config.ipAllowlist}
              onChange={(e) => update('ipAllowlist', e.target.value)}
              placeholder={'192.168.1.1, 10.0.0.0/24'}
              rows={3}
              className="text-sm resize-y font-mono"
            />
            <p className="text-[11px] text-slate-400">
              Comma-separated IPs or CIDR ranges that bypass maintenance mode.
            </p>
          </div>
        </motion.div>
      </motion.div>

      {/* ── Save Button ── */}
      <motion.div variants={item}>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="h-9 gap-2 text-sm font-medium bg-danphe-accent hover:bg-danphe-accent/90 text-white"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving…
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Settings
            </>
          )}
        </Button>
      </motion.div>
    </motion.div>
  );
}
