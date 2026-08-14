'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { DataTable, type ColumnDef } from '../_components/DataTable';
import { Badge } from '@/components/ui/badge';
import { cn, formatDate, truncate } from '@/lib/cms-utils';
import { Briefcase, Users, Mail } from 'lucide-react';
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

type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  source: 'CONTACT' | 'DEMO_REQUEST' | 'NEWSLETTER';
  createdAt: string;
  updatedAt: string;
};

type FilterTab = 'ALL' | 'CONTACT' | 'DEMO_REQUEST' | 'NEWSLETTER';

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
  { value: 'CONTACT', label: 'Contact' },
  { value: 'DEMO_REQUEST', label: 'Demo Requests' },
  { value: 'NEWSLETTER', label: 'Newsletter' },
];

// ─── Source Badge ─────────────────────────────────────────────────────────

function SourceBadge({ source }: { source: string }) {
  const config: Record<string, string> = {
    CONTACT: 'bg-blue-100 text-blue-700',
    DEMO_REQUEST: 'bg-amber-100 text-amber-700',
    NEWSLETTER: 'bg-teal-100 text-teal-700',
  };
  const labels: Record<string, string> = {
    CONTACT: 'Contact',
    DEMO_REQUEST: 'Demo Request',
    NEWSLETTER: 'Newsletter',
  };

  return (
    <Badge
      variant="secondary"
      className={cn('text-[11px] font-medium border-0', config[source] || 'bg-slate-100 text-slate-600')}
    >
      {labels[source] || source}
    </Badge>
  );
}

// ─── Columns ─────────────────────────────────────────────────────────────

const columns: ColumnDef<Lead>[] = [
  {
    key: 'name',
    label: 'Name',
    render: (lead) => (
      <span className="text-sm font-medium text-slate-900">{lead.name || '—'}</span>
    ),
  },
  {
    key: 'email',
    label: 'Email',
    className: 'w-44',
    render: (lead) => (
      <span className="text-sm text-slate-600">{lead.email || '—'}</span>
    ),
  },
  {
    key: 'phone',
    label: 'Phone',
    className: 'w-36',
    render: (lead) => (
      <span className="text-sm text-slate-600">{lead.phone || '—'}</span>
    ),
  },
  {
    key: 'source',
    label: 'Source',
    className: 'w-32',
    render: (lead) => <SourceBadge source={lead.source} />,
  },
  {
    key: 'message',
    label: 'Message',
    render: (lead) => (
      <span className="text-sm text-slate-500 line-clamp-2">
        {lead.message ? truncate(lead.message, 80) : '—'}
      </span>
    ),
  },
  {
    key: 'createdAt',
    label: 'Created Date',
    className: 'w-32',
    render: (lead) => (
      <span className="text-sm text-slate-500">{formatDate(lead.createdAt)}</span>
    ),
  },
];

// ─── Stats Card ─────────────────────────────────────────────────────────

function StatsCard({ label, value, icon, color }: { label: string; value: number; icon: React.ReactNode; color: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 flex items-center gap-3">
      <div className={cn('flex items-center justify-center h-9 w-9 rounded-lg', color)}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        <p className="text-xs text-slate-500">{label}</p>
      </div>
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────

export default function LeadsListPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [allLeads, setAllLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>('ALL');
  const [deleteTarget, setDeleteTarget] = useState<Lead | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch all leads for stats
  const fetchAllLeads = useCallback(async () => {
    try {
      const res = await fetch('/api/leads');
      if (!res.ok) throw new Error();
      const data = await res.json();
      setAllLeads(data);
    } catch {
      setAllLeads([]);
    }
  }, []);

  // Fetch filtered leads
  const fetchLeads = useCallback(async () => {
    try {
      const query = activeTab === 'ALL' ? '' : `?source=${activeTab}`;
      const res = await fetch(`/api/leads${query}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setLeads(data);
    } catch {
      setLeads([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => { fetchAllLeads(); fetchLeads(); }, [fetchAllLeads, fetchLeads]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/leads/${deleteTarget.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setDeleteTarget(null);
      fetchAllLeads();
      fetchLeads();
    } catch {
      // keep dialog open
    } finally {
      setDeleting(false);
    }
  };

  // Stats
  const totalLeads = allLeads.length;
  const demoCount = allLeads.filter((l) => l.source === 'DEMO_REQUEST').length;
  const newsletterCount = allLeads.filter((l) => l.source === 'NEWSLETTER').length;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Leads</h1>
        <p className="text-sm text-slate-500 mt-1">
          View and manage your contact submissions, demo requests, and newsletter signups.
        </p>
      </motion.div>

      {/* Stats Summary */}
      <motion.div variants={item}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatsCard
            label="Total Leads"
            value={totalLeads}
            icon={<Users className="h-4 w-4 text-white" />}
            color="bg-danphe-primary"
          />
          <StatsCard
            label="Demo Requests"
            value={demoCount}
            icon={<Briefcase className="h-4 w-4 text-white" />}
            color="bg-amber-500"
          />
          <StatsCard
            label="Newsletter Signups"
            value={newsletterCount}
            icon={<Mail className="h-4 w-4 text-white" />}
            color="bg-teal-500"
          />
        </div>
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
        <DataTable<Lead>
          columns={columns}
          data={leads}
          isLoading={loading}
          emptyMessage="No leads yet."
          editable={false}
          deletable
          onDelete={setDeleteTarget}
          title={`${leads.length} ${leads.length === 1 ? 'lead' : 'leads'}`}
        />
      </motion.div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Lead</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this lead from <strong>&ldquo;{deleteTarget?.name || 'unknown'}&rdquo;</strong>?
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
