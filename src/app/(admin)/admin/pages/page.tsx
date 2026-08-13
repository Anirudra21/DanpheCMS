'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Search, Trash2, Pencil } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { useToast } from '@/hooks/use-toast';
import { DataTable, type Column } from '@/components/cms/DataTable';
import { cn, formatDate } from '@/lib/cms-utils';

interface PageItem {
  id: string;
  title: string;
  status: string;
  template: string;
  createdAt: string;
}

const statusColor = (status: string) => {
  switch (status) {
    case 'PUBLISHED':
      return 'bg-emerald-100 text-emerald-700';
    case 'DRAFT':
      return 'bg-amber-100 text-amber-700';
    case 'ARCHIVED':
      return 'bg-slate-100 text-slate-600';
    default:
      return 'bg-slate-100 text-slate-600';
  }
};

const templateLabel = (t: string) => {
  switch (t) {
    case 'full-width': return 'Full Width';
    case 'sidebar': return 'Sidebar';
    default: return 'Default';
  }
};

export default function PagesPage() {
  const [pages, setPages] = useState<PageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteTarget, setDeleteTarget] = useState<PageItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();

  const fetchPages = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter);
      if (search) params.set('search', search);
      const res = await fetch(`/api/pages?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setPages(data.pages ?? data);
      }
    } catch {
      // silently handle
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/pages/${deleteTarget.id}`, { method: 'DELETE' });
      if (res.ok) {
        toast({ title: 'Page deleted', description: `"${deleteTarget.title}" has been removed.` });
        setPages((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      } else {
        toast({ title: 'Error', description: 'Failed to delete page.', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'Network error.', variant: 'destructive' });
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const columns: Column<PageItem>[] = [
    {
      key: 'title',
      label: 'Title',
      render: (page) => (
        <Link
          href={`/admin/pages/${page.id}/edit`}
          className="font-medium text-danphe-text hover:text-danphe-accent transition-colors"
        >
          {page.title}
        </Link>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (page) => (
        <Badge variant="secondary" className={cn('text-xs', statusColor(page.status))}>
          {page.status}
        </Badge>
      ),
    },
    {
      key: 'template',
      label: 'Template',
      render: (page) => (
        <span className="text-sm text-muted-foreground">{templateLabel(page.template)}</span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Date',
      render: (page) => <span className="text-sm text-muted-foreground">{formatDate(page.createdAt)}</span>,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (page) => (
        <div className="flex items-center gap-1">
          <Button asChild variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Link href={`/admin/pages/${page.id}/edit`}>
              <Pencil className="h-3.5 w-3.5" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={() => setDeleteTarget(page)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-danphe-text">Pages</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage your site pages</p>
        </div>
        <Button asChild className="bg-danphe-accent hover:bg-danphe-accent-light text-white">
          <Link href="/admin/pages/new">
            <Plus className="mr-2 h-4 w-4" />
            New Page
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search pages..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 border-danphe-border"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40 border-danphe-border">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="PUBLISHED">Published</SelectItem>
            <SelectItem value="ARCHIVED">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={pages}
        isLoading={loading}
        emptyMessage="No pages found. Create your first page!"
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Page</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deleteTarget?.title}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}