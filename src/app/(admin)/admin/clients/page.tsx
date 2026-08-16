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
import { Switch } from '@/components/ui/switch';

// ─── Types ────────────────────────────────────────────────────────────────

type ClientLogo = {
  id: string;
  name: string;
  logoUrl: string;
  order: number;
  showOnHomepage: boolean;
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

// ─── Page ────────────────────────────────────────────────────────────────

export default function ClientLogosListPage() {
  const [logos, setLogos] = useState<ClientLogo[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<ClientLogo | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

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
        items: reordered.map((l, idx) => ({ id: l.id, order: idx })),
      }),
    });
  };

  const handleToggleHomepage = async (logo: ClientLogo) => {
    const newValue = !logo.showOnHomepage;
    setTogglingId(logo.id);
    try {
      const res = await fetch(`/api/client-logos/${logo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ showOnHomepage: newValue }),
      });
      if (!res.ok) throw new Error();
      setLogos((prev) =>
        prev.map((l) => (l.id === logo.id ? { ...l, showOnHomepage: newValue } : l)),
      );
    } catch {
      // revert on error
    } finally {
      setTogglingId(null);
    }
  };

  // ─── Columns ──────────────────────────────────────────────────────────────

  const columns: ColumnDef<ClientLogo>[] = [
    {
      key: 'logoUrl',
      label: 'Logo',
      className: 'w-20',
      render: (l) => (
        <div
          className="h-6 w-auto max-w-[48px] min-w-[32px] bg-contain bg-center bg-no-repeat"
          style={
            l.logoUrl
              ? { backgroundImage: `url(${l.logoUrl})` }
              : undefined
          }
        />
      ),
    },
    {
      key: 'name',
      label: 'Name',
      render: (l) => (
        <p className="font-medium text-slate-900 text-sm">{l.name}</p>
      ),
    },
    {
      key: 'showOnHomepage',
      label: 'Homepage',
      className: 'w-28',
      render: (l) => (
        <Switch
          checked={l.showOnHomepage}
          disabled={togglingId === l.id}
          onCheckedChange={() => handleToggleHomepage(l)}
          className="data-[state=checked]:bg-emerald-600"
        />
      ),
    },
    {
      key: 'isPublished',
      label: 'Status',
      className: 'w-28',
      render: (l) => <PublishedBadge published={l.isPublished} />,
    },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Client Logos</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage client logos displayed on the website.
        </p>
      </motion.div>

      <motion.div variants={item}>
        <DataTable<ClientLogo>
          columns={columns}
          data={logos}
          isLoading={loading}
          emptyMessage="No client logos yet. Add your first logo."
          newHref="/admin/clients/new"
          newLabel="New Client Logo"
          editable
          editHref={(l) => `/admin/clients/${l.id}/edit`}
          deletable
          onDelete={setDeleteTarget}
          draggable
          onReorder={handleReorder}
          title={`${logos.length} logos`}
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
