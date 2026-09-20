'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod/v4';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, ArrowLeft, Save, AlertCircle } from 'lucide-react';
import { cn, slugify } from '@/lib/cms-utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { RichTextEditor } from '@/components/cms/RichTextEditor';
import { ImageUpload } from '../../../_components/ImageUpload';
import { DatePicker } from '../../../_components/DatePicker';

// ─── Schema ─────────────────────────────────────────────────────────────

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string(),
  coverImageUrl: z.string(),
  author: z.string(),
  publishedAt: z.string(),
  excerpt: z.string(),
  body: z.string(),
  isPublished: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

// ─── Page ───────────────────────────────────────────────────────────────

export default function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [id, setId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      slug: '',
      coverImageUrl: '',
      author: '',
      publishedAt: '',
      excerpt: '',
      body: '',
      isPublished: false,
    },
  });

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = form;

  // Resolve params
  useEffect(() => {
    params.then((p) => {
      setId(p.id);
    });
  }, [params]);

  // Fetch existing post
  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    fetch(`/api/posts/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load post');
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        reset({
          title: data.title ?? '',
          slug: data.slug ?? '',
          coverImageUrl: data.coverImageUrl ?? '',
          author: data.author ?? '',
          publishedAt: data.publishedAt ? new Date(data.publishedAt).toISOString() : '',
          excerpt: data.excerpt ?? '',
          body: data.body ?? '',
          isPublished: data.status === 'PUBLISHED',
        });
      })
      .catch((err) => setError(err.message))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [id, reset]);

  // Auto-generate slug from title
  const titleValue = watch('title');
  const slugValue = watch('slug');
  useEffect(() => {
    if (titleValue && typeof titleValue === 'string') {
      const generated = slugify(titleValue);
      if (!slugValue || slugValue === slugify(slugValue) || slugValue === '') {
        setValue('slug', generated, { shouldValidate: true });
      }
    }
  }, [titleValue, slugValue, setValue]);

  const onSubmit = async (values: FormValues) => {
    if (!id) return;
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/posts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          status: values.isPublished ? 'PUBLISHED' : 'DRAFT',
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update post');
      }

      router.push('/admin/posts');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

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
          onClick={() => router.push('/admin/posts')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-lg font-semibold text-slate-900">Edit News & Event</h1>
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
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="title" className="text-sm font-medium text-slate-700">
              Title <span className="ml-0.5 text-red-400">*</span>
            </Label>
            <Input
              id="title"
              placeholder="e.g. Danphe Health Launches New Module"
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

          {/* Slug */}
          <div className="space-y-1.5">
            <Label htmlFor="slug" className="text-sm font-medium text-slate-700">
              Slug
            </Label>
            <Input
              id="slug"
              className={cn(
                'h-9 text-sm bg-slate-50',
                errors.slug && 'border-red-300 focus:border-red-300 focus:ring-red-200',
              )}
              {...register('slug')}
            />
            <p className="text-[11px] text-slate-400">
              Auto-generated from title. Edit manually if needed.
            </p>
          </div>

          {/* Cover Image */}
          <ImageUpload
            value={watch('coverImageUrl') ?? ''}
            onChange={(url) => setValue('coverImageUrl', url, { shouldValidate: true })}
            folder="posts"
            label="Cover Image"
          />

          {/* Author */}
          <div className="space-y-1.5">
            <Label htmlFor="author" className="text-sm font-medium text-slate-700">
              Author
            </Label>
            <Input
              id="author"
              placeholder="Author name"
              className="h-9 text-sm"
              {...register('author')}
            />
          </div>

          {/* Published At */}
          <DatePicker
            value={watch('publishedAt') ?? ''}
            onChange={(date) => setValue('publishedAt', date, { shouldValidate: true })}
            label="Published At"
            placeholder="Pick a date"
          />

          {/* Excerpt */}
          <div className="space-y-1.5">
            <Label htmlFor="excerpt" className="text-sm font-medium text-slate-700">
              Excerpt
            </Label>
            <Textarea
              id="excerpt"
              placeholder="Brief summary for listings..."
              rows={3}
              className="text-sm resize-y"
              {...register('excerpt')}
            />
          </div>

          {/* Body */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-slate-700">
              Body
            </Label>
            <RichTextEditor
              content={watch('body') ?? ''}
              onChange={(html) => setValue('body', html, { shouldValidate: true })}
              placeholder="Full post content…"
            />
          </div>

          {/* Status Toggle */}
          <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
            <Label htmlFor="isPublished" className="text-sm font-medium text-slate-700 cursor-pointer">
              Published
            </Label>
            <Switch
              id="isPublished"
              checked={watch('isPublished') ?? false}
              onCheckedChange={(checked) => setValue('isPublished', checked, { shouldValidate: true })}
            />
          </div>
        </div>

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
                Update
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-9 text-sm"
            onClick={() => router.push('/admin/posts')}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
