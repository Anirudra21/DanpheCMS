'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Puzzle,
  Newspaper,
  Briefcase,
  Megaphone,
  Layout,
  Settings,
  Navigation,
  Users,
  BarChart3,
  MessageSquareQuote,
  Building2,
  Globe,
  UserCog,
  ArrowUpRight,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/cms-utils';
import { formatDate } from '@/lib/cms-utils';

// ─── Types ──────────────────────────────────────────────────────────────────

type DashboardStats = {
  totalSolutions: number;
  publishedPosts: number;
  openJobs: number;
  newLeadsThisWeek: number;
};

type RecentLead = {
  id: string;
  name: string;
  email: string;
  source: string;
  createdAt: string;
};

// ─── Animation Variants ─────────────────────────────────────────────────────

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

// ─── Stat Card Config ───────────────────────────────────────────────────────

const statCards = [
  {
    key: 'totalSolutions' as const,
    label: 'Total Solutions',
    icon: Puzzle,
    href: '/admin/solutions',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    ring: 'ring-emerald-100',
  },
  {
    key: 'publishedPosts' as const,
    label: 'Published Posts',
    icon: Newspaper,
    href: '/admin/posts',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    ring: 'ring-blue-100',
  },
  {
    key: 'openJobs' as const,
    label: 'Open Careers',
    icon: Briefcase,
    href: '/admin/careers',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    ring: 'ring-amber-100',
  },
  {
    key: 'newLeadsThisWeek' as const,
    label: 'Leads This Week',
    icon: Megaphone,
    href: '/admin/leads',
    color: 'text-rose-600',
    bg: 'bg-rose-50',
    ring: 'ring-rose-100',
  },
];

// ─── Quick Access Links ─────────────────────────────────────────────────────

const quickLinks = [
  { href: '/admin/homepage', label: 'Homepage Sections', icon: Layout, color: 'bg-slate-100 text-slate-700' },
  { href: '/admin/solutions', label: 'Solutions', icon: Puzzle, color: 'bg-emerald-50 text-emerald-700' },
  { href: '/admin/team', label: 'Team Members', icon: Users, color: 'bg-violet-50 text-violet-700' },
  { href: '/admin/stats', label: 'Stats', icon: BarChart3, color: 'bg-amber-50 text-amber-700' },
  { href: '/admin/testimonials', label: 'Testimonials', icon: MessageSquareQuote, color: 'bg-rose-50 text-rose-700' },
  { href: '/admin/client-logos', label: 'Client Logos', icon: Building2, color: 'bg-cyan-50 text-cyan-700' },
  { href: '/admin/navigation', label: 'Navigation', icon: Navigation, color: 'bg-indigo-50 text-indigo-700' },
  { href: '/admin/settings', label: 'Site Settings', icon: Settings, color: 'bg-slate-100 text-slate-700' },
  { href: '/admin/community', label: 'Community', icon: Globe, color: 'bg-teal-50 text-teal-700' },
  { href: '/admin/users', label: 'Users', icon: UserCog, color: 'bg-fuchsia-50 text-fuchsia-700' },
];

// ─── Source badge styling ───────────────────────────────────────────────────

const sourceStyles: Record<string, string> = {
  CONTACT: 'bg-slate-100 text-slate-700',
  DEMO_REQUEST: 'bg-blue-100 text-blue-700',
  NEWSLETTER: 'bg-emerald-100 text-emerald-700',
};

// ─── Animated Counter ───────────────────────────────────────────────────────

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (value === 0) return;
    let start = 0;
    const duration = 600;
    const stepTime = duration / value;
    const timer = setInterval(() => {
      start += 1;
      setDisplay(start);
      if (start >= value) clearInterval(timer);
    }, Math.max(stepTime, 30));
    return () => clearInterval(timer);
  }, [value]);

  return <span>{display}</span>;
}

// ─── Stat Card Component ────────────────────────────────────────────────────

