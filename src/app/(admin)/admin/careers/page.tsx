'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { DataTable, type ColumnDef } from '../_components/DataTable';
import { Badge } from '@/components/ui/badge';
import { cn, formatDate } from '@/lib/cms-utils';
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

type Job = {
  id: string;
  title: string;
  department: string;
  location: string;
  employmentType: string;
  description: string;
  requirements: string;
  applyEmail: string;
  status: 'OPEN' | 'CLOSED';
  order: number;
  postedAt: string;
  createdAt: string;
  updatedAt: string;
};

type FilterTab = 'ALL' | 'OPEN' | 'CLOSED';

// ─── Animation ────────────────────────────────────────────────────────────

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

// ─── Filter Tabs ──────────────────────────────────────────────────────────

const filterTabs: { value: FilterTab; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'OPEN', label: 'Open' },
  { value: 'CLOSED', label: 'Closed' },
];

// ─── Columns ─────────────────────────────────────────────────────────────

const columns: ColumnDef<Job>[] = [
  {
    key: 'title',
    label: 'Title',
    render: (job) => (
      <div>
        <p className="font-medium text-slate-900 text-sm">{job.title}</p>
      </div>
    ),
  },
  {
    key: 'department',
    label: 'Department',
    className: 'w-32',
    render: (job) =>
      job.department ? (
        <Badge
          variant="secondary"
          className="text-[11px] font-medium border-0 bg-slate-100 text-slate-600"
        >
          {job.department}
        </Badge>
      ) : (
        <span className="text-sm text-slate-400">—</span>
      ),
  },
  {
    key: 'location',
    label: 'Location',
    className: 'w-32',
    render: (job) => (
      <span className="text-sm text-slate-600">{job.location || '—'}</span>
    ),
  },
  {
    key: 'employmentType',
    label: 'Employment Type',
    className: 'w-32',
    render: (job) =>
      job.employmentType ? (
        <Badge
          variant="secondary"
          className="text-[11px] font-medium border-0 bg-violet-50 text-violet-700"
        >
          {job.employmentType}
        </Badge>
      ) : (
        <span className="text-sm text-slate-400">—</span>
      ),
  },
  {
    key: 'status',
    label: 'Status',
    className: 'w-24',
    render: (job) => (
      <Badge
        variant={job.status === 'OPEN' ? 'default' : 'outline'}
        className={cn(
          'text-[11px] font-medium',
          job.status === 'OPEN'
            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
            : 'text-red-600',
        )}
      >
        {job.status === 'OPEN' ? 'Open' : 'Closed'}
      </Badge>
    ),
  },
  {
    key: 'postedAt',
    label: 'Posted Date',
    className: 'w-32',
    render: (job) => (
      <span className="text-sm text-slate-500">{formatDate(job.postedAt)}</span>
    ),
  },
];

// ─── Page ───────────────────────────────────────────────────────────────

export default function CareersListPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>('ALL');
  const [deleteTarget, setDeleteTarget] = useState<Job | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchJobs = useCallback(async () => {
    try {
      const query = activeTab === 'ALL' ? '' : `?status=${activeTab}`;
      const res = await fetch(`/api/jobs${query}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setJobs(data);
    } catch {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/jobs/${deleteTarget.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setDeleteTarget(null);
      fetchJobs();
    } catch {
      // keep dialog open
    } finally {
      setDeleting(false);
    }
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Careers</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your job listings and career opportunities.
        </p>
      </motion.div>

      {/* Filter Tabs */}
      <motion.div variants={item}>
        <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1 w-fit">
          {filterTabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                activeTab === tab.value
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </motion.div>

      <motion.div variants={item}>
        <DataTable<Job>
          columns={columns}
          data={jobs}
          isLoading={loading}
          emptyMessage="No jobs yet. Create your first job listing."
          newHref="/admin/careers/new"
          newLabel="New Job"
          editable
          editHref={(job) => `/admin/careers/${job.id}/edit`}
          deletable
          onDelete={setDeleteTarget}
          title={`${jobs.length} ${jobs.length === 1 ? 'job' : 'jobs'}`}
        />
      </motion.div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Job</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>&ldquo;{deleteTarget?.title}&rdquo;</strong>?
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
