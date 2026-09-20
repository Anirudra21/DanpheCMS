'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { DataTable, type ColumnDef } from '../_components/DataTable';
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

type Stat = {
  id: string;
  label: string;
  value: string;
  suffix: string;
  order: number;
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

const columns: ColumnDef<Stat>[] = [
  {
    key: 'label',
    label: 'Label',
    render: (stat) => (
      <p className="font-medium text-slate-900 text-sm">{stat.label}</p>
    ),
  },
  {
    key: 'value',
    label: 'Value',
    render: (stat) => (
      <div className="flex items-baseline gap-1">
        <span className="font-semibold text-slate-900 text-sm">{stat.value}</span>
        {stat.suffix && (
          <span className="text-slate-400 text-xs">{stat.suffix}</span>
        )}
      </div>
    ),
  },
  {
    key: 'order',
    label: 'Order',
    className: 'w-20 text-center',
    render: (stat) => (
      <span className="inline-flex items-center justify-center h-6 min-w-[24px] rounded-full bg-slate-100 px-2 text-[11px] font-medium text-slate-600">
        {stat.order}
      </span>
    ),
  },
];

// ─── Page ───────────────────────────────────────────────────────────────

export default function StatsListPage() {
  const [stats, setStats] = useState<Stat[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Stat | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/stats');
      if (!res.ok) throw new Error();
      const data = await res.json();
      setStats(data);
    } catch {
      setStats([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/stats/${deleteTarget.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setDeleteTarget(null);
      fetchStats();
    } catch {
      // keep dialog open
    } finally {
      setDeleting(false);
    }
  };

  const handleReorder = async (reordered: Stat[]) => {
    await fetch('/api/stats', {
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
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Stats</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage key statistics displayed on your site.
        </p>
      </motion.div>

      <motion.div variants={item}>
        <DataTable<Stat>
          columns={columns}
          data={stats}
          isLoading={loading}
          emptyMessage="No stats yet. Add your first stat."
          newHref="/admin/stats/new"
          newLabel="New Stat"
          editable
          editHref={(s) => `/admin/stats/${s.id}/edit`}
          deletable
          onDelete={setDeleteTarget}
          draggable
          onReorder={handleReorder}
          title={`${stats.length} ${stats.length === 1 ? 'stat' : 'stats'}`}
        />
      </motion.div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Stat</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>&ldquo;{deleteTarget?.label}&rdquo;</strong>?
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
