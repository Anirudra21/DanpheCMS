'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { DataTable, PublishedBadge, type ColumnDef } from '../_components/DataTable';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/cms-utils';
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

type ClientLogo = {
  id: string;
  name: string;
  logoUrl: string;
  order: number;
  showOnHomepage: boolean;
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

const columns: ColumnDef<ClientLogo>[] = [
  {
    key: 'logoUrl',
    label: 'Logo',
    className: 'w-16',
    render: (cl) => (
      cl.logoUrl ? (
        <div
          className="h-6 w-[60px] rounded bg-contain bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${cl.logoUrl})` }}
        />
      ) : (
        <div className="h-6 w-[60px] rounded bg-slate-100 flex items-center justify-center">
          <span className="text-[10px] font-medium text-slate-400">
            {cl.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
          </span>
        </div>
      )
    ),
  },
  {
    key: 'name',
    label: 'Name',
    render: (cl) => (
      <p className="font-medium text-slate-900 text-sm">{cl.name}</p>
    ),
  },
  {
    key: 'showOnHomepage',
    label: 'Homepage',
    className: 'w-24',
    render: (cl) => (
      <Badge
        variant="secondary"
        className={cn(
          'text-[11px] font-medium border-0',
          cl.showOnHomepage
            ? 'bg-emerald-50 text-emerald-700'
            : 'bg-slate-100 text-slate-500',
        )}
      >
        {cl.showOnHomepage ? 'Shown' : 'Hidden'}
      </Badge>
    ),
  },
  {
    key: 'isPublished',
    label: 'Status',
    className: 'w-28',
    render: (cl) => <PublishedBadge published={cl.isPublished} />,
  },
];

// ─── Page ───────────────────────────────────────────────────────────────

export default function ClientsListPage() {
  const [logos, setLogos] = useState<ClientLogo[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<ClientLogo | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchLogos = useCallback(async () => {
    try {
      const res = await fetch('/api/client-logos');
      if (!res.ok) throw new Error();
      const data = await res.json();
      setLogos(data);
    } catch {
      setLogos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLogos(); }, [fetchLogos]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/client-logos/${deleteTarget.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setDeleteTarget(null);
      fetchLogos();
    } catch {
      // keep dialog open
    } finally {
      setDeleting(false);
    }
  };

  const handleReorder = async (reordered: ClientLogo[]) => {
    await fetch('/api/client-logos', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: reordered.map((cl, idx) => ({ id: cl.id, order: idx })),
      }),
    });
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Client Logos</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage client logos and their display order on the homepage.
        </p>
      </motion.div>

      <motion.div variants={item}>
        <DataTable<ClientLogo>
          columns={columns}
          data={logos}
          isLoading={loading}
          emptyMessage="No client logos yet. Add your first client logo."
          newHref="/admin/clients/new"
          newLabel="New Logo"
          editable
          editHref={(cl) => `/admin/clients/${cl.id}/edit`}
          deletable
          onDelete={setDeleteTarget}
          draggable
          onReorder={handleReorder}
          title={`${logos.length} ${logos.length === 1 ? 'logo' : 'logos'}`}
        />
      </motion.div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Client Logo</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>&ldquo;{deleteTarget?.name}&rdquo;</strong>?
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
