'use client';

import { useEffect, useState, useCallback } from 'react';
import { Search, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DataTable, type Column } from '@/components/cms/DataTable';
import { cn, formatDate } from '@/lib/cms-utils';

interface ActivityLogItem {
  id: string;
  userId: string | null;
  user?: { name: string } | null;
  action: string;
  resource: string | null;
  resourceId: string | null;
  createdAt: string;
}

const actionColor = (action: string) => {
  const lower = action.toLowerCase();
  if (lower.includes('create') || lower.includes('add')) return 'bg-emerald-100 text-emerald-700';
  if (lower.includes('delete') || lower.includes('remove')) return 'bg-red-100 text-red-700';
  if (lower.includes('update') || lower.includes('edit')) return 'bg-amber-100 text-amber-700';
  if (lower.includes('login') || lower.includes('auth')) return 'bg-danphe-accent/10 text-danphe-accent';
  return 'bg-slate-100 text-slate-600';
};

const ACTION_TYPES = [
  'ALL',
  'CREATE',
  'UPDATE',
  'DELETE',
  'LOGIN',
  'PUBLISH',
];

export default function ActivityPage() {
  const [logs, setLogs] = useState<ActivityLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (actionFilter && actionFilter !== 'ALL') params.set('action', actionFilter);
      if (search) params.set('search', search);
      const res = await fetch(`/api/activity-logs?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs ?? data);
      }
    } catch {
      // silently handle
    } finally {
      setLoading(false);
    }
  }, [actionFilter, search]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const columns: Column<ActivityLogItem>[] = [
    {
      key: 'user',
      label: 'User',
      render: (log) => (
        <span className="text-sm font-medium">
          {log.user?.name ?? 'System'}
        </span>
      ),
    },
    {
      key: 'action',
      label: 'Action',
      render: (log) => (
        <Badge variant="secondary" className={cn('text-xs', actionColor(log.action))}>
          {log.action}
        </Badge>
      ),
    },
    {
      key: 'resource',
      label: 'Resource',
      render: (log) => (
        <span className="text-sm text-muted-foreground">
          {log.resource ? `${log.resource}${log.resourceId ? ` #${log.resourceId.slice(0, 8)}` : ''}` : '—'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Date',
      render: (log) => (
        <span className="text-sm text-muted-foreground">{formatDate(log.createdAt)}</span>
      ),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-danphe-text">Activity</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Audit log of all CMS actions</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search activity..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 border-danphe-border"
          />
        </div>
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-full sm:w-44 border-danphe-border">
            <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder="Action type" />
          </SelectTrigger>
          <SelectContent>
            {ACTION_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {type === 'ALL' ? 'All Actions' : type.charAt(0) + type.slice(1).toLowerCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={logs}
        isLoading={loading}
        emptyMessage="No activity logs found."
      />
    </motion.div>
  );
}