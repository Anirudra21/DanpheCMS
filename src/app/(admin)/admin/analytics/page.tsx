'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import {
  Loader2,
  Save,
  BarChart3,
  MousePointerClick,
  Cookie,
  AlertTriangle,
  Activity,
  Globe,
  Facebook,
  Linkedin,
  CheckCircle2,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { AnalyticsConfig, CookieConsentConfig } from '@/lib/system-config';

// ─── Animation Variants ──────────────────────────────────────────────────

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

// ─── Defaults ────────────────────────────────────────────────────────────

const defaultAnalytics: AnalyticsConfig = {
  googleAnalyticsId: '',
  gtmContainerId: '',
  facebookPixelId: '',
  linkedinInsightId: '',
};

const defaultCookieConsent: CookieConsentConfig = {
  bannerText:
    'We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.',
  acceptLabel: 'Accept All',
  rejectLabel: 'Reject All',
};

// ─── Tracking Card ───────────────────────────────────────────────────────

interface TrackingCardProps {
  icon: React.ElementType;
  label: string;
  placeholder: string;
  value: string;
  onChange: (val: string) => void;
 iconBg: string;
  iconColor: string;
}

function TrackingCard({
  icon: Icon,
  label,
  placeholder,
  value,
  onChange,
  iconBg,
  iconColor,
}: TrackingCardProps) {
  const isActive = value.trim().length > 0;

  return (
    <motion.div variants={item} className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${iconBg}`}>
            <Icon className={`h-4 w-4 ${iconColor}`} />
          </div>
          <h3 className="text-sm font-semibold text-slate-900">{label}</h3>
        </div>
        <span
          className={`inline-flex h-2.5 w-2.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-slate-300'}`}
          title={isActive ? 'Active' : 'Inactive'}
        />
      </div>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-9 text-sm font-mono"
      />
    </motion.div>
  );
}

// ─── Page Component ──────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [analytics, setAnalytics] = useState<AnalyticsConfig>(defaultAnalytics);
  const [cookieConsent, setCookieConsent] = useState<CookieConsentConfig>(defaultCookieConsent);

  // ── Fetch both configs on mount ──
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    Promise.all([
      fetch('/api/settings/analytics').then((res) => {
        if (!res.ok) throw new Error('Failed to load analytics settings');
        return res.json();
      }),
      fetch('/api/settings/cookie-consent').then((res) => {
        if (!res.ok) throw new Error('Failed to load cookie consent settings');
        return res.json();
      }),
    ])
      .then(([analyticsData, consentData]) => {
        if (cancelled) return;
        setAnalytics(analyticsData);
        setCookieConsent(consentData);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load settings');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // ── Update analytics field ──
  const updateAnalytics = useCallback(<K extends keyof AnalyticsConfig>(key: K, value: AnalyticsConfig[K]) => {
    setAnalytics((prev) => ({ ...prev, [key]: value }));
  }, []);

  // ── Update cookie consent field ──
  const updateConsent = useCallback(<K extends keyof CookieConsentConfig>(key: K, value: CookieConsentConfig[K]) => {
    setCookieConsent((prev) => ({ ...prev, [key]: value }));
  }, []);

  // ── Submit handler — saves both endpoints in parallel ──
  const handleSave = async () => {
    setSaving(true);
    setError('');

    try {
      const [analyticsRes, consentRes] = await Promise.all([
        fetch('/api/settings/analytics', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(analytics),
        }),
        fetch('/api/settings/cookie-consent', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(cookieConsent),
        }),
      ]);

      const errors: string[] = [];

      if (!analyticsRes.ok) {
        const data = await analyticsRes.json();
        errors.push(data.error || 'Failed to save analytics settings');
      } else {
        const updated = await analyticsRes.json();
        setAnalytics(updated);
      }

      if (!consentRes.ok) {
        const data = await consentRes.json();
        errors.push(data.error || 'Failed to save cookie consent settings');
      } else {
        const updated = await consentRes.json();
        setCookieConsent(updated);
      }

      if (errors.length > 0) {
        throw new Error(errors.join('. '));
      }

      toast.success('Analytics & cookie consent settings saved successfully');
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
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Analytics & Tracking</h1>
        <p className="text-sm text-slate-500 mt-1">
          Configure third-party tracking scripts and cookie consent banner.
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

      {/* ── Tracking Scripts ── */}
      <motion.div variants={item}>
        <div className="flex items-center gap-2.5 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
            <BarChart3 className="h-4 w-4 text-emerald-600" />
          </div>
          <h2 className="text-sm font-semibold text-slate-900">Tracking Scripts</h2>
        </div>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2">
        <TrackingCard
          icon={Activity}
          label="Google Analytics"
          placeholder="G-XXXXXXXXXX"
          value={analytics.googleAnalyticsId}
          onChange={(v) => updateAnalytics('googleAnalyticsId', v)}
          iconBg="bg-orange-50"
          iconColor="text-orange-600"
        />
        <TrackingCard
          icon={Globe}
          label="Google Tag Manager"
          placeholder="GTM-XXXXXXX"
          value={analytics.gtmContainerId}
          onChange={(v) => updateAnalytics('gtmContainerId', v)}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
        />
        <TrackingCard
          icon={Facebook}
          label="Facebook Pixel"
          placeholder="XXXXXXXXXXXXXXX"
          value={analytics.facebookPixelId}
          onChange={(v) => updateAnalytics('facebookPixelId', v)}
          iconBg="bg-indigo-50"
          iconColor="text-indigo-600"
        />
        <TrackingCard
          icon={Linkedin}
          label="LinkedIn Insight"
          placeholder="XXXXXXXXX"
          value={analytics.linkedinInsightId}
          onChange={(v) => updateAnalytics('linkedinInsightId', v)}
          iconBg="bg-sky-50"
          iconColor="text-sky-600"
        />
      </div>

      {/* ── Cookie Consent ── */}
      <motion.div
        variants={item}
        className="rounded-xl border border-slate-200 bg-white p-6 space-y-5"
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50">
            <Cookie className="h-4 w-4 text-amber-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Cookie Consent Banner</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Customize the cookie consent banner displayed to visitors.
            </p>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="bannerText" className="text-sm font-medium text-slate-700">
            Banner Text
          </Label>
          <Textarea
            id="bannerText"
            value={cookieConsent.bannerText}
            onChange={(e) => updateConsent('bannerText', e.target.value)}
            placeholder="We use cookies to enhance your experience..."
            rows={3}
            className="text-sm resize-y"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="acceptLabel" className="text-sm font-medium text-slate-700">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                Accept Button Label
              </span>
            </Label>
            <Input
              id="acceptLabel"
              value={cookieConsent.acceptLabel}
              onChange={(e) => updateConsent('acceptLabel', e.target.value)}
              placeholder="Accept All"
              className="h-9 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="rejectLabel" className="text-sm font-medium text-slate-700">
              <span className="flex items-center gap-1.5">
                <MousePointerClick className="h-3.5 w-3.5 text-slate-500" />
                Reject Button Label
              </span>
            </Label>
            <Input
              id="rejectLabel"
              value={cookieConsent.rejectLabel}
              onChange={(e) => updateConsent('rejectLabel', e.target.value)}
              placeholder="Reject All"
              className="h-9 text-sm"
            />
          </div>
        </div>
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
