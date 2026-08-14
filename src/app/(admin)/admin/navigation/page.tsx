'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { DataTable, type ColumnDef } from '../_components/DataTable';
import { Button } from '@/components/ui/button';
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
  createdAt: string;
  updatedAt: string;
};

type NavGroup = {
  key: string;
  label: string;
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

// ─── Location Labels ──────────────────────────────────────────────────────

const locationLabels: Record<string, string> = {
  HEADER: 'Header Navigation',
  FOOTER_COMPANY: 'Footer — Company',
  FOOTER_SOLUTIONS: 'Footer — Solutions',
  FOOTER_INFO: 'Footer — Information',
};

const locationOrder = ['HEADER', 'FOOTER_COMPANY', 'FOOTER_SOLUTIONS', 'FOOTER_INFO'];

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
      <p className="text-sm text-slate-500 line-clamp-1 max-w-[200px]">{n.url}</p>
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
      const res = await fetch('/api/navigation');
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
    label: locationLabels[loc],
    newHref: `/admin/navigation/new?location=${loc}`,
    items: allItems.filter((i) => i.location === loc),
  }));

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/navigation/${deleteTarget.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setDeleteTarget(null);
      fetchNavItems();
    } catch {
      // keep dialog open
    } finally {
      setDeleting(false);
    }
  };

  const handleReorder = async (reordered: NavItem[], groupKey: string) => {
    await fetch('/api/navigation', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: reordered.map((n, idx) => ({ id: n.id, order: idx })),
      }),
    });
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Navigation</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage header and footer navigation links grouped by location.
        </p>
      </motion.div>

      <div className="space-y-8">
        {groups.map((group) => (
          <motion.div key={group.key} variants={item} className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-700">{group.label}</h3>
              <Link href={group.newHref}>
                <Button size="sm" variant="outline" className="h-7 gap-1.5 text-xs">
                  <Plus className="h-3 w-3" />
                  Add Item
                </Button>
              </Link>
            </div>
            <DataTable<NavItem>
              columns={columns}
              data={group.items}
              isLoading={loading}
              emptyMessage="No items yet."
              editable
              editHref={(n) => `/admin/navigation/${n.id}/edit`}
              deletable
              onDelete={setDeleteTarget}
              draggable
              onReorder={(reordered) => handleReorder(reordered, group.key)}
            />
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
