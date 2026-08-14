'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod/v4';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, ArrowLeft, Save, AlertCircle, Trash2, Plus, X } from 'lucide-react';
import { cn } from '@/lib/cms-utils';
import { slugify } from '@/lib/cms-utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { RichTextEditor } from '@/components/cms/RichTextEditor';
import { ImageUpload } from './ImageUpload';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// ─── Field Config Types ───────────────────────────────────────────────────

export type FieldType = 'text' | 'textarea' | 'richtext' | 'image' | 'select' | 'checkbox' | 'number' | 'slug';

export interface FieldConfig {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  required?: boolean;
  defaultValue?: unknown;
  options?: { label: string; value: string }[];
  folder?: string;            // for image type
  slugFrom?: string;          // for slug type — auto-generate from this field
  disabled?: boolean;
  description?: string;
  className?: string;
  min?: number;               // for number
  max?: number;               // for number
  rows?: number;              // for textarea
  validate?: (value: unknown, formValues: Record<string, unknown>) => string | undefined;
}

export interface ModelFormConfig {
  title: string;
  fields: FieldConfig[];
  apiBase: string;           // e.g. '/api/solutions'
  listHref: string;          // e.g. '/admin/solutions'
  id?: string;               // if editing
  /** 
   * Optional nested array fields. 
   * For example, Solution has features: SolutionFeature[] 
   */
 arrayFields?: ArrayFieldConfig[];
}

export interface ArrayFieldConfig {
  name: string;              // e.g. 'features'
  label: string;             // e.g. 'Features'
  subFields: Omit<FieldConfig, 'type'> & { type: 'text' }[];
}

// ─── Build Zod Schema from Field Config ───────────────────────────────────

function buildSchema(fields: FieldConfig[]) {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const field of fields) {
    if (field.type === 'checkbox') {
      shape[field.name] = z.boolean();
    } else if (field.type === 'number') {
      let s = z.number();
      if (field.min !== undefined) s = (s as z.ZodNumber).min(field.min);
      if (field.max !== undefined) s = (s as z.ZodNumber).max(field.max);
      shape[field.name] = field.required ? s : s.optional();
    } else if (field.required) {
      shape[field.name] = z.string().min(1, `${field.label} is required`);
    } else {
      shape[field.name] = z.string().optional();
    }
  }
  return z.object(shape);
}

// ─── Sub-form Row (for array fields) ─────────────────────────────────────

