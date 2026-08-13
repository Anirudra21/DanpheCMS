'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { RichTextEditor } from '@/components/cms/RichTextEditor';

export default function EditPagePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [template, setTemplate] = useState('default');
  const [status, setStatus] = useState('DRAFT');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadPage() {
      try {
        const res = await fetch(`/api/pages/${id}`);
        if (res.ok) {
          const page = await res.json();
          setTitle(page.title ?? '');
          setContent(page.content ?? '');
          setTemplate(page.template ?? 'default');
          setStatus(page.status ?? 'DRAFT');
          setSeoTitle(page.seoTitle ?? '');
          setSeoDescription(page.seoDescription ?? '');
        } else {
          toast({ title: 'Page not found', variant: 'destructive' });
          router.push('/admin/pages');
        }
      } catch {
        toast({ title: 'Failed to load page', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    }
    loadPage();
  }, [id, router, toast]);

  const handleSave = async (saveStatus: string) => {
    if (!title.trim()) {
      toast({ title: 'Title is required', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/pages/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          template,
          status: saveStatus,
          seoTitle: seoTitle || undefined,
          seoDescription: seoDescription || undefined,
        }),
      });
      if (res.ok) {
        toast({
          title: saveStatus === 'PUBLISHED' ? 'Page published' : 'Draft saved',
        });
      } else {
        const err = await res.json();
        toast({ title: 'Error', description: err.error ?? 'Failed to save', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Network error', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-40" />
        </div>
        <Skeleton className="h-12 w-full" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
        </div>
        <Skeleton className="h-80" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 max-w-4xl"
    >
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
          <Link href="/admin/pages">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-danphe-text">Edit Page</h1>
      </div>

      {/* Title */}
      <div>
        <input
          type="text"
          placeholder="Page title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full text-3xl font-bold bg-transparent border-0 outline-none placeholder:text-muted-foreground/50 text-danphe-text focus:outline-none"
        />
      </div>

      {/* Meta Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Template</Label>
          <Select value={template} onValueChange={setTemplate}>
            <SelectTrigger className="border-danphe-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="full-width">Full Width</SelectItem>
              <SelectItem value="sidebar">Sidebar</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Status</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="border-danphe-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="PUBLISHED">Published</SelectItem>
              <SelectItem value="ARCHIVED">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Rich Text Editor */}
      <div className="space-y-2">
        <Label>Content</Label>
        <RichTextEditor content={content} onChange={setContent} />
      </div>

      {/* SEO Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-danphe-text">SEO</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>SEO Title</Label>
            <Input
              placeholder="Custom meta title (optional)"
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              className="border-danphe-border"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>SEO Description</Label>
            <Textarea
              placeholder="Meta description for search engines (optional)"
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
              rows={3}
              className="border-danphe-border resize-none"
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 pb-8">
        <Button
          variant="outline"
          className="border-danphe-border"
          onClick={() => handleSave('DRAFT')}
          disabled={saving}
        >
          {saving && status === 'DRAFT' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Save Draft
        </Button>
        <Button
          className="bg-danphe-accent hover:bg-danphe-accent-light text-white"
          onClick={() => handleSave('PUBLISHED')}
          disabled={saving}
        >
          {saving && status === 'PUBLISHED' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Publish
        </Button>
      </div>
    </motion.div>
  );
}