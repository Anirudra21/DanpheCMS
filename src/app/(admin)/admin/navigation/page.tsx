'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Navigation, Building2, Lightbulb, Info } from 'lucide-react';
import { DataTable, type ColumnDef } from '../_components/DataTable';
import { Badge } from '@/components/ui/badge';
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

type NavItem = {
  id: string;
  label: string;
  url: string;
  order: number;
  location: string;
};

type NavGroup = {
  key: string;
  label: string;
  icon: React.ReactNode;
  newHref: string;
  items: NavItem[];
};

// ─── Animation ──────────────────────────────────────────────────────────

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

// ─── Group Configuration ────────────────────────────────────────────────

const locationOrder = ['HEADER', 'FOOTER_COMPANY', 'FOOTER_SOLUTIONS', 'FOOTER_INFO'];

const groupConfig: Record<string, { label: string; icon: React.ReactNode }> = {
  HEADER: { label: 'Header Navigation', icon: <Navigation className="h-4 w-4" /> },
  FOOTER_COMPANY: { label: 'Footer — Company', icon: <Building2 className="h-4 w-4" /> },
  FOOTER_SOLUTIONS: { label: 'Footer — Solutions', icon: <Lightbulb className="h-4 w-4" /> },
  FOOTER_INFO: { label: 'Footer — Info', icon: <Info className="h-4 w-4" /> },
};

// ─── Columns ─────────────────────────────────────────────────────────────

const columns: ColumnDef<NavItem>[] = [
  {
    key: 'label',
    label: 'Label',
    render: (n) => (
      <p className="font-medium text-sm text-slate-900">{n.label}</p>
    ),
  },
  {
    key: 'url',
    label: 'URL',
    render: (n) => (
      <span className="text-xs text-slate-500 font-mono bg-slate-50 px-1.5 py-0.5 rounded">
        {n.url}
      </span>
    ),
  },
];

// ─── Page ────────────────────────────────────────────────────────────────

export default function NavigationListPage() {
  const [allItems, setAllItems] = useState<NavItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<NavItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchNavItems = useCallback(async () => {
    try {
      const res = await fetch('/api/nav-items');
      if (!res.ok) throw new Error();
      const data = await res.json();
      setAllItems(data);
    } catch {
      setAllItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchNavItems(); }, [fetchNavItems]);

  const groups: NavGroup[] = locationOrder.map((loc) => ({
    key: loc,
    label: groupConfig[loc].label,
    icon: groupConfig[loc].icon,
    newHref: `/admin/navigation/new?location=${loc}`,
    items: allItems.filter((i) => i.location === loc),
  }));

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/nav-items/${deleteTarget.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setDeleteTarget(null);
      fetchNavItems();
    } catch {
      // keep dialog open
    } finally {
      setDeleting(false);
    }
  };

  const handleReorder = async (reordered: NavItem[]) => {
    await fetch('/api/nav-items', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: reordered.map((n, idx) => ({ id: n.id, order: idx })),
      }),
    });
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Page header */}
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Navigation</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage header and footer navigation links grouped by location.
        </p>
      </motion.div>

      {/* Grouped sections */}
      <div className="space-y-6">
        {groups.map((group) => (
          <motion.div key={group.key} variants={item}>
            <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
              {/* Group header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    {group.icon}
                    {group.label}
                  </h3>
                  <Badge
                    variant="secondary"
                    className="text-[11px] font-medium border-0 bg-slate-100 text-slate-500"
                  >
                    {group.items.length}
                  </Badge>
                </div>
              </div>

              {/* DataTable for this group */}
              <DataTable<NavItem>
                columns={columns}
                data={group.items}
                isLoading={loading}
                emptyMessage="No items yet."
                newHref={group.newHref}
                newLabel="New Nav Item"
                editable
                editHref={(n) => `/admin/navigation/${n.id}/edit`}
                deletable
                onDelete={setDeleteTarget}
                draggable
                onReorder={handleReorder}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Nav Item</AlertDialogTitle>
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
