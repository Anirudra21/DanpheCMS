'use client';

import { useState, useEffect, useCallback } from 'react';
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

// ─── Types ────────────────────────────────────────────────────────────────

type Testimonial = {
  id: string;
  quote: string;
  authorName: string;
  authorOrg: string;
  imageUrl: string;
  order: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
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

// ─── Columns ─────────────────────────────────────────────────────────────

const columns: ColumnDef<Testimonial>[] = [
  {
    key: 'quote',
    label: 'Quote',
    render: (t) => (
      <p className="text-sm text-slate-700 line-clamp-2 max-w-[300px]">{t.quote}</p>
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
    key: 'isPublished',
    label: 'Status',
    className: 'w-28',
    render: (t) => <PublishedBadge published={t.isPublished} />,
  },
];

// ─── Page ───────────────────────────────────────────────────────────────

export default function TestimonialsListPage() {
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
          Manage client testimonials and their display order.
        </p>
      </motion.div>

      <motion.div variants={item}>
        <DataTable<Testimonial>
          columns={columns}
          data={testimonials}
          isLoading={loading}
          emptyMessage="No testimonials yet. Add your first client testimonial."
          newHref="/admin/testimonials/new"
          newLabel="New Testimonial"
          editable
          editHref={(t) => `/admin/testimonials/${t.id}/edit`}
          deletable
          onDelete={setDeleteTarget}
          draggable
          onReorder={handleReorder}
          title={`${testimonials.length} ${testimonials.length === 1 ? 'testimonial' : 'testimonials'}`}
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
