'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  LayoutDashboard,
  Newspaper,
  Briefcase,
  Layout,
  Puzzle,
  Users,
  BarChart3,
  MessageSquareQuote,
  Building2,
  Settings,
  LogOut,
  Menu,
  ChevronLeft,
  Megaphone,
  Navigation,
  UserCog,
  Globe,
  Earth,
  X,
} from 'lucide-react';
import { cn } from '@/lib/cms-utils';
import { Toaster } from '@/components/ui/sonner';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getInitials, getAvatarColor } from '@/lib/cms-utils';

// ─── Nav Links ────────────────────────────────────────────────────────────────

const navSections = [
  {
    label: 'General',
    links: [
      { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/admin/settings', label: 'Site Settings', icon: Settings },
      { href: '/admin/navigation', label: 'Navigation', icon: Navigation },
    ],
  },
  {
    label: 'Content',
    links: [
      { href: '/admin/homepage', label: 'Homepage', icon: Layout },
      { href: '/admin/solutions', label: 'Solutions', icon: Puzzle },
      { href: '/admin/team', label: 'Team Members', icon: Users },
      { href: '/admin/stats', label: 'Stats', icon: BarChart3 },
      { href: '/admin/testimonials', label: 'Testimonials', icon: MessageSquareQuote },
      { href: '/admin/clients', label: 'Client Logos', icon: Building2 },
      { href: '/admin/globe-countries', label: 'Globe Countries', icon: Earth },
    ],
  },
  {
    label: 'Engage',
    links: [
      { href: '/admin/posts', label: 'News & Events', icon: Newspaper },
      { href: '/admin/community', label: 'Danphe Community', icon: Globe },
      { href: '/admin/careers', label: 'Careers', icon: Briefcase },
      { href: '/admin/leads', label: 'Leads', icon: Megaphone },
      { href: '/admin/users', label: 'Users', icon: UserCog },
    ],
  },
];

// Flatten for top-bar page title lookup
const allLinks = navSections.flatMap((s) => s.links);

// ─── Sidebar Content (shared desktop & mobile) ────────────────────────────────

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <ScrollArea className="flex-1 px-3 py-4">
      <nav className="space-y-6">
        {navSections.map((section) => (
          <div key={section.label}>
            <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-widest text-slate-500">
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.links.map((link) => {
                const isActive =
                  pathname === link.href ||
                  (link.href !== '/admin/dashboard' &&
                    pathname.startsWith(link.href + '/'));
                const Icon = link.icon;
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={onNavigate}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-150',
                      isActive
                        ? 'bg-danphe-accent text-white shadow-sm shadow-danphe-accent/25'
                        : 'text-slate-300 hover:bg-white/[0.07] hover:text-white',
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{link.label}</span>
                  </a>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </ScrollArea>
  );
}

function SidebarFooter() {
  const { data: session } = useSession();
  const user = session?.user;
  const userName = user?.name ?? 'Admin';
  const userRole = (user as Record<string, unknown>)?.role as string | undefined;

  return (
    <>
      <Separator className="bg-white/[0.06]" />
      <div className="shrink-0 p-3">
        <div className="flex items-center gap-3 px-1">
          <Avatar className="h-8 w-8">
            <AvatarFallback
              className={cn(
                'text-[11px] font-semibold text-white',
                getAvatarColor(userName),
              )}
            >
              {getInitials(userName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{userName}</p>
            <p className="text-[11px] text-slate-400 truncate">
              {userRole?.replace('_', ' ') ?? 'Editor'}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Mobile Sidebar Sheet ────────────────────────────────────────────────────

function MobileSidebar({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[280px] p-0 bg-slate-950 border-slate-800">
        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
        <div className="flex h-full flex-col text-white">
          {/* Mobile header */}
          <div className="flex h-14 items-center justify-between px-4 shrink-0 border-b border-white/[0.06]">
            <h1 className="text-lg font-bold tracking-tight">
              Danphe <span className="text-danphe-accent">CMS</span>
            </h1>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-slate-400 hover:bg-white/10 hover:text-white"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <SidebarNav onNavigate={() => onOpenChange(false)} />
          <SidebarFooter />
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ─── Main Layout ──────────────────────────────────────────────────────────────

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { status, data: session } = useSession();
  const router = useRouter();

  const activeLink = allLinks.find(
    (l) =>
      pathname === l.href ||
      (l.href !== '/admin/dashboard' && pathname.startsWith(l.href + '/')),
  );
  const pageTitle = activeLink?.label ?? 'Admin';

  const user = session?.user;
  const userName = user?.name ?? 'Admin';
  const userRole = (user as Record<string, unknown>)?.role as string | undefined;

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  // Login and unauthorized pages render without sidebar
  if (pathname === '/admin/login' || pathname === '/admin/unauthorized') {
    return <>{children}</>;
  }

  if (status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-danphe-accent border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* ── Desktop Sidebar ──────────────────────────────────── */}
      <aside
        className={cn(
          'hidden lg:flex flex-col shrink-0 border-r border-slate-800 bg-slate-950 text-white transition-all duration-200 ease-in-out',
          collapsed ? 'w-[68px]' : 'w-[260px]',
        )}
      >
        {/* Logo + collapse toggle */}
        <div className="flex h-14 items-center justify-between px-4 shrink-0 border-b border-white/[0.06]">
          {collapsed ? (
            <span className="text-lg font-bold text-danphe-accent mx-auto">D</span>
          ) : (
            <h1 className="text-lg font-bold tracking-tight">
              Danphe <span className="text-danphe-accent">CMS</span>
            </h1>
          )}
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'h-7 w-7 p-0 text-slate-400 hover:bg-white/10 hover:text-white transition-colors',
              collapsed && 'hidden',
            )}
            onClick={() => setCollapsed(!collapsed)}
          >
            <ChevronLeft
              className={cn(
                'h-4 w-4 transition-transform duration-200',
                collapsed && 'rotate-180',
              )}
            />
          </Button>
        </div>

        {/* Navigation with collapsible support */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-3 py-4">
            <nav className="space-y-6">
              {navSections.map((section) => (
                <div key={section.label}>
                  {!collapsed && (
                    <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                      {section.label}
                    </p>
                  )}
                  <div className="space-y-0.5">
                    {section.links.map((link) => {
                      const isActive =
                        pathname === link.href ||
                        (link.href !== '/admin/dashboard' &&
                          pathname.startsWith(link.href + '/'));
                      const Icon = link.icon;
                      return (
                        <a
                          key={link.href}
                          href={link.href}
                          title={collapsed ? link.label : undefined}
                          className={cn(
                            'flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-150',
                            collapsed && 'justify-center px-0',
                            isActive
                              ? 'bg-danphe-accent text-white shadow-sm shadow-danphe-accent/25'
                              : 'text-slate-300 hover:bg-white/[0.07] hover:text-white',
                          )}
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                          {!collapsed && <span>{link.label}</span>}
                        </a>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </div>

          {/* Expand button when collapsed */}
          {collapsed && (
            <div className="px-3 pb-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full h-7 text-slate-400 hover:bg-white/10 hover:text-white"
                onClick={() => setCollapsed(false)}
              >
                <ChevronLeft className="h-4 w-4 rotate-180" />
              </Button>
            </div>
          )}

          {/* Sidebar footer */}
          <SidebarFooter />
        </div>
      </aside>

      {/* ── Main Content Area ────────────────────────────────── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 lg:px-6 shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden h-9 w-9 p-0"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5 text-slate-600" />
            </Button>

            {/* Desktop collapse toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="hidden lg:flex h-8 w-8 p-0 text-slate-400 hover:text-slate-600"
              onClick={() => setCollapsed(!collapsed)}
            >
              <Menu className="h-4 w-4" />
            </Button>

            <h2 className="text-sm font-semibold text-slate-800">{pageTitle}</h2>
          </div>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2.5 rounded-full py-1.5 pl-1.5 pr-3 hover:bg-slate-100 transition-colors cursor-pointer">
                <Avatar className="h-7 w-7">
                  <AvatarFallback
                    className={cn(
                      'text-[11px] font-semibold text-white',
                      getAvatarColor(userName),
                    )}
                  >
                    {getInitials(userName)}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-slate-700 leading-tight">
                    {userName}
                  </p>
                  <p className="text-[11px] text-slate-400 leading-tight">
                    {userRole?.replace('_', ' ') ?? 'Editor'}
                  </p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium text-slate-900">{userName}</p>
                <p className="text-xs text-slate-500">{user?.email ?? ''}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                onClick={() => signOut({ callbackUrl: '/admin/login' })}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-slate-50">
          {children}
        </main>
      </div>

      {/* Mobile Sidebar */}
      <MobileSidebar open={mobileOpen} onOpenChange={setMobileOpen} />
      <Toaster position="top-right" richColors closeButton />
    </div>
  );
}
