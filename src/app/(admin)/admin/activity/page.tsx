'use client';

import { useEffect, useState, useCallback } from 'react';
import { Search, Filter, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { cn, formatDate } from '@/lib/cms-utils';

// ─── Types ──────────────────────────────────────────────────────────────────

interface ActivityLogItem {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  resourceId: string;
  details: string;
  createdAt: string;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const ACTION_OPTIONS = [
  { value: 'ALL', label: 'All Actions' },
  { value: 'CREATE', label: 'Create' },
  { value: 'UPDATE', label: 'Update' },
  { value: 'DELETE', label: 'Delete' },
  { value: 'PUBLISH', label: 'Publish' },
  { value: 'LOGIN', label: 'Login' },
];

const RESOURCE_OPTIONS = [
  { value: 'ALL', label: 'All Resources' },
  { value: 'Solution', label: 'Solution' },
  { value: 'Post', label: 'Post' },
  { value: 'TeamMember', label: 'Team Member' },
  { value: 'HomepageSection', label: 'Homepage Section' },
  { value: 'Nav', label: 'Navigation' },
  { value: 'Page', label: 'Page' },
  { value: 'Job', label: 'Job' },
  { value: 'Lead', label: 'Lead' },
  { value: 'Media', label: 'Media' },
  { value: 'Testimonial', label: 'Testimonial' },
  { value: 'ClientLogo', label: 'Client Logo' },
  { value: 'Seo', label: 'SEO' },
  { value: 'Redirect', label: 'Redirect' },
  { value: 'User', label: 'User' },
  { value: 'Setting', label: 'Setting' },
  { value: 'Maintenance', label: 'Maintenance' },
  { value: 'Analytics', label: 'Analytics' },
  { value: 'GlobeCountry', label: 'Globe Country' },
  { value: 'Stat', label: 'Stat' },
];

const PAGE_SIZE = 20;

// ─── Helpers ────────────────────────────────────────────────────────────────

function getActionBadgeClasses(action: string): string {
  switch (action) {
    case 'CREATE':
      return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'UPDATE':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'DELETE':
      return 'bg-red-100 text-red-700 border-red-200';
    case 'PUBLISH':
      return 'bg-purple-100 text-purple-700 border-purple-200';
    case 'LOGIN':
      return 'bg-slate-100 text-slate-600 border-slate-200';
    default:
      return 'bg-amber-100 text-amber-700 border-amber-200';
  }
}

/** Parse the JSON details field and return a readable summary string */
function formatDetails(detailsStr: string): string {
  if (!detailsStr) return '—';
  try {
    const details = JSON.parse(detailsStr);
    if (typeof details === 'string') return details;
    if (!details || typeof details !== 'object') return '—';

    const parts: string[] = [];

    // Show title/name if present
    if (details.title) parts.push(details.title);
    else if (details.name) parts.push(details.name);

    // Show field changes for UPDATE actions
    if (details.changes && Array.isArray(details.changes)) {
      const changeCount = details.changes.length;
      if (changeCount > 0) {
        const fieldNames = details.changes
          .slice(0, 3)
          .map((c: { field?: string; key?: string }) => c.field || c.key || '?')
          .join(', ');
        const suffix = changeCount > 3 ? ` +${changeCount - 3} more` : '';
        parts.push(`Changed: ${fieldNames}${suffix}`);
      }
    }

    // Show status if present
    if (details.status) parts.push(`Status: ${details.status}`);

    // Show email for login/user actions
    if (details.email) parts.push(details.email);

    // If nothing extracted, show a couple of key-value pairs
    if (parts.length === 0) {
      const entries = Object.entries(details).slice(0, 2);
      if (entries.length > 0) {
        for (const [k, v] of entries) {
          if (typeof v !== 'object') {
            parts.push(`${k}: ${v}`);
          }
        }
      }
    }

    return parts.length > 0 ? parts.join(' · ') : '—';
  } catch {
    // Not valid JSON — return truncated raw string
    return detailsStr.length > 80 ? detailsStr.slice(0, 80) + '…' : detailsStr;
  }
}

function formatTimestamp(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function ActivityPage() {
  const [logs, setLogs] = useState<ActivityLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [resourceFilter, setResourceFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (actionFilter && actionFilter !== 'ALL') params.set('action', actionFilter);
      if (resourceFilter && resourceFilter !== 'ALL') params.set('resource', resourceFilter);
      if (search) params.set('search', search);
      params.set('page', String(page));
      params.set('limit', String(PAGE_SIZE));

      const res = await fetch(`/api/activity-logs?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.data ?? []);
        setTotalPages(data.totalPages ?? 1);
        setTotal(data.total ?? 0);
      }
    } catch {
      // silently handle
    } finally {
      setLoading(false);
    }
  }, [actionFilter, resourceFilter, search, page]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Reset page when filters change
  function handleActionChange(val: string) {
    setActionFilter(val);
    setPage(1);
  }

  function handleResourceChange(val: string) {
    setResourceFilter(val);
    setPage(1);
  }

  function handleSearchChange(val: string) {
    setSearch(val);
    setPage(1);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Activity Log</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Audit log of all CMS actions · {total} records
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by user, resource, or details..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9 border-slate-200"
          />
        </div>
        <Select value={actionFilter} onValueChange={handleActionChange}>
          <SelectTrigger className="w-full sm:w-44 border-slate-200">
            <Filter className="mr-2 h-4 w-4 text-slate-400" />
            <SelectValue placeholder="Action type" />
          </SelectTrigger>
          <SelectContent>
            {ACTION_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={resourceFilter} onValueChange={handleResourceChange}>
          <SelectTrigger className="w-full sm:w-44 border-slate-200">
            <SelectValue placeholder="Resource type" />
          </SelectTrigger>
          <SelectContent>
            {RESOURCE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent bg-slate-50">
                <TableHead className="text-slate-600 font-semibold">Timestamp</TableHead>
                <TableHead className="text-slate-600 font-semibold">User</TableHead>
                <TableHead className="text-slate-600 font-semibold">Action</TableHead>
                <TableHead className="text-slate-600 font-semibold">Resource</TableHead>
                <TableHead className="text-slate-600 font-semibold">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="hover:bg-transparent">
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                  </TableRow>
                ))
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-40 text-center">
                    <p className="text-sm text-slate-400">No activity logs found.</p>
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id} className="group">
                    <TableCell className="text-sm text-slate-600 whitespace-nowrap">
                      {formatTimestamp(log.createdAt)}
                    </TableCell>
                    <TableCell className="text-sm font-medium text-slate-900 whitespace-nowrap">
                      {log.userName || 'System'}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-xs font-medium border',
                          getActionBadgeClasses(log.action)
                        )}
                      >
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-slate-500 whitespace-nowrap">
                      {log.resource
                        ? `${log.resource}${log.resourceId ? ` #${log.resourceId.slice(0, 8)}` : ''}`
                        : '—'}
                    </TableCell>
                    <TableCell className="text-sm text-slate-600 max-w-xs">
                      <span className="line-clamp-2">{formatDetails(log.details)}</span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