function ArrayFieldRow({
  subFields,
  values,
  onChange,
  onRemove,
  canRemove,
}: {
  subFields: ArrayFieldConfig['subFields'];
  values: Record<string, string>;
  onChange: (values: Record<string, string>) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  return (
    <div className="flex items-start gap-2 group">
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
        {subFields.map((sub) => (
          <div key={sub.name} className={sub.className}>
            <Input
              value={values[sub.name] ?? ''}
              onChange={(e) => onChange({ ...values, [sub.name]: e.target.value })}
              placeholder={sub.placeholder || sub.label}
              className="h-9 text-sm"
            />
          </div>
        ))}
      </div>
      {canRemove && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="mt-0.5 h-9 w-9 p-0 text-slate-400 hover:text-red-500 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={onRemove}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

// ─── Main ModelForm Component ────────────────────────────────────────────

export function ModelForm(props: ModelFormConfig) {
  const router = useRouter();
  const { title, fields, apiBase, listHref, id, arrayFields = [] } = props;
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formDefaults, setFormDefaults] = useState<Record<string, unknown>>({});

  // Array field state: { features: [{ label: '', order: 0 }, ...] }
  const [arrayValues, setArrayValues] = useState<Record<string, Record<string, string>[]>>({});

  // Initialize array fields
  useEffect(() => {
    const init: Record<string, Record<string, string>[]> = {};
    for (const af of arrayFields) {
      init[af.name] = [{ ...Object.fromEntries(af.subFields.map((s) => [s.name, ''])) }];
    }
    setArrayValues(init);
  }, [arrayFields.map((a) => a.name).join(',')]);

  const schema = buildSchema(fields);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: formDefaults,
  });
  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = form;

  // Find the slug field and its source
  const slugField = fields.find((f) => f.type === 'slug');
  const slugSourceField = slugField?.slugFrom;

  // Auto-generate slug when title changes
  useEffect(() => {
    if (!slugField || !slugSourceField) return;
    const titleValue = watch(slugSourceField);
    if (titleValue && typeof titleValue === 'string') {
      const generated = slugify(titleValue);
      const currentSlug = watch(slugField.name);
      if (!currentSlug || currentSlug === slugify(watch(slugSourceField) as string || '') || currentSlug === '') {
        setValue(slugField.name, generated, { shouldValidate: true });
      }
    }
  }, [slugField, slugSourceField, watch, setValue]);

  // Fetch existing data for edit
  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    fetch(`${apiBase}/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load item');
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        const defaults: Record<string, unknown> = {};
        for (const field of fields) {
          defaults[field.name] = data[field.name] ?? field.defaultValue ?? '';
        }
        // Load array fields from response
        for (const af of arrayFields) {
          if (data[af.name] && Array.isArray(data[af.name])) {
            setArrayValues((prev) => ({
              ...prev,
              [af.name]: data[af.name].map((item: Record<string, unknown>) => {
                const row: Record<string, string> = {};
                for (const sub of af.subFields) {
                  row[sub.name] = String(item[sub.name] ?? '');
                }
                return row;
              }),
            }));
          }
        }
        setFormDefaults(defaults);
        reset(defaults);
      })
      .catch((err) => setError(err.message))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [id, apiBase, fields, arrayFields, reset]);

  const onSubmit = async (values: Record<string, unknown>) => {
    setSaving(true);
    setError('');
    try {
      // Build array field data
      const arrayData: Record<string, unknown[]> = {};
      for (const af of arrayFields) {
        arrayData[af.name] = (arrayValues[af.name] ?? [])
          .filter((row) => {
            return af.subFields.some((s) => s.required ? row[s.name]?.trim() : false);
          })
          .map((row, idx) => ({
            ...row,
            order: idx + 1,
          }));
      }

      const payload = { ...values, ...arrayData };

      const url = isEditing ? `${apiBase}/${id}` : apiBase;
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || `Failed to ${isEditing ? 'update' : 'create'}`);
      }

      router.push(listHref);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const addArrayRow = (fieldName: string, subFields: ArrayFieldConfig['subFields']) => {
    setArrayValues((prev) => ({
      ...prev,
      [fieldName]: [
        ...(prev[fieldName] ?? []),
        { ...Object.fromEntries(subFields.map((s) => [s.name, ''])) },
      ],
    }));
  };

  const updateArrayRow = (fieldName: string, idx: number, values: Record<string, string>) => {
    setArrayValues((prev) => ({
      ...prev,
      [fieldName]: (prev[fieldName] ?? []).map((row, i) => (i === idx ? values : row)),
    }));
  };

  const removeArrayRow = (fieldName: string, idx: number) => {
    setArrayValues((prev) => ({
      ...prev,
      [fieldName]: (prev[fieldName] ?? []).filter((_, i) => i !== idx),
    }));
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => router.push(listHref)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-lg font-semibold text-slate-900">
          {isEditing ? `Edit ${title}` : `New ${title}`}
        </h1>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
          {fields.map((field) => {
            // ── Skip slug in render (auto-managed) ──
            if (field.type === 'slug') {
              return (
                <div key={field.name} className="space-y-1.5">
                  <Label htmlFor={field.name} className="text-sm font-medium text-slate-700">
                    Slug
                  </Label>
                  <Input
                    id={field.name}
                    className={cn(
                      'h-9 text-sm bg-slate-50',
                      errors[field.name] && 'border-red-300 focus:border-red-300 focus:ring-red-200',
                    )}
                    {...register(field.name as Parameters<typeof register>[0])}
                  />
                  <p className="text-[11px] text-slate-400">
                    Auto-generated from {field.slugFrom}. Edit manually if needed.
                  </p>
                  {errors[field.name] && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {(errors[field.name] as { message?: string })?.message}
                    </p>
                  )}
                </div>
              );
            }

            // ── Text ──
            if (field.type === 'text') {
              return (
                <div key={field.name} className="space-y-1.5">
                  <Label htmlFor={field.name} className="text-sm font-medium text-slate-700">
                    {field.label}
                    {field.required && <span className="ml-0.5 text-red-400">*</span>}
                  </Label>
                  <Input
                    id={field.name}
                    placeholder={field.placeholder}
                    disabled={field.disabled}
                    className={cn(
                      'h-9 text-sm',
                      errors[field.name] && 'border-red-300 focus:border-red-300 focus:ring-red-200',
                    )}
                    {...register(field.name as Parameters<typeof register>[0])}
                  />
                  {field.description && (
                    <p className="text-[11px] text-slate-400">{field.description}</p>
                  )}
                  {errors[field.name] && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {(errors[field.name] as { message?: string })?.message}
                    </p>
                  )}
                </div>
              );
            }

            // ── Textarea ──
            if (field.type === 'textarea') {
              return (
                <div key={field.name} className="space-y-1.5">
                  <Label htmlFor={field.name} className="text-sm font-medium text-slate-700">
                    {field.label}
                    {field.required && <span className="ml-0.5 text-red-400">*</span>}
                  </Label>
                  <Textarea
                    id={field.name}
                    placeholder={field.placeholder}
                    rows={field.rows ?? 3}
                    className={cn(
                      'text-sm resize-y',
                      errors[field.name] && 'border-red-300 focus:border-red-300 focus:ring-red-200',
                    )}
                    {...register(field.name as Parameters<typeof register>[0])}
                  />
                  {errors[field.name] && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {(errors[field.name] as { message?: string })?.message}
                    </p>
                  )}
                </div>
              );
            }

            // ── Rich Text ──
            if (field.type === 'richtext') {
              const val = watch(field.name) as string;
              return (
                <div key={field.name} className="space-y-1.5">
                  <Label className="text-sm font-medium text-slate-700">
                    {field.label}
                    {field.required && <span className="ml-0.5 text-red-400">*</span>}
                  </Label>
                  <RichTextEditor
                    content={val ?? ''}
                    onChange={(html) => setValue(field.name, html, { shouldValidate: true })}
                    placeholder={field.placeholder}
                  />
                </div>
              );
            }

            // ── Image ──
            if (field.type === 'image') {
              const val = watch(field.name) as string;
              return (
                <ImageUpload
                  key={field.name}
                  value={val ?? ''}
                  onChange={(url) => setValue(field.name, url, { shouldValidate: true })}
                  folder={field.folder ?? 'general'}
                  label={field.label}
                />
              );
            }

            // ── Select ──
            if (field.type === 'select') {
              const val = watch(field.name) as string;
              return (
                <div key={field.name} className="space-y-1.5">
                  <Label className="text-sm font-medium text-slate-700">
                    {field.label}
                    {field.required && <span className="ml-0.5 text-red-400">*</span>}
                  </Label>
                  <Select
                    value={val}
                    onValueChange={(v) => setValue(field.name, v, { shouldValidate: true })}
                  >
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder={field.placeholder || `Select ${field.label.toLowerCase()}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options?.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors[field.name] && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {(errors[field.name] as { message?: string })?.message}
                    </p>
                  )}
                </div>
              );
            }

            // ── Checkbox ──
            if (field.type === 'checkbox') {
              const val = watch(field.name) as boolean;
              return (
                <div key={field.name} className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                  <Label htmlFor={field.name} className="text-sm font-medium text-slate-700 cursor-pointer">
                    {field.label}
                  </Label>
                  <Switch
                    id={field.name}
                    checked={val ?? false}
                    onCheckedChange={(checked) => setValue(field.name, checked, { shouldValidate: true })}
                  />
                </div>
              );
            }

            // ── Number ──
            if (field.type === 'number') {
              return (
                <div key={field.name} className="space-y-1.5">
                  <Label htmlFor={field.name} className="text-sm font-medium text-slate-700">
                    {field.label}
                    {field.required && <span className="ml-0.5 text-red-400">*</span>}
                  </Label>
                  <Input
                    id={field.name}
                    type="number"
                    placeholder={field.placeholder}
                    min={field.min}
                    max={field.max}
                    className={cn(
                      'h-9 text-sm w-32',
                      errors[field.name] && 'border-red-300 focus:border-red-300 focus:ring-red-200',
                    )}
                    {...register(field.name as Parameters<typeof register>[0], {
                      valueAsNumber: true,
                    })}
                  />
                  {errors[field.name] && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {(errors[field.name] as { message?: string })?.message}
                    </p>
                  )}
                </div>
              );
            }

            return null;
          })}
        </div>

        {/* Array field sections */}
        {arrayFields.map((af) => (
          <div key={af.name} className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">{af.label}</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 gap-1.5 text-xs"
                onClick={() => addArrayRow(af.name, af.subFields)}
              >
                <Plus className="h-3 w-3" />
                Add
              </Button>
            </div>
            <div className="space-y-2">
              {(arrayValues[af.name] ?? []).map((row, idx) => (
                <ArrayFieldRow
                  key={idx}
                  subFields={af.subFields}
                  values={row}
                  onChange={(values) => updateArrayRow(af.name, idx, values)}
                  onRemove={() => removeArrayRow(af.name, idx)}
                  canRemove={(arrayValues[af.name] ?? []).length > 1}
                />
              ))}
            </div>
          </div>
        ))}

        {/* Actions */}
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
                {isEditing ? 'Update' : 'Create'}
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-9 text-sm"
            onClick={() => router.push(listHref)}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
