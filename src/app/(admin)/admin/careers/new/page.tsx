'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod/v4';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Loader2, ArrowLeft, Save, AlertCircle, Briefcase, FileText, Mail } from 'lucide-react';
import { cn } from '@/lib/cms-utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RichTextEditor } from '@/components/cms/RichTextEditor';
import { DatePicker } from '../../_components/DatePicker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// ─── Animation Variants ──────────────────────────────────────────────────

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

// ─── Section Card ────────────────────────────────────────────────────────

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

// ─── Schema ─────────────────────────────────────────────────────────────

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  department: z.string(),
  location: z.string(),
  employmentType: z.string(),
  description: z.string(),
  requirements: z.string(),
  applyEmail: z.string(),
  postedAt: z.string(),
  isOpen: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

// ─── Page ───────────────────────────────────────────────────────────────

export default function NewJobPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      department: '',
      location: '',
      employmentType: '',
      description: '',
      requirements: '',
      applyEmail: '',
      postedAt: '',
      isOpen: true,
    },
  });

  const { register, handleSubmit, watch, setValue, formState: { errors } } = form;

  const onSubmit = async (values: FormValues) => {
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          status: values.isOpen ? 'OPEN' : 'CLOSED',
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create job');
      }

      router.push('/admin/careers');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={item}>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => router.push('/admin/careers')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-lg font-semibold text-slate-900">New Job</h1>
        </div>
      </motion.div>

      {/* Error banner */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </motion.div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Section: Job Details */}
        <SectionCard
          icon={Briefcase}
          title="Job Details"
          accentColor="bg-amber-50"
          iconColor="text-amber-600"
        >
          <div className="space-y-1.5">
            <Label htmlFor="title" className="text-sm font-medium text-slate-700">
              Title <span className="ml-0.5 text-red-400">*</span>
            </Label>
            <Input
              id="title"
              placeholder="e.g. Senior Software Engineer"
              className={cn(
                'h-9 text-sm',
                errors.title && 'border-red-300 focus:border-red-300 focus:ring-red-200',
              )}
              {...register('title')}
            />
            {errors.title && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.title.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="department" className="text-sm font-medium text-slate-700">
                Department
              </Label>
              <Input
                id="department"
                placeholder="e.g. Engineering"
                className="h-9 text-sm"
                {...register('department')}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="location" className="text-sm font-medium text-slate-700">
                Location
              </Label>
              <Input
                id="location"
                placeholder="e.g. Kathmandu, Nepal"
                className="h-9 text-sm"
                {...register('location')}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-slate-700">
              Employment Type
            </Label>
            <Select
              value={watch('employmentType')}
              onValueChange={(v) => setValue('employmentType', v, { shouldValidate: true })}
            >
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Select employment type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Full-time">Full-time</SelectItem>
                <SelectItem value="Part-time">Part-time</SelectItem>
                <SelectItem value="Contract">Contract</SelectItem>
                <SelectItem value="Internship">Internship</SelectItem>
                <SelectItem value="Remote">Remote</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </SectionCard>

        {/* Section: Description */}
        <SectionCard
          icon={FileText}
          title="Description"
          accentColor="bg-sky-50"
          iconColor="text-sky-600"
        >
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-slate-700">
              Description
            </Label>
            <RichTextEditor
              content={watch('description') ?? ''}
              onChange={(html) => setValue('description', html, { shouldValidate: true })}
              placeholder="Job description..."
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-slate-700">
              Requirements
            </Label>
            <RichTextEditor
              content={watch('requirements') ?? ''}
              onChange={(html) => setValue('requirements', html, { shouldValidate: true })}
              placeholder="Requirements and qualifications..."
            />
          </div>
        </SectionCard>

        {/* Section: Application */}
        <SectionCard
          icon={Mail}
          title="Application"
          accentColor="bg-violet-50"
          iconColor="text-violet-600"
        >
          <div className="space-y-1.5">
            <Label htmlFor="applyEmail" className="text-sm font-medium text-slate-700">
              Apply Email
            </Label>
            <Input
              id="applyEmail"
              type="email"
              placeholder="e.g. careers@danphehealth.com"
              className="h-9 text-sm"
              {...register('applyEmail')}
            />
          </div>

          <DatePicker
            value={watch('postedAt') ?? ''}
            onChange={(date) => setValue('postedAt', date, { shouldValidate: true })}
            label="Posted Date"
            placeholder="Pick a date"
          />
        </SectionCard>

        {/* Status toggle */}
        <motion.div variants={item}>
          <div className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
            <Label htmlFor="isOpen" className="text-sm font-medium text-slate-700 cursor-pointer">
              Open
            </Label>
            <Switch
              id="isOpen"
              checked={watch('isOpen') ?? true}
              onCheckedChange={(checked) => setValue('isOpen', checked, { shouldValidate: true })}
            />
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div variants={item}>
          <div className="flex items-center gap-3">
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
                  Create
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-9 text-sm"
              onClick={() => router.push('/admin/careers')}
            >
              Cancel
            </Button>
          </div>
        </motion.div>
      </form>
    </motion.div>
  );
}
