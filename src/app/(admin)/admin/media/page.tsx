'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Upload, Trash2, Copy, Image as ImageIcon, Loader2, Search, FileIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { cn, formatFileSize, formatDate } from '@/lib/cms-utils';

interface MediaItem {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  path: string;
  createdAt: string;
}

const isImage = (mime: string) => mime.startsWith('image/');

export default function MediaPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<MediaItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMedia = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      const res = await fetch(`/api/media?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setMedia(data.media ?? data);
      }
    } catch {
      // silently handle
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/media', { method: 'POST', body: formData });
        if (!res.ok) {
          toast({ title: `Failed to upload ${file.name}`, variant: 'destructive' });
        }
      }
      toast({ title: 'Upload complete' });
      fetchMedia();
    } catch {
      toast({ title: 'Upload error', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/media/${deleteTarget.id}`, { method: 'DELETE' });
      if (res.ok) {
        toast({ title: 'File deleted' });
        setMedia((prev) => prev.filter((m) => m.id !== deleteTarget.id));
      } else {
        toast({ title: 'Error', description: 'Failed to delete.', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', variant: 'destructive' });
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const copyUrl = (path: string) => {
    navigator.clipboard.writeText(path);
    toast({ title: 'URL copied to clipboard' });
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    handleUpload(e.dataTransfer.files);
  }, [handleUpload]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-danphe-text">Media</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage your media library</p>
        </div>
        <Button
          className="bg-danphe-accent hover:bg-danphe-accent-light text-white"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Upload className="mr-2 h-4 w-4" />
          )}
          Upload Files
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search files..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 border-danphe-border"
        />
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => handleUpload(e.target.files)}
      />

      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className={cn(
          'flex flex-col items-center justify-center h-40 rounded-lg border-2 border-dashed border-danphe-border cursor-pointer',
          'hover:border-danphe-accent/50 hover:bg-danphe-bg-light transition-colors',
          uploading && 'pointer-events-none opacity-50'
        )}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="h-8 w-8 text-muted-foreground/50 mb-2" />
        <p className="text-sm text-muted-foreground">
          {uploading ? 'Uploading...' : 'Drag & drop files here or click to browse'}
        </p>
      </div>

      {/* Media Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-danphe-border overflow-hidden">
              <div className="aspect-square bg-muted animate-pulse" />
              <div className="p-2 space-y-1">
                <div className="h-3 w-3/4 bg-muted rounded animate-pulse" />
                <div className="h-2.5 w-1/2 bg-muted rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : media.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <ImageIcon className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No media files yet. Upload your first file!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          <AnimatePresence>
            {media.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="group relative rounded-lg border border-danphe-border overflow-hidden bg-white hover:shadow-premium transition-shadow"
              >
                {/* Thumbnail */}
                <div className="aspect-square bg-danphe-bg-light relative overflow-hidden">
                  {isImage(item.mimeType) && item.path ? (
                    <img
                      src={item.path}
                      alt={item.filename}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <FileIcon className="h-10 w-10 text-muted-foreground/40" />
                    </div>
                  )}

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-danphe-dark/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="h-8 w-8 p-0 rounded-full"
                      onClick={() => copyUrl(item.path)}
                      title="Copy URL"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="h-8 w-8 p-0 rounded-full"
                      onClick={() => setDeleteTarget(item)}
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                {/* File Info */}
                <div className="p-2.5">
                  <p className="text-xs font-medium text-danphe-text truncate" title={item.filename}>
                    {item.filename}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatFileSize(item.size)} · {formatDate(item.createdAt)}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete File</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deleteTarget?.filename}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}