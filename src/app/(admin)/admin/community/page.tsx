'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Plus, Search, Pencil, Trash2, Loader2, FileText } from 'lucide-react';
import { cn, formatDate } from '@/lib/cms-utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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

type Post = {
  id: string;
  title: string;
  slug: string;
  coverImageUrl: string;
  author: string;
  publishedAt: string | null;
  excerpt: string;
  body: string;
  type: 'NEWS_EVENT' | 'COMMUNITY';
  status: 'DRAFT' | 'PUBLISHED';
  createdAt: string;
  updatedAt: string;
};

type StatusFilter = 'ALL' | 'PUBLISHED' | 'DRAFT';

// ─── Animation ────────────────────────────────────────────────────────────

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

// ─── Status Filter Chips ─────────────────────────────────────────────────

const statusFilters: { value: StatusFilter; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'PUBLISHED', label: 'Published' },
  { value: 'DRAFT', label: 'Draft' },
];

// ─── Page ───────────────────────────────────────────────────────────────

export default function CommunityListPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [deleteTarget, setDeleteTarget] = useState<Post | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchPosts = useCallback(async () => {
    try {
      const res = await fetch('/api/posts?type=COMMUNITY');
      if (!res.ok) throw new Error();
      const data = await res.json();
      setPosts(data);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const filteredPosts = useMemo(() => {
    let result = posts;
    if (statusFilter !== 'ALL') {
      result = result.filter((p) => p.status === statusFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((p) => p.title.toLowerCase().includes(q));
    }
    return result;
  }, [posts, statusFilter, search]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/posts/${deleteTarget.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setDeleteTarget(null);
      fetchPosts();
    } catch {
      // keep dialog open
    } finally {
      setDeleting(false);
    }
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={item} className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Community</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage community posts and updates.
          </p>
        </div>
        <Button
          onClick={() => router.push('/admin/community/new')}
          className="h-9 gap-2 text-sm font-medium"
        >
          <Plus className="h-4 w-4" />
          New Community Post
        </Button>
      </motion.div>

      {/* Search + Filters */}
      <motion.div variants={item} className="space-y-3">
        {/* Search bar */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title..."
            className="h-9 pl-9 text-sm"
          />
        </div>

        {/* Status filter chips */}
        <div className="flex items-center gap-2">
          {statusFilters.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setStatusFilter(f.value)}
              className={cn(
                'px-3 py-1.5 text-xs font-medium rounded-full border transition-colors',
                statusFilter === f.value
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Table */}
      <motion.div variants={item}>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FileText className="h-10 w-10 text-slate-300 mb-3" />
            <p className="text-sm font-medium text-slate-500">
              {search || statusFilter !== 'ALL'
                ? 'No posts match your filters.'
                : 'No community posts yet.'}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {search || statusFilter !== 'ALL'
                ? 'Try adjusting your search or filter.'
                : 'Create your first community post.'}
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
                  <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Title</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider w-36">Author</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider w-32">Published Date</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider w-28">Status</TableHead>
                  <TableHead className="w-20" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPosts.map((post) => (
                  <TableRow key={post.id} className="group">
                    <TableCell>
                      <div>
                        <p className="font-medium text-slate-900 text-sm">{post.title}</p>
                        <p className="text-xs text-slate-400 mt-0.5">/{post.slug}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-slate-600">{post.author || '—'}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-slate-500">
                        {post.publishedAt ? formatDate(post.publishedAt) : '—'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={post.status === 'PUBLISHED' ? 'default' : 'outline'}
                        className={cn(
                          'text-[11px] font-medium',
                          post.status === 'PUBLISHED'
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            : 'bg-slate-100 text-slate-500 border-slate-200',
                        )}
                      >
                        {post.status === 'PUBLISHED' ? 'Published' : 'Draft'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-slate-400 hover:text-slate-700"
                          onClick={() => router.push(`/admin/community/${post.id}/edit`)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-slate-400 hover:text-red-600"
                          onClick={() => setDeleteTarget(post)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </motion.div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Community Post</AlertDialogTitle>
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
