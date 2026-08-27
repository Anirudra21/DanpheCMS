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

type GlobeCountry = {
  id: string;
  countryName: string;
  latitude: number;
  longitude: number;
  hospitalCount: number;
  displayLabel: string;
  isHighlighted: boolean;
  isActive: boolean;
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

const columns: ColumnDef<GlobeCountry>[] = [
  {
    key: 'countryName',
    label: 'Country',
    render: (c) => (
      <div className='flex items-center gap-2'>
        {c.isHighlighted && (
          <span className='inline-flex h-5 w-5 items-center justify-center rounded-full bg-danphe-accent/10'>
            <span className='h-2 w-2 rounded-full bg-danphe-accent' />
          </span>
        )}
        <p className='font-medium text-slate-900 text-sm'>{c.countryName}</p>
      </div>
    ),
  },
  {
    key: 'hospitalCount',
    label: 'Hospitals',
    className: 'w-24 text-center',
    render: (c) => (
      <span className='text-sm font-semibold text-slate-900'>{c.hospitalCount}</span>
    ),
  },
  {
    key: 'displayLabel',
    label: 'Display Label',
    render: (c) => (
      <p className='text-xs text-slate-500'>{c.displayLabel || '—'}</p>
    ),
  },
  {
    key: 'coordinates',
    label: 'Coordinates',
    className: 'w-36',
    render: (c) => (
      <p className='font-mono text-[11px] text-slate-400'>
        {c.latitude.toFixed(2)}, {c.longitude.toFixed(2)}
      </p>
    ),
  },
  {
    key: 'isActive',
    label: 'Status',
    className: 'w-20 text-center',
    render: (c) => (
      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
        c.isActive
          ? 'bg-emerald-50 text-emerald-700'
          : 'bg-slate-100 text-slate-400'
      }`}>
        {c.isActive ? 'Active' : 'Inactive'}
      </span>
    ),
  },
  {
    key: 'order',
    label: 'Order',
    className: 'w-16 text-center',
    render: (c) => (
      <span className='inline-flex items-center justify-center h-6 min-w-[24px] rounded-full bg-slate-100 px-2 text-[11px] font-medium text-slate-600'>
        {c.order}
      </span>
    ),
  },
];

// ─── Page ───────────────────────────────────────────────────────────────

export default function GlobeCountriesListPage() {
  const [countries, setCountries] = useState<GlobeCountry[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<GlobeCountry | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCountries = useCallback(async () => {
    try {
      const res = await fetch('/api/globe-countries');
      if (!res.ok) throw new Error();
      const data = await res.json();
      setCountries(data);
    } catch {
      setCountries([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCountries(); }, [fetchCountries]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/globe-countries/${deleteTarget.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setDeleteTarget(null);
      fetchCountries();
    } catch {
      // keep dialog open
    } finally {
      setDeleting(false);
    }
  };

  const handleReorder = async (reordered: GlobeCountry[]) => {
    await fetch('/api/globe-countries', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: reordered.map((c, idx) => ({ id: c.id, order: idx })),
      }),
    });
  };

  return (
    <motion.div variants={container} initial='hidden' animate='show' className='space-y-6'>
      <motion.div variants={item}>
        <h1 className='text-2xl font-bold text-slate-900 tracking-tight'>Globe Countries</h1>
        <p className='text-sm text-slate-500 mt-1'>
          Manage countries displayed on the interactive globe. Changes update the public website instantly.
        </p>
      </motion.div>

      <motion.div variants={item}>
        <DataTable<GlobeCountry>
          columns={columns}
          data={countries}
          isLoading={loading}
          emptyMessage='No countries yet. Add your first country to the globe.'
          newHref='/admin/globe-countries/new'
          newLabel='New Country'
          editable
          editHref={(c) => `/admin/globe-countries/${c.id}/edit`}
          deletable
          onDelete={setDeleteTarget}
          draggable
          onReorder={handleReorder}
          title={`${countries.length} ${countries.length === 1 ? 'country' : 'countries'} · ${countries.filter((c) => c.isActive).length} active`}
        />
      </motion.div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Country</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>&ldquo;{deleteTarget?.countryName}&rdquo;</strong>?
              This will remove it from the public globe.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className='bg-red-600 hover:bg-red-700 focus:ring-red-600'
            >
              {deleting ? 'Deleting…' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
