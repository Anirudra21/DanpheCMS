'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod/v4';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
  Loader2,
  Save,
  Palette,
  Globe,
  Share2,
  MapPin,
  AlertCircle,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ImageUpload } from '../_components/ImageUpload';

// ─── Animation Variants ──────────────────────────────────────────────────

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

// ─── Zod Schema ──────────────────────────────────────────────────────────

const settingsSchema = z.object({
  id: z.string().optional(),
  logo: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  facebookUrl: z.string().optional(),
  instagramUrl: z.string().optional(),
  address: z.string().optional(),
  mapEmbedUrl: z.string().optional(),
  footerText: z.string().optional(),
  copyrightText: z.string().optional(),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

// ─── Default Values ──────────────────────────────────────────────────────

const defaults: SettingsFormData = {
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

// ─── Page Component ──────────────────────────────────────────────────────

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: defaults,
  });

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = form;

  // ── Fetch settings on mount ──
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    fetch('/api/site-settings')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load settings');
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        reset(data);
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
  }, [reset]);

  // ── Submit handler ──
  const onSubmit = async (values: SettingsFormData) => {
    setSaving(true);
    setError('');

    try {
      const { id: _id, ...payload } = values;

      const res = await fetch('/api/site-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save settings');
      }

      const updated = await res.json();
      reset(updated);
      toast.success('Settings saved successfully');
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
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Site Settings</h1>
        <p className="text-sm text-slate-500 mt-1">
          Configure global site settings, contact info, and branding.
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

      {/* ── Form ── */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* ── Section 1: Branding ── */}
        <SectionCard
          icon={Palette}
          title="Branding"
          accentColor="bg-amber-50"
          iconColor="text-amber-600"
        >
          <ImageUpload
            value={watch('logo') ?? ''}
            onChange={(url) => setValue('logo', url, { shouldValidate: true })}
            folder="settings"
            label="Company Logo"
          />
          {errors.logo && (
            <p className="text-xs text-red-500 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.logo.message}
            </p>
          )}
        </SectionCard>

        {/* ── Section 2: Contact Information ── */}
        <SectionCard
          icon={Globe}
          title="Contact Information"
          accentColor="bg-sky-50"
          iconColor="text-sky-600"
        >
          <FormField id="email" label="Email">
            <Input
              id="email"
              type="email"
              placeholder="e.g. info@danphehealth.com"
              className={
                'h-9 text-sm' +
                (errors.email ? ' border-red-300 focus:border-red-300 focus:ring-red-200' : '')
              }
              {...register('email')}
            />
            {errors.email && (
              <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                <AlertCircle className="h-3 w-3" />
                {errors.email.message}
              </p>
            )}
          </FormField>

          <FormField id="phone" label="Phone">
            <Input
              id="phone"
              type="tel"
              placeholder="e.g. +977-1-1234567"
              className={
                'h-9 text-sm' +
                (errors.phone ? ' border-red-300 focus:border-red-300 focus:ring-red-200' : '')
              }
              {...register('phone')}
            />
            {errors.phone && (
              <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                <AlertCircle className="h-3 w-3" />
                {errors.phone.message}
              </p>
            )}
          </FormField>

          <FormField id="address" label="Address">
            <Textarea
              id="address"
              placeholder="Full company address"
              rows={2}
              className={
                'text-sm resize-y' +
                (errors.address ? ' border-red-300 focus:border-red-300 focus:ring-red-200' : '')
              }
              {...register('address')}
            />
            {errors.address && (
              <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                <AlertCircle className="h-3 w-3" />
                {errors.address.message}
              </p>
            )}
          </FormField>
        </SectionCard>

        {/* ── Section 3: Social Links ── */}
        <SectionCard
          icon={Share2}
          title="Social Links"
          accentColor="bg-violet-50"
          iconColor="text-violet-600"
        >
          <FormField id="facebookUrl" label="Facebook URL">
            <Input
              id="facebookUrl"
              type="url"
              placeholder="https://facebook.com/..."
              className={
                'h-9 text-sm' +
                (errors.facebookUrl ? ' border-red-300 focus:border-red-300 focus:ring-red-200' : '')
              }
              {...register('facebookUrl')}
            />
            {errors.facebookUrl && (
              <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                <AlertCircle className="h-3 w-3" />
                {errors.facebookUrl.message}
              </p>
            )}
          </FormField>

          <FormField id="instagramUrl" label="Instagram URL">
            <Input
              id="instagramUrl"
              type="url"
              placeholder="https://instagram.com/..."
              className={
                'h-9 text-sm' +
                (errors.instagramUrl ? ' border-red-300 focus:border-red-300 focus:ring-red-200' : '')
              }
              {...register('instagramUrl')}
            />
            {errors.instagramUrl && (
              <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                <AlertCircle className="h-3 w-3" />
                {errors.instagramUrl.message}
              </p>
            )}
          </FormField>
        </SectionCard>

        {/* ── Section 4: Map & Footer ── */}
        <SectionCard
          icon={MapPin}
          title="Map & Footer"
          accentColor="bg-emerald-50"
          iconColor="text-emerald-600"
        >
          <FormField
            id="mapEmbedUrl"
            label="Map Embed URL"
            hint="Paste a Google Maps embed URL to display a map in the contact section."
          >
            <Input
              id="mapEmbedUrl"
              type="url"
              placeholder="https://www.google.com/maps/embed?..."
              className={
                'h-9 text-sm' +
                (errors.mapEmbedUrl ? ' border-red-300 focus:border-red-300 focus:ring-red-200' : '')
              }
              {...register('mapEmbedUrl')}
            />
            {errors.mapEmbedUrl && (
              <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                <AlertCircle className="h-3 w-3" />
                {errors.mapEmbedUrl.message}
              </p>
            )}
          </FormField>

          <FormField id="footerText" label="Footer Text">
            <Textarea
              id="footerText"
              placeholder="Text displayed in the footer area"
              rows={2}
              className={
                'text-sm resize-y' +
                (errors.footerText ? ' border-red-300 focus:border-red-300 focus:ring-red-200' : '')
              }
              {...register('footerText')}
            />
            {errors.footerText && (
              <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                <AlertCircle className="h-3 w-3" />
                {errors.footerText.message}
              </p>
            )}
          </FormField>

          <FormField id="copyrightText" label="Copyright Text">
            <Input
              id="copyrightText"
              placeholder="© 2024 Danphe Health. All rights reserved."
              className={
                'h-9 text-sm' +
                (errors.copyrightText ? ' border-red-300 focus:border-red-300 focus:ring-red-200' : '')
              }
              {...register('copyrightText')}
            />
            {errors.copyrightText && (
              <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                <AlertCircle className="h-3 w-3" />
                {errors.copyrightText.message}
              </p>
            )}
          </FormField>
        </SectionCard>

        {/* ── Save Button ── */}
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
