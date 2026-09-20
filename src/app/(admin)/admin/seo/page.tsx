'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  Loader2,
  Save,
  Search,
  Image,
  ShieldCheck,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

// ─── Animation Variants ──────────────────────────────────────────────────

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

// ─── Section Wrapper ─────────────────────────────────────────────────────

function SectionCard({
  icon: Icon,
  title,
  accentColor = 'bg-slate-100',
  iconColor = 'text-slate-600',
  children,
}: {
  icon: React.ElementType;
  title: string;
  accentColor?: string;
  iconColor?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      variants={item}
      className="rounded-xl border border-slate-200 bg-white p-6 space-y-5"
    >
      <div className="flex items-center gap-2.5">
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${accentColor}`}>
          <Icon className={`h-4 w-4 ${iconColor}`} />
        </div>
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      </div>
      {children}
    </motion.div>
  );
}

// ─── Field Wrapper ───────────────────────────────────────────────────────

function FormField({
  id,
  label,
  children,
  hint,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-sm font-medium text-slate-700">
        {label}
      </Label>
      {children}
      {hint && <p className="text-[11px] text-slate-400">{hint}</p>}
    </div>
  );
}

// ─── Default Values ──────────────────────────────────────────────────────

const defaults = {
  id: '',
  titleTemplate: '%s | Danphe Health',
  metaDescription: '',
  ogImageUrl: '',
  faviconUrl: '',
  googleVerify: '',
  bingVerify: '',
  faqSchemaEnabled: false,
  robotsTxt: 'User-agent: *\nAllow: /\nDisallow: /admin/\nSitemap: https://danphehealth.com/sitemap.xml',
  sitemapUrl: 'https://danphehealth.com/sitemap.xml',
};

// ─── Page Component ──────────────────────────────────────────────────────

export default function SeoSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState(defaults);

  // ── Fetch settings on mount ──
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    fetch('/api/seo/global')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load SEO settings');
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        setForm(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load SEO settings');
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
  const update = (key: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // ── Submit handler ──
  const handleSave = async () => {
    setSaving(true);
    setError('');

    try {
      const { id: _id, createdAt, updatedAt, lastSitemapGen, ...payload } = form;

      const res = await fetch('/api/seo/global', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save SEO settings');
      }

      const updated = await res.json();
      setForm(updated);
      toast.success('SEO settings saved successfully');
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

  const inputCls = 'h-9 text-sm focus:ring-2 focus:ring-danphe-accent/30 focus:border-danphe-accent/50';
  const textareaCls = 'text-sm resize-y focus:ring-2 focus:ring-danphe-accent/30 focus:border-danphe-accent/50';

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* ── Page Header ── */}
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">SEO Settings</h1>
        <p className="text-sm text-slate-500 mt-1">
          Configure global SEO settings, meta defaults, and search engine verification.
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
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </motion.div>
      )}

      {/* ── Section 1: Title & Meta Defaults ── */}
      <SectionCard
        icon={Search}
        title="Title & Meta Defaults"
        accentColor="bg-emerald-50"
        iconColor="text-emerald-600"
      >
        <FormField id="titleTemplate" label="Title Template" hint="Use %s as a placeholder for the page title.">
          <Input
            id="titleTemplate"
            value={form.titleTemplate}
            onChange={(e) => update('titleTemplate', e.target.value)}
            placeholder="%s | Danphe Health"
            className={inputCls}
          />
        </FormField>

        <FormField id="metaDescription" label="Default Meta Description" hint="Fallback description if a page doesn't have its own.">
          <Textarea
            id="metaDescription"
            value={form.metaDescription}
            onChange={(e) => update('metaDescription', e.target.value)}
            placeholder="Danphe Health provides open-source hospital management software..."
            rows={3}
            className={textareaCls}
          />
        </FormField>
      </SectionCard>

      {/* ── Section 2: Open Graph & Favicon ── */}
      <SectionCard
        icon={Image}
        title="Open Graph & Favicon"
        accentColor="bg-violet-50"
        iconColor="text-violet-600"
      >
        <FormField id="ogImageUrl" label="Default OG Image URL" hint="Used as the default image when pages are shared on social media.">
          <Input
            id="ogImageUrl"
            type="url"
            value={form.ogImageUrl}
            onChange={(e) => update('ogImageUrl', e.target.value)}
            placeholder="/og-default.jpg"
            className={inputCls}
          />
        </FormField>

        <FormField id="faviconUrl" label="Favicon URL" hint="Path to the site favicon.">
          <Input
            id="faviconUrl"
            type="url"
            value={form.faviconUrl}
            onChange={(e) => update('faviconUrl', e.target.value)}
            placeholder="/favicon.ico"
            className={inputCls}
          />
        </FormField>
      </SectionCard>

      {/* ── Section 3: Search Engine Verification ── */}
      <SectionCard
        icon={ShieldCheck}
        title="Search Engine Verification"
        accentColor="bg-amber-50"
        iconColor="text-amber-600"
      >
        <FormField id="googleVerify" label="Google Site Verification Code" hint="The meta tag content value from Google Search Console.">
          <Input
            id="googleVerify"
            value={form.googleVerify}
            onChange={(e) => update('googleVerify', e.target.value)}
            placeholder="xxxxxxxxxxxxxxxx"
            className={inputCls}
          />
        </FormField>

        <FormField id="bingVerify" label="Bing Site Verification Code" hint="The meta tag content value from Bing Webmaster Tools.">
          <Input
            id="bingVerify"
            value={form.bingVerify}
            onChange={(e) => update('bingVerify', e.target.value)}
            placeholder="xxxxxxxxxxxxxxxx"
            className={inputCls}
          />
        </FormField>
      </SectionCard>

      {/* ── Section 4: Structured Data & Sitemap ── */}
      <SectionCard
        icon={FileText}
        title="Structured Data & Sitemap"
        accentColor="bg-sky-50"
        iconColor="text-sky-600"
      >
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="faqSchemaEnabled" className="text-sm font-medium text-slate-700">
              FAQ Schema (JSON-LD)
            </Label>
            <p className="text-[11px] text-slate-400">Automatically inject FAQ structured data on pages that have FAQs.</p>
          </div>
          <Switch
            id="faqSchemaEnabled"
            checked={form.faqSchemaEnabled}
            onCheckedChange={(v) => update('faqSchemaEnabled', v)}
          />
        </div>

        <FormField id="sitemapUrl" label="Sitemap URL" hint="The URL to your XML sitemap.">
          <Input
            id="sitemapUrl"
            type="url"
            value={form.sitemapUrl}
            onChange={(e) => update('sitemapUrl', e.target.value)}
            placeholder="https://danphehealth.com/sitemap.xml"
            className={inputCls}
          />
        </FormField>
      </SectionCard>

      {/* ── Section 5: robots.txt ── */}
      <SectionCard
        icon={FileText}
        title="robots.txt"
        accentColor="bg-rose-50"
        iconColor="text-rose-600"
      >
        <FormField id="robotsTxt" label="robots.txt Content" hint="Raw content for the robots.txt file.">
          <Textarea
            id="robotsTxt"
            value={form.robotsTxt}
            onChange={(e) => update('robotsTxt', e.target.value)}
            rows={8}
            className={`${textareaCls} font-mono text-xs`}
          />
        </FormField>
      </SectionCard>

      {/* ── Save Button ── */}
      <motion.div variants={item}>
        <Button
          type="button"
          disabled={saving}
          onClick={handleSave}
          className="bg-danphe-accent hover:bg-danphe-accent/90 text-white h-9 gap-2 text-sm font-medium"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving…
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save SEO Settings
            </>
          )}
        </Button>
      </motion.div>
    </motion.div>
  );
}
