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
  ArrowRight,
  TrendingUp,
  FileText,
  Mail,
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

type LeadBySource = {
  source: string;
  count: number;
};

type PostByType = {
  type: string;
  count: number;
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
    label: 'Solutions',
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
    label: 'Open Positions',
    icon: Briefcase,
    href: '/admin/careers',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    ring: 'ring-amber-100',
  },
  {
    key: 'newLeadsThisWeek' as const,
    label: 'Leads (7d)',
    icon: Megaphone,
    href: '/admin/leads',
    color: 'text-rose-600',
    bg: 'bg-rose-50',
    ring: 'ring-rose-100',
  },
  {
    key: 'totalLeads' as const,
    label: 'Total Leads',
    icon: Mail,
    href: '/admin/leads',
    color: 'text-violet-600',
    bg: 'bg-violet-50',
    ring: 'ring-violet-100',
  },
  {
    key: 'totalTeamMembers' as const,
    label: 'Team Members',
    icon: Users,
    href: '/admin/team',
    color: 'text-cyan-600',
    bg: 'bg-cyan-50',
    ring: 'ring-cyan-100',
  },
];

// ─── Quick Access Links ─────────────────────────────────────────────────────

const quickLinks = [
  { href: '/admin/homepage', label: 'Homepage Sections', icon: Layout, color: 'bg-slate-100 text-slate-700' },
  { href: '/admin/solutions', label: 'Solutions', icon: Puzzle, color: 'bg-emerald-50 text-emerald-700' },
  { href: '/admin/team', label: 'Team Members', icon: Users, color: 'bg-violet-50 text-violet-700' },
  { href: '/admin/stats', label: 'Stats', icon: BarChart3, color: 'bg-amber-50 text-amber-700' },
  { href: '/admin/testimonials', label: 'Testimonials', icon: MessageSquareQuote, color: 'bg-rose-50 text-rose-700' },
  { href: '/admin/clients', label: 'Client Logos', icon: Building2, color: 'bg-cyan-50 text-cyan-700' },
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
        {/* Decorative gradient accent */}
        <div className={cn('absolute top-0 right-0 h-20 w-20 -translate-y-1/2 translate-x-1/2 rounded-full opacity-[0.07]', config.bg.replace('50', '400'))} />
        <CardContent className="p-5 relative">
          <div className="flex items-start justify-between">
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{config.label}</p>
              <p className="text-3xl font-bold text-slate-900 tracking-tight">
                <AnimatedNumber value={value} />
              </p>
            </div>
            <div
              className={cn(
                'flex h-11 w-11 items-center justify-center rounded-xl ring-1 transition-all duration-300 group-hover:scale-110 group-hover:shadow-sm',
                config.bg,
                config.ring,
              )}
            >
              <Icon className={cn('h-5 w-5', config.color)} />
            </div>
          </div>
          <div className="mt-3 flex items-center text-xs font-medium text-slate-400 group-hover:text-danphe-accent transition-colors">
            <span>Manage</span>
            <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-0.5" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

// ─── Mini Bar Chart for leads by source ────────────────────────────────────

function LeadSourceChart({ data }: { data: LeadBySource[] }) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const sourceColors: Record<string, string> = {
    CONTACT: 'bg-slate-400',
    DEMO_REQUEST: 'bg-blue-500',
    NEWSLETTER: 'bg-emerald-500',
  };
  const sourceLabels: Record<string, string> = {
    CONTACT: 'Contact',
    DEMO_REQUEST: 'Demo',
    NEWSLETTER: 'Newsletter',
  };

  if (data.length === 0) {
    return (
      <p className="text-sm text-slate-400 text-center py-6">No lead data yet</p>
    );
  }

  return (
    <div className="space-y-3">
      {data.map((item) => (
        <div key={item.source}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-slate-600">{sourceLabels[item.source] ?? item.source}</span>
            <span className="text-xs font-semibold text-slate-800">{item.count}</span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all duration-700 ease-out', sourceColors[item.source] ?? 'bg-slate-400')}
              style={{ width: `${(item.count / maxCount) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
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
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-[130px] rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Skeleton className="h-[350px] rounded-xl xl:col-span-2" />
        <Skeleton className="h-[350px] rounded-xl" />
      </div>
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
  const [leadsBySource, setLeadsBySource] = useState<LeadBySource[]>([]);
  const [postsByType, setPostsByType] = useState<PostByType[]>([]);
  const [totalLeads, setTotalLeads] = useState(0);
  const [totalTeamMembers, setTotalTeamMembers] = useState(0);
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
        setLeadsBySource(data.leadsBySource ?? []);
        setPostsByType(data.postsByType ?? []);
        setTotalLeads(data.totalLeads ?? 0);
        setTotalTeamMembers(data.totalTeamMembers ?? 0);
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
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-rose-50">
            <FileText className="h-6 w-6 text-rose-500" />
          </div>
          <p className="text-sm font-medium text-slate-700">Failed to load dashboard</p>
          <p className="text-sm text-slate-400 mt-1">{error}</p>
          <button
            className="mt-3 text-sm font-medium text-danphe-accent hover:text-danphe-accent/80 transition-colors"
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
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
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
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
          <TrendingUp className="h-4 w-4 text-emerald-500" />
          <span>System operational</span>
        </div>
      </motion.div>

      {/* Stat Cards - 6 columns on xl */}
      <motion.div variants={item}>
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
          {statCards.map((config) => {
            let val = stats?.[config.key] ?? 0;
            if (config.key === 'totalLeads') val = totalLeads;
            if (config.key === 'totalTeamMembers') val = totalTeamMembers;
            return (
              <StatCard
                key={config.key}
                config={config}
                value={val}
              />
            );
          })}
        </div>
      </motion.div>

      {/* Bottom grid: Recent Leads + Lead Source Breakdown + Quick Access */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Recent Leads Table */}
        <motion.div variants={item}>
          <Card className="border-slate-200/80 bg-white h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                  <Megaphone className="h-4 w-4 text-slate-400" />
                  Recent Leads
                </CardTitle>
                <Link
                  href="/admin/leads"
                  className="inline-flex items-center gap-1 text-xs font-medium text-danphe-accent hover:text-danphe-accent/80 transition-colors"
                >
                  View all
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {recentLeads.length === 0 ? (
                <div className="py-8 text-center">
                  <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-slate-50">
                    <Mail className="h-5 w-5 text-slate-300" />
                  </div>
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
                          className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors"
                        >
                          <td className="py-2.5">
                            <div>
                              <span className="font-medium text-slate-800">
                                {lead.name || '—'}
                              </span>
                              {lead.email && (
                                <p className="text-[11px] text-slate-400 truncate max-w-[140px]">{lead.email}</p>
                              )}
                            </div>
                          </td>
                          <td className="py-2.5">
                            <Badge
                              variant="secondary"
                              className={cn(
                                'text-[10px] font-medium border-0 px-2 py-0.5',
                                sourceStyles[lead.source] ??
                                  'bg-slate-100 text-slate-600',
                              )}
                            >
                              {lead.source.replace(/_/g, ' ')}
                            </Badge>
                          </td>
                          <td className="py-2.5 text-right text-slate-400 text-xs">
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

        {/* Lead Source Breakdown */}
        <motion.div variants={item}>
          <Card className="border-slate-200/80 bg-white h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-slate-400" />
                Lead Sources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <LeadSourceChart data={leadsBySource} />
              {postsByType.length > 0 && (
                <div className="mt-6 pt-4 border-t border-slate-100">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Content Overview</p>
                  <div className="space-y-2">
                    {postsByType.map((pt) => (
                      <div key={pt.type} className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">
                          {pt.type === 'NEWS_EVENT' ? 'News & Events' : 'Community Posts'}
                        </span>
                        <Badge variant="secondary" className="text-xs border-0">
                          {pt.count} published
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Access */}
        <motion.div variants={item}>
          <Card className="border-slate-200/80 bg-white h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-slate-900">
                Quick Access
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-1.5">
                {quickLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link key={link.href} href={link.href}>
                      <div className="group flex items-center gap-2.5 rounded-lg p-2.5 hover:bg-slate-50 transition-all duration-150 cursor-pointer">
                        <div
                          className={cn(
                            'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all duration-200 group-hover:scale-110 group-hover:shadow-sm',
                            link.color,
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className="text-[13px] font-medium text-slate-600 group-hover:text-slate-900 truncate transition-colors">
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
