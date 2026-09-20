'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { DataTable, type ColumnDef } from '../_components/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn, formatDate, truncate } from '@/lib/cms-utils';
import { Briefcase, Users, Mail, Download, CalendarDays, X, RotateCcw } from 'lucide-react';
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

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

// ─── CSV Export Helper ────────────────────────────────────────────────────

function downloadCSV(leads: Lead[], filename: string) {
  if (!leads.length) return;

  const header = 'Name,Email,Phone,Source,Message,Created At';
  const escape = (str: string) =>
    `"${(str || '').replace(/"/g, '""')}"`;
  const sourceLabel = (s: string) =>
    s === 'CONTACT' ? 'Contact' : s === 'DEMO_REQUEST' ? 'Demo Request' : 'Newsletter';

  const rows = leads.map((l) =>
    [escape(l.name), escape(l.email), escape(l.phone), sourceLabel(l.source), escape(l.message), escape(formatDate(l.createdAt))].join(',')
  );

  const csv = [header, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── Date Input (plain HTML to avoid shadcn DatePicker complexity) ─────────

function DateRangePicker({
  from,
  to,
  onFromChange,
  onToChange,
  onClear,
}: {
  from: string;
  to: string;
  onFromChange: (v: string) => void;
  onToChange: (v: string) => void;
  onClear: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs font-normal text-slate-600"
          >
            <CalendarDays className="h-3.5 w-3.5" />
            {from && to
              ? `${from} → ${to}`
              : from
                ? `From ${from}`
                : to
                  ? `Until ${to}`
                  : 'Date range'}
            {(from || to) && (
              <span
                role="button"
                tabIndex={0}
                aria-label="Clear date range"
                className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600"
                onClick={(e) => { e.stopPropagation(); onClear(); }}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); onClear(); } }}
              >
                <X className="h-2.5 w-2.5" />
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-3">
          <div className="space-y-2">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-500">From</label>
              <input
                type="date"
                value={from}
                max={to || undefined}
                onChange={(e) => onFromChange(e.target.value)}
                className="h-8 w-full rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 outline-none focus:ring-2 focus:ring-danphe-accent/30 focus:border-danphe-accent/50"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-500">To</label>
              <input
                type="date"
                value={to}
                min={from || undefined}
                onChange={(e) => onToChange(e.target.value)}
                className="h-8 w-full rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 outline-none focus:ring-2 focus:ring-danphe-accent/30 focus:border-danphe-accent/50"
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
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
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [exporting, setExporting] = useState(false);

  // Build query params from active filters
  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    if (activeTab !== 'ALL') params.set('source', activeTab);
    if (dateFrom) params.set('from', dateFrom);
    if (dateTo) params.set('to', dateTo);
    return params.toString();
  }, [activeTab, dateFrom, dateTo]);

  // Fetch all leads for stats (unfiltered)
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
    setLoading(true);
    try {
      const query = queryParams ? `?${queryParams}` : '';
      const res = await fetch(`/api/leads${query}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setLeads(data);
    } catch {
      setLeads([]);
    } finally {
      setLoading(false);
    }
  }, [queryParams]);

  useEffect(() => {
    fetchAllLeads();
  }, [fetchAllLeads]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

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

  // CSV export
  const handleExport = async () => {
    setExporting(true);
    try {
      // Re-fetch current filtered set to ensure latest data
      const query = queryParams ? `?${queryParams}` : '';
      const res = await fetch(`/api/leads${query}`);
      if (!res.ok) throw new Error();
      const data: Lead[] = await res.json();
      const dateStr = new Date().toISOString().slice(0, 10);
      const sourceStr = activeTab === 'ALL' ? 'all' : activeTab.toLowerCase();
      downloadCSV(data, `danphe-leads-${sourceStr}-${dateStr}.csv`);
    } catch {
      // silent
    } finally {
      setExporting(false);
    }
  };

  const clearFilters = () => {
    setActiveTab('ALL');
    setDateFrom('');
    setDateTo('');
  };

  const hasActiveFilters = activeTab !== 'ALL' || !!dateFrom || !!dateTo;

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

      {/* Filter bar: tabs + date range + export */}
      <motion.div variants={item}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Source tabs */}
            <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
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

            {/* Date range picker */}
            <DateRangePicker
              from={dateFrom}
              to={dateTo}
              onFromChange={setDateFrom}
              onToChange={setDateTo}
              onClear={() => { setDateFrom(''); setDateTo(''); }}
            />

            {/* Clear all filters */}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5 text-xs text-slate-500 hover:text-slate-700"
                onClick={clearFilters}
              >
                <RotateCcw className="h-3 w-3" />
                Clear filters
              </Button>
            )}
          </div>

          {/* CSV Export */}
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs"
            disabled={exporting || !leads.length}
            onClick={handleExport}
          >
            <Download className="h-3.5 w-3.5" />
            {exporting ? 'Exporting…' : 'Export CSV'}
          </Button>
        </div>
      </motion.div>

      <motion.div variants={item}>
        <DataTable<Lead>
          columns={columns}
          data={leads}
          isLoading={loading}
          emptyMessage={hasActiveFilters ? 'No leads match your filters.' : 'No leads yet.'}
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