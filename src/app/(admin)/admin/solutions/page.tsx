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

type Solution = {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  order: number;
  isPublished: boolean;
  iconUrl: string;
  heroImageUrl: string;
  features: { id: string; label: string; order: number }[];
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

// ─── Columns ──────────────────────────────────────────────────────────────

const columns: ColumnDef<Solution>[] = [
  {
    key: 'title',
    label: 'Title',
    render: (sol) => (
      <div>
        <p className="font-medium text-slate-900 text-sm">{sol.title}</p>
        <p className="text-xs text-slate-400 mt-0.5">/{sol.slug}</p>
      </div>
    ),
  },
  {
    key: 'shortDescription',
    label: 'Description',
    className: 'max-w-[280px]',
    render: (sol) => (
      <p className="text-sm text-slate-500 line-clamp-2">
        {sol.shortDescription ? truncate(sol.shortDescription, 80) : '—'}
      </p>
    ),
  },
  {
    key: 'features',
    label: 'Features',
    className: 'w-24 text-center',
    render: (sol) => (
      <span className="inline-flex items-center justify-center h-6 min-w-[24px] rounded-full bg-slate-100 px-2 text-[11px] font-medium text-slate-600">
        {sol.features.length}
      </span>
    ),
  },
  {
    key: 'isPublished',
    label: 'Status',
    className: 'w-28',
    render: (sol) => <PublishedBadge published={sol.isPublished} />,
  },
];

// ─── Page ────────────────────────────────────────────────────────────────

export default function SolutionsListPage() {
  const router = useRouter();
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Solution | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchSolutions = useCallback(async () => {
    try {
      const res = await fetch('/api/solutions');
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSolutions(data);
    } catch {
      setSolutions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSolutions(); }, [fetchSolutions]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/solutions/${deleteTarget.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setDeleteTarget(null);
      fetchSolutions();
    } catch {
      // keep dialog open
    } finally {
      setDeleting(false);
    }
  };

  const handleReorder = async (reordered: Solution[]) => {
    await fetch('/api/solutions', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: reordered.map((s, idx) => ({ id: s.id, order: idx })),
      }),
    });
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Solutions</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your product solutions and their features.
        </p>
      </motion.div>

      <motion.div variants={item}>
        <DataTable<Solution>
          columns={columns}
          data={solutions}
          isLoading={loading}
          emptyMessage="No solutions yet. Create your first solution."
          newHref="/admin/solutions/new"
          newLabel="New Solution"
          editable
          editHref={(sol) => `/admin/solutions/${sol.id}/edit`}
          deletable
          onDelete={setDeleteTarget}
          draggable
          onReorder={handleReorder}
          title={`${solutions.length} solutions`}
        />
      </motion.div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Solution</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>&ldquo;{deleteTarget?.title}&rdquo;</strong>?
              This will also delete all its features. This action cannot be undone.
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
