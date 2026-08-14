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

type FilterTab = 'ALL' | 'NEWS_EVENT' | 'COMMUNITY';

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
  { value: 'NEWS_EVENT', label: 'News & Events' },
  { value: 'COMMUNITY', label: 'Community' },
];

// ─── Columns ─────────────────────────────────────────────────────────────

const columns: ColumnDef<Post>[] = [
  {
    key: 'title',
    label: 'Title',
    render: (post) => (
      <div>
        <p className="font-medium text-slate-900 text-sm">{post.title}</p>
        {post.excerpt && (
          <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{post.excerpt}</p>
        )}
      </div>
    ),
  },
  {
    key: 'type',
    label: 'Type',
    className: 'w-32',
    render: (post) => (
      <Badge
        variant="secondary"
        className={cn(
          'text-[11px] font-medium border-0',
          post.type === 'NEWS_EVENT'
            ? 'bg-blue-100 text-blue-700'
            : 'bg-purple-100 text-purple-700',
        )}
      >
        {post.type === 'NEWS_EVENT' ? 'News & Events' : 'Community'}
      </Badge>
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
    key: 'author',
    label: 'Author',
    className: 'w-36',
    render: (post) => (
      <span className="text-sm text-slate-600">{post.author || '—'}</span>
    ),
  },
  {
    key: 'publishedAt',
    label: 'Published Date',
    className: 'w-32',
    render: (post) => (
      <span className="text-sm text-slate-500">{post.publishedAt ? formatDate(post.publishedAt) : '—'}</span>
    ),
  },
];

// ─── Page ───────────────────────────────────────────────────────────────

export default function PostsListPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>('ALL');
  const [deleteTarget, setDeleteTarget] = useState<Post | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchPosts = useCallback(async () => {
    try {
      const query = activeTab === 'ALL' ? '' : `?type=${activeTab}`;
      const res = await fetch(`/api/posts${query}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setPosts(data);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

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
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Posts</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your news, events, and community posts.
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
        <DataTable<Post>
          columns={columns}
          data={posts}
          isLoading={loading}
          emptyMessage="No posts yet. Create your first post."
          newHref="/admin/posts/new"
          newLabel="New Post"
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
            <AlertDialogTitle>Delete Post</AlertDialogTitle>
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
