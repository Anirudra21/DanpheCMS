'use client';

import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import {
  Layout,
  Puzzle,
  Users,
  BarChart3,
  MessageSquareQuote,
  Building2,
  Newspaper,
  Briefcase,
  Megaphone,
  Settings,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { cn } from '@/lib/cms-utils';

const quickLinks = [
  { href: '/admin/homepage', label: 'Homepage Sections', icon: Layout, color: 'bg-blue-50 text-blue-600' },
  { href: '/admin/solutions', label: 'Solutions', icon: Puzzle, color: 'bg-emerald-50 text-emerald-600' },
  { href: '/admin/team', label: 'Team Members', icon: Users, color: 'bg-violet-50 text-violet-600' },
  { href: '/admin/stats', label: 'Stats', icon: BarChart3, color: 'bg-amber-50 text-amber-600' },
  { href: '/admin/testimonials', label: 'Testimonials', icon: MessageSquareQuote, color: 'bg-rose-50 text-rose-600' },
  { href: '/admin/client-logos', label: 'Client Logos', icon: Building2, color: 'bg-cyan-50 text-cyan-600' },
  { href: '/admin/posts', label: 'News & Events', icon: Newspaper, color: 'bg-indigo-50 text-indigo-600' },
  { href: '/admin/jobs', label: 'Jobs', icon: Briefcase, color: 'bg-orange-50 text-orange-600' },
  { href: '/admin/leads', label: 'Leads', icon: Megaphone, color: 'bg-pink-50 text-pink-600' },
  { href: '/admin/settings', label: 'Settings', icon: Settings, color: 'bg-slate-50 text-slate-600' },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

export default function DashboardPage() {
  const { data: session } = useSession();
  const user = session?.user;
  const userName = user?.name ?? 'Admin';
  const userRole = (user as Record<string, unknown>)?.role as string | undefined;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
      {/* Welcome header */}
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold text-danphe-text">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Welcome back, <span className="font-medium text-danphe-text">{userName}</span>
          {userRole && (
            <span className="ml-1.5 inline-flex items-center rounded-full bg-danphe-accent/10 px-2 py-0.5 text-xs font-medium text-danphe-accent">
              {userRole}
            </span>
          )}
        </p>
      </motion.div>

      {/* Quick access grid */}
      <motion.div variants={item}>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
          Quick Access
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link key={link.href} href={link.href}>
                <Card className="group border-danphe-border/60 hover:border-danphe-accent/40 hover:shadow-md transition-all duration-200">
                  <CardContent className="flex items-center gap-3.5 p-4">
                    <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors', link.color)}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-danphe-text group-hover:text-danphe-accent transition-colors">
                        {link.label}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}
