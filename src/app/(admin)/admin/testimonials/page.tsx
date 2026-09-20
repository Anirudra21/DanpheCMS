'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { DataTable, PublishedBadge, type ColumnDef } from '../_components/DataTable';
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
import { truncate } from '@/lib/cms-utils';

// ─── Types ────────────────────────────────────────────────────────────────

type Testimonial = {
  id: string;
  quote: string;
  authorName: string;
  authorOrg: string;
  imageUrl: string;
  order: number;
  isPublished: boolean;
};

// ─── Animation ────────────────────────────────────────────────────────────

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

// ─── Helper: get initials ─────────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

// ─── Columns ──────────────────────────────────────────────────────────────

const columns: ColumnDef<Testimonial>[] = [
  {
    key: 'imageUrl',
    label: 'Photo',
    className: 'w-14',
    render: (t) => (
      <div
        className="h-10 w-10 rounded-full bg-cover bg-center bg-slate-200 shrink-0"
        style={
          t.imageUrl
            ? { backgroundImage: `url(${t.imageUrl})` }
            : undefined
        }
      >
        {!t.imageUrl && (
          <div className="h-full w-full rounded-full flex items-center justify-center bg-slate-100 text-xs font-medium text-slate-500">
            {getInitials(t.authorName)}
          </div>
        )}
      </div>
    ),
  },
  {
    key: 'authorName',
    label: 'Author',
    render: (t) => (
      <div>
        <p className="font-medium text-slate-900 text-sm">{t.authorName}</p>
        {t.authorOrg && (
          <p className="text-xs text-slate-400 mt-0.5">{t.authorOrg}</p>
        )}
      </div>
    ),
  },
  {
    key: 'quote',
    label: 'Quote',
    className: 'max-w-[300px]',
    render: (t) => (
      <p className="text-sm text-slate-500 line-clamp-2">
        {truncate(t.quote, 80)}
      </p>
    ),
  },
  {
    key: 'isPublished',
    label: 'Status',
    className: 'w-28',
    render: (t) => <PublishedBadge published={t.isPublished} />,
  },
];

// ─── Page ────────────────────────────────────────────────────────────────

export default function TestimonialsListPage() {
  const router = useRouter();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Testimonial | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchTestimonials = useCallback(async () => {
    try {
      const res = await fetch('/api/testimonials');
      if (!res.ok) throw new Error();
      const data = await res.json();
      setTestimonials(data);
    } catch {
      setTestimonials([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTestimonials(); }, [fetchTestimonials]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/testimonials/${deleteTarget.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setDeleteTarget(null);
      fetchTestimonials();
    } catch {
      // keep dialog open
    } finally {
      setDeleting(false);
    }
  };

  const handleReorder = async (reordered: Testimonial[]) => {
    await fetch('/api/testimonials', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: reordered.map((t, idx) => ({ id: t.id, order: idx })),
      }),
    });
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Testimonials</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage client testimonials displayed on the website.
        </p>
      </motion.div>

      <motion.div variants={item}>
        <DataTable<Testimonial>
          columns={columns}
          data={testimonials}
          isLoading={loading}
          emptyMessage="No testimonials yet. Create your first testimonial."
          newHref="/admin/testimonials/new"
          newLabel="New Testimonial"
          editable
          editHref={(t) => `/admin/testimonials/${t.id}/edit`}
          deletable
          onDelete={setDeleteTarget}
          draggable
          onReorder={handleReorder}
          title={`${testimonials.length} testimonials`}
        />
      </motion.div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Testimonial</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the testimonial from <strong>&ldquo;{deleteTarget?.authorName}&rdquo;</strong>?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {deleting ? 'Deleting…' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
