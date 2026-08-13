'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FileText, FileStack, Image, Plus, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { StatsCard } from '@/components/cms/StatsCard';
import { cn, formatDate } from '@/lib/cms-utils';

interface PostItem {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  author: { name: string };
}

interface DashboardStats {
  totalPosts: number;
  publishedPosts: number;
  totalPages: number;
  mediaFiles: number;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsRes, postsRes] = await Promise.all([
          fetch('/api/posts?limit=0'),
          fetch('/api/posts?limit=5'),
        ]);

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          const allPosts = statsData.posts ?? statsData;
          const totalPosts = Array.isArray(allPosts) ? allPosts.length : (statsData.total ?? 0);
          const publishedPosts = Array.isArray(allPosts)
            ? allPosts.filter((p: PostItem) => p.status === 'PUBLISHED').length
            : (statsData.published ?? 0);

          setStats({
            totalPosts,
            publishedPosts,
            totalPages: statsData.totalPages ?? 0,
            mediaFiles: statsData.mediaFiles ?? 0,
          });
        }

        if (postsRes.ok) {
          const postsData = await postsRes.json();
          setPosts(postsData.posts ?? postsData);
        }
      } catch {
        // Silently handle - use default 0s
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

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

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Page Title */}
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold text-danphe-text">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Welcome back. Here is an overview of your CMS.
        </p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="border-danphe-border/60">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                  <Skeleton className="h-10 w-10 rounded-lg" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <StatsCard
              title="Total Posts"
              value={stats?.totalPosts ?? 0}
              icon={FileText}
              color="bg-danphe-accent/10 text-danphe-accent"
            />
            <StatsCard
              title="Published Posts"
              value={stats?.publishedPosts ?? 0}
              icon={FileText}
              color="bg-emerald-100 text-emerald-600"
              trend={stats?.publishedPosts ? `+${stats.publishedPosts} live` : undefined}
            />
            <StatsCard
              title="Total Pages"
              value={stats?.totalPages ?? 0}
              icon={FileStack}
              color="bg-amber-100 text-amber-600"
            />
            <StatsCard
              title="Media Files"
              value={stats?.mediaFiles ?? 0}
              icon={Image}
              color="bg-rose-100 text-rose-600"
            />
          </>
        )}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <motion.div variants={item}>
          <Card className="border-danphe-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button asChild variant="outline" className="w-full justify-start gap-2 border-danphe-border hover:bg-danphe-bg-light">
                <Link href="/admin/posts/new">
                  <Plus className="h-4 w-4 text-danphe-accent" />
                  New Post
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start gap-2 border-danphe-border hover:bg-danphe-bg-light">
                <Link href="/admin/pages/new">
                  <Plus className="h-4 w-4 text-danphe-accent" />
                  New Page
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start gap-2 border-danphe-border hover:bg-danphe-bg-light">
                <Link href="/admin/media">
                  <Plus className="h-4 w-4 text-danphe-accent" />
                  Upload Media
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Posts */}
        <motion.div variants={item} className="lg:col-span-2">
          <Card className="border-danphe-border/60">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base font-semibold">Recent Posts</CardTitle>
              <Button asChild variant="ghost" size="sm" className="text-danphe-accent hover:text-danphe-accent/80">
                <Link href="/admin/posts">
                  View all <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="space-y-1.5">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                      <Skeleton className="h-5 w-20 rounded-full" />
                    </div>
                  ))}
                </div>
              ) : posts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">No posts yet. Create your first post!</p>
                </div>
              ) : (
                <div className="space-y-1 max-h-72 overflow-y-auto">
                  {posts.map((post) => (
                    <Link
                      key={post.id}
                      href={`/admin/posts/${post.id}/edit`}
                      className="flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-danphe-bg-light transition-colors group"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-danphe-text truncate group-hover:text-danphe-accent transition-colors">
                          {post.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {post.author?.name ?? 'Unknown'} · {formatDate(post.createdAt)}
                        </p>
                      </div>
                      <Badge
                        variant="secondary"
                        className={cn('ml-3 shrink-0 text-xs', statusColor(post.status))}
                      >
                        {post.status}
                      </Badge>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}