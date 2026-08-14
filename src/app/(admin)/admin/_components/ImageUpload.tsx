'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/cms-utils';
import { Button } from '@/components/ui/button';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
  className?: string;
}

export function ImageUpload({
  value,
  onChange,
  folder = 'general',
  label,
  className,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = useCallback(
    async (file: File) => {
      setUploading(true);
      setError('');

      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Upload failed');
        }
        const data = await res.json();
        onChange(data.url);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Upload failed');
      } finally {
        setUploading(false);
      }
    },
    [folder, onChange],
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError('File must be under 5MB');
      return;
    }
    if (!file.type.startsWith('image/')) {
      setError('Only image files are allowed');
      return;
    }
    upload(file);
    e.target.value = '';
  };

  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <p className="text-sm font-medium text-slate-700">{label}</p>
      )}
      {value ? (
        <div className="relative group rounded-lg border border-slate-200 overflow-hidden bg-slate-50">
          <div className="h-28 w-full bg-cover bg-center" style={{ backgroundImage: `url(${value})` }} role="img" aria-label="Uploaded image" />
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="h-8 gap-1.5 text-xs"
                onClick={() => inputRef.current?.click()}
              >
                <Upload className="h-3.5 w-3.5" />
                Replace
              </Button>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="h-8 gap-1.5 text-xs"
                onClick={() => onChange('')}
              >
                <X className="h-3.5 w-3.5" />
                Remove
              </Button>
            </div>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className={cn(
            'flex h-28 w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed transition-colors cursor-pointer',
            uploading
              ? 'border-slate-200 bg-slate-50'
              : 'border-slate-300 bg-white hover:border-danphe-accent/50 hover:bg-danphe-accent/5',
          )}
        >
          {uploading ? (
            <>
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
              <p className="text-xs text-slate-400">Uploading...</p>
            </>
          ) : (
            <>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                <Upload className="h-5 w-5 text-slate-400" />
              </div>
              <p className="text-xs text-slate-500">
                Click to upload an image
              </p>
              <p className="text-[11px] text-slate-400">PNG, JPG, WebP up to 5MB</p>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </button>
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