function StatCard({
  config,
  value,
}: {
  config: (typeof statCards)[number];
  value: number;
}) {
  const Icon = config.icon;
  return (
    <Link href={config.href}>
      <Card className="group relative overflow-hidden border-slate-200/80 bg-white hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 hover:-translate-y-0.5">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-500">{config.label}</p>
              <p className="text-3xl font-bold text-slate-900 tracking-tight">
                <AnimatedNumber value={value} />
              </p>
            </div>
            <div
              className={cn(
                'flex h-11 w-11 items-center justify-center rounded-xl ring-1 transition-transform duration-300 group-hover:scale-110',
                config.bg,
                config.ring,
              )}
            >
              <Icon className={cn('h-5 w-5', config.color)} />
            </div>
          </div>
          <div className="mt-3 flex items-center text-xs font-medium text-slate-400 group-hover:text-danphe-accent transition-colors">
            <span>View all</span>
            <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-0.5" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

// ─── Loading Skeleton ───────────────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div>
        <Skeleton className="h-7 w-40 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[140px] rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-[300px] rounded-xl" />
    </div>
  );
}

// ─── Main Dashboard Page ────────────────────────────────────────────────────

export default function DashboardPage() {
  const { data: session } = useSession();
  const user = session?.user;
  const userName = user?.name ?? 'Admin';
  const userRole = (user as Record<string, unknown>)?.role as string | undefined;

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentLeads, setRecentLeads] = useState<RecentLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch('/api/admin/dashboard');
        if (!res.ok) throw new Error('Failed to load dashboard');
        const data = await res.json();
        setStats(data.stats);
        setRecentLeads(data.recentLeads ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  if (loading) return <DashboardSkeleton />;

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <p className="text-sm text-slate-500">{error}</p>
          <button
            className="mt-2 text-sm text-danphe-accent hover:underline"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
      {/* Welcome header */}
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">
          Welcome back,{' '}
          <span className="font-semibold text-slate-700">{userName}</span>
          {userRole && (
            <span className="ml-2 inline-flex items-center rounded-full bg-danphe-accent/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-danphe-accent">
              {userRole.replace('_', ' ')}
            </span>
          )}
        </p>
      </motion.div>

      {/* Stat Cards */}
      <motion.div variants={item}>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {statCards.map((config) => (
            <StatCard
              key={config.key}
              config={config}
              value={stats?.[config.key] ?? 0}
            />
          ))}
        </div>
      </motion.div>

      {/* Bottom grid: Recent Leads + Quick Access */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Recent Leads Table */}
        <motion.div variants={item} className="xl:col-span-3">
          <Card className="border-slate-200/80 bg-white">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-slate-900">
                  Recent Leads
                </CardTitle>
                <Link
                  href="/admin/leads"
                  className="inline-flex items-center gap-1 text-xs font-medium text-danphe-accent hover:text-danphe-accent/80 transition-colors"
                >
                  View all
                  <ArrowUpRight className="h-3 w-3" />
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {recentLeads.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-sm text-slate-400">No leads yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="pb-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                          Name
                        </th>
                        <th className="pb-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                          Email
                        </th>
                        <th className="pb-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                          Source
                        </th>
                        <th className="pb-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentLeads.map((lead) => (
                        <tr
                          key={lead.id}
                          className="border-b border-slate-50 last:border-0"
                        >
                          <td className="py-2.5">
                            <span className="font-medium text-slate-800">
                              {lead.name || '—'}
                            </span>
                          </td>
                          <td className="py-2.5 text-slate-500">{lead.email || '—'}</td>
                          <td className="py-2.5">
                            <Badge
                              variant="secondary"
                              className={cn(
                                'text-[11px] font-medium border-0',
                                sourceStyles[lead.source] ??
                                  'bg-slate-100 text-slate-600',
                              )}
                            >
                              {lead.source.replace(/_/g, ' ')}
                            </Badge>
                          </td>
                          <td className="py-2.5 text-right text-slate-400">
                            {formatDate(lead.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Access */}
        <motion.div variants={item} className="xl:col-span-2">
          <Card className="border-slate-200/80 bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-slate-900">
                Quick Access
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {quickLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link key={link.href} href={link.href}>
                      <div className="group flex items-center gap-2.5 rounded-lg p-2.5 hover:bg-slate-50 transition-colors cursor-pointer">
                        <div
                          className={cn(
                            'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-transform group-hover:scale-105',
                            link.color,
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className="text-[13px] font-medium text-slate-700 group-hover:text-slate-900 truncate">
                          {link.label}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
