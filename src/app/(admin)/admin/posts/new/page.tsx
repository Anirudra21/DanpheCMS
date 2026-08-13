'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { RichTextEditor } from '@/components/cms/RichTextEditor';
import { cn, slugify } from '@/lib/cms-utils';

const CATEGORIES = [
  'Uncategorized',
  'News',
  'Updates',
  'Tutorials',
  'Community',
  'Features',
];

export default function NewPostPage() {
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Uncategorized');
  const [tags, setTags] = useState('');
  const [status, setStatus] = useState('DRAFT');
  const [featured, setFeatured] = useState(false);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleCoverUpload = useCallback(async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/media', { method: 'POST', body: formData });
      if (res.ok) {
        const data = await res.json();
        setCoverImage(data.path ?? data.url ?? URL.createObjectURL(file));
        toast({ title: 'Image uploaded' });
      } else {
        toast({ title: 'Upload failed', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Upload error', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  }, [toast]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        handleCoverUpload(file);
      }
    },
    [handleCoverUpload]
  );

  const handleSave = async (saveStatus: string) => {
    if (!title.trim()) {
      toast({ title: 'Title is required', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          slug: slugify(title),
          excerpt,
          content,
          category,
          tags,
          status: saveStatus,
          featured,
          coverImage,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        toast({
          title: saveStatus === 'PUBLISHED' ? 'Post published' : 'Draft saved',
        });
        router.push(`/admin/posts/${data.id}/edit`);
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
          <Link href="/admin/posts">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-danphe-text">New Post</h1>
      </div>

      {/* Title */}
      <div>
        <input
          type="text"
          placeholder="Post title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full text-3xl font-bold bg-transparent border-0 outline-none placeholder:text-muted-foreground/50 text-danphe-text focus:outline-none"
        />
      </div>

      {/* Meta Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="border-danphe-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
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
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Excerpt */}
      <div className="space-y-2">
        <Label>Excerpt</Label>
        <Textarea
          placeholder="Brief description of the post..."
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          rows={3}
          className="border-danphe-border resize-none"
        />
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <Label>Tags</Label>
        <Input
          placeholder="tag1, tag2, tag3"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="border-danphe-border"
        />
        <p className="text-xs text-muted-foreground">Comma-separated</p>
      </div>

      {/* Featured Toggle */}
      <div className="flex items-center gap-3">
        <Switch checked={featured} onCheckedChange={setFeatured} />
        <Label>Featured post</Label>
      </div>

      {/* Cover Image Upload */}
      <div className="space-y-2">
        <Label>Cover Image</Label>
        {coverImage ? (
          <div className="relative rounded-lg overflow-hidden border border-danphe-border h-48">
            <img src={coverImage} alt="Cover" className="h-full w-full object-cover" />
            <Button
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2 h-8 w-8 p-0 rounded-full"
              onClick={() => setCoverImage(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              'flex flex-col items-center justify-center h-48 rounded-lg border-2 border-dashed border-danphe-border cursor-pointer',
              'hover:border-danphe-accent/50 hover:bg-danphe-bg-light transition-colors'
            )}
          >
            {uploading ? (
              <Loader2 className="h-8 w-8 animate-spin text-danphe-accent" />
            ) : (
              <>
                <ImageIcon className="h-10 w-10 text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">Drop an image here or click to upload</p>
              </>
            )}
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleCoverUpload(file);
          }}
        />
      </div>

      {/* Rich Text Editor */}
      <div className="space-y-2">
        <Label>Content</Label>
        <RichTextEditor content={content} onChange={setContent} />
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