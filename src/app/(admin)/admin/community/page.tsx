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

type CommunityPost = {
  id: string;
  title: string;
  slug: string;
  status: 'DRAFT' | 'PUBLISHED';
  publishedAt: string | null;
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

const columns: ColumnDef<CommunityPost>[] = [
  {
    key: 'title',
    label: 'Title',
    render: (post) => (
      <span className="font-medium text-slate-900 text-sm">{post.title}</span>
    ),
  },
  {
    key: 'status',
    label: 'Status',
    className: 'w-28',
    render: (post) => (
      <Badge
        variant={post.status === 'PUBLISHED' ? 'default' : 'outline'}
        className={cn(
          'text-[11px] font-medium',
          post.status === 'PUBLISHED' && 'bg-emerald-600 hover:bg-emerald-700 text-white',
        )}
      >
        {post.status === 'PUBLISHED' ? 'Published' : 'Draft'}
      </Badge>
    ),
  },
  {
    key: 'publishedAt',
    label: 'Published Date',
    className: 'w-36',
    render: (post) => (
      <span className="text-sm text-slate-500">{post.publishedAt ? formatDate(post.publishedAt) : '—'}</span>
    ),
  },
];

// ─── Page ───────────────────────────────────────────────────────────────

export default function CommunityPage() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<CommunityPost | null>(null);
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
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Danphe Community</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage community posts published on the website.
        </p>
      </motion.div>

      <motion.div variants={item}>
        <DataTable<CommunityPost>
          columns={columns}
          data={posts}
          isLoading={loading}
          emptyMessage="No community posts yet. Create your first community post."
          newHref="/admin/posts/new?type=COMMUNITY"
          newLabel="Create Community Post"
          editable
          editHref={(post) => `/admin/posts/${post.id}/edit`}
          deletable
          onDelete={setDeleteTarget}
          title={`${posts.length} ${posts.length === 1 ? 'post' : 'posts'}`}
        />
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
