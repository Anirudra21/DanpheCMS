'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Loader2, Save, Settings, Globe, Share2, FileText, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { motion } from 'framer-motion';
import { ImageUpload } from '../_components/ImageUpload';

// ─── Animation ──────────────────────────────────────────────────────────

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

// ─── Types ────────────────────────────────────────────────────────────────

type SettingsData = {
  id: string;
  logo: string;
  email: string;
  phone: string;
  facebookUrl: string;
  instagramUrl: string;
  address: string;
  mapEmbedUrl: string;
  footerText: string;
  copyrightText: string;
};

// ─── Page ────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const form = useForm<SettingsData>({
    defaultValues: {
      id: '',
      logo: '',
      email: '',
      phone: '',
      facebookUrl: '',
      instagramUrl: '',
      address: '',
      mapEmbedUrl: '',
      footerText: '',
      copyrightText: '',
    },
  });

  const { register, handleSubmit, watch, setValue, reset } = form;

  // Fetch settings on mount
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch('/api/settings')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load settings');
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        reset(data);
      })
      .catch(() => {
        // keep defaults
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [reset]);

  const onSubmit = async (values: SettingsData) => {
    setSaving(true);
    setSuccess(false);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error('Failed to save settings');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      // error handled silently for now
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
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Site Settings</h1>
        <p className="text-sm text-slate-500 mt-1">
          Configure your website&apos;s global settings, contact information, and social links.
        </p>
      </motion.div>

      {/* Success banner */}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Settings saved successfully.
        </motion.div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* ── Branding Section ── */}
        <motion.div variants={item} className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
              <Settings className="h-4 w-4 text-slate-600" />
            </div>
            <h2 className="text-sm font-semibold text-slate-900">Branding</h2>
          </div>
          <ImageUpload
            value={watch('logo')}
            onChange={(url) => setValue('logo', url)}
            folder="settings"
            label="Company Logo"
          />
        </motion.div>

        {/* ── Contact Information Section ── */}
        <motion.div variants={item} className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
              <Globe className="h-4 w-4 text-slate-600" />
            </div>
            <h2 className="text-sm font-semibold text-slate-900">Contact Information</h2>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm font-medium text-slate-700">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="e.g. info@danphehealth.com"
              className="h-9 text-sm"
              {...register('email')}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone" className="text-sm font-medium text-slate-700">
              Phone
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="e.g. +977-1-1234567"
              className="h-9 text-sm"
              {...register('phone')}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="address" className="text-sm font-medium text-slate-700">
              Address
            </Label>
            <Textarea
              id="address"
              placeholder="Full company address"
              rows={2}
              className="text-sm resize-y"
              {...register('address')}
            />
          </div>
        </motion.div>

        {/* ── Social Links Section ── */}
        <motion.div variants={item} className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
              <Share2 className="h-4 w-4 text-slate-600" />
            </div>
            <h2 className="text-sm font-semibold text-slate-900">Social Links</h2>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="facebookUrl" className="text-sm font-medium text-slate-700">
              Facebook URL
            </Label>
            <Input
              id="facebookUrl"
              type="url"
              placeholder="https://facebook.com/your-page"
              className="h-9 text-sm"
              {...register('facebookUrl')}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="instagramUrl" className="text-sm font-medium text-slate-700">
              Instagram URL
            </Label>
            <Input
              id="instagramUrl"
              type="url"
              placeholder="https://instagram.com/your-profile"
              className="h-9 text-sm"
              {...register('instagramUrl')}
            />
          </div>
        </motion.div>

        {/* ── Footer Section ── */}
        <motion.div variants={item} className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
              <FileText className="h-4 w-4 text-slate-600" />
            </div>
            <h2 className="text-sm font-semibold text-slate-900">Footer</h2>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="footerText" className="text-sm font-medium text-slate-700">
              Footer Text
            </Label>
            <Textarea
              id="footerText"
              placeholder="Text displayed in the footer area"
              rows={3}
              className="text-sm resize-y"
              {...register('footerText')}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="copyrightText" className="text-sm font-medium text-slate-700">
              Copyright Text
            </Label>
            <Input
              id="copyrightText"
              placeholder="e.g. © 2024 Danphe Health. All rights reserved."
              className="h-9 text-sm"
              {...register('copyrightText')}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="mapEmbedUrl" className="text-sm font-medium text-slate-700">
              Map Embed URL
            </Label>
            <Input
              id="mapEmbedUrl"
              type="url"
              placeholder="Paste a Google Maps embed URL"
              className="h-9 text-sm"
              {...register('mapEmbedUrl')}
            />
            <p className="text-[11px] text-slate-400">
              Paste a Google Maps embed URL to display a map in the footer or contact section.
            </p>
          </div>
        </motion.div>

        {/* ── Actions ── */}
        <motion.div variants={item}>
          <Button
            type="submit"
            disabled={saving}
            className="h-9 gap-2 text-sm font-medium"
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
      </form>
    </motion.div>
  );
}
