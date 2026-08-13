'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  FileText,
  FileStack,
  Image,
  Settings,
  Users,
  Activity,
  LogOut,
  Menu,
  ChevronLeft,
} from 'lucide-react';
import { cn } from '@/lib/cms-utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getInitials, getAvatarColor } from '@/lib/cms-utils';

const navLinks = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/posts', label: 'Posts', icon: FileText },
  { href: '/admin/pages', label: 'Pages', icon: FileStack },
  { href: '/admin/media', label: 'Media', icon: Image },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/activity', label: 'Activity', icon: Activity },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user;
  const userName = user?.name ?? 'Admin User';
  const userEmail = user?.email ?? '';
  const userRole = (user as Record<string, unknown>)?.role as string | undefined;

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/admin/login' });
  };

  return (
    <div className="flex h-full flex-col bg-danphe-dark text-white">
      {/* Logo */}
      <div className="flex h-16 items-center px-5 shrink-0">
        <h1 className="text-xl font-bold tracking-tight">
          Danphe{' '}
          <span className="text-danphe-accent">CMS</span>
        </h1>
      </div>

      <Separator className="bg-white/10" />

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {navLinks.map((link) => {
            const isActive =
              pathname === link.href || pathname.startsWith(link.href + '/');
            return (
              <a
                key={link.href}
                href={link.href}
                onClick={onNavigate}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-danphe-accent text-white'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                )}
              >
                <link.icon className="h-4.5 w-4.5" />
                {link.label}
              </a>
            );
          })}
        </nav>
      </ScrollArea>

      <Separator className="bg-white/10" />

      {/* User Info + Logout */}
      <div className="shrink-0 p-4">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user?.image ?? ''} alt={userName} />
            <AvatarFallback
              className={cn('text-xs font-medium text-white', getAvatarColor(userName))}
            >
              {getInitials(userName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{userName}</p>
            <p className="text-xs text-slate-400 truncate">
              {userRole ?? 'Viewer'}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-slate-300 hover:bg-white/10 hover:text-white"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { status } = useSession();
  const router = useRouter();

  const pageTitle = navLinks.find((l) =>
    pathname === l.href || pathname.startsWith(l.href + '/')
  )?.label ?? 'Admin';

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
      <div className="flex h-screen items-center justify-center bg-danphe-bg-light">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-danphe-accent border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-danphe-bg-light">
      {/* Desktop Sidebar */}
      <AnimatePresence initial={false}>
        <motion.aside
          initial={false}
          animate={{ width: collapsed ? 72 : 256 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className="hidden lg:flex flex-col shrink-0 border-r border-danphe-border overflow-hidden"
        >
          <div className="flex h-full flex-col bg-danphe-dark text-white" style={{ width: collapsed ? 72 : 256 }}>
            {/* Logo */}
            <div className="flex h-16 items-center justify-between px-4 shrink-0">
              {!collapsed && (
                <h1 className="text-xl font-bold tracking-tight">
                  Danphe{' '}
                  <span className="text-danphe-accent">CMS</span>
                </h1>
              )}
              {collapsed && (
                <h1 className="text-lg font-bold text-danphe-accent mx-auto">D</h1>
              )}
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  'h-8 w-8 p-0 text-slate-400 hover:bg-white/10 hover:text-white',
                  collapsed && 'hidden'
                )}
                onClick={() => setCollapsed(!collapsed)}
              >
                <ChevronLeft className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')} />
              </Button>
            </div>

            <Separator className="bg-white/10" />

            {/* Nav links */}
            <ScrollArea className="flex-1 px-3 py-4">
              <nav className="space-y-1">
                {navLinks.map((link) => {
                  const isActive =
                    pathname === link.href || pathname.startsWith(link.href + '/');
                  return (
                    <a
                      key={link.href}
                      href={link.href}
                      title={collapsed ? link.label : undefined}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                        collapsed && 'justify-center px-0',
                        isActive
                          ? 'bg-danphe-accent text-white'
                          : 'text-slate-300 hover:bg-white/10 hover:text-white'
                      )}
                    >
                      <link.icon className="h-4.5 w-4.5 shrink-0" />
                      {!collapsed && <span>{link.label}</span>}
                    </a>
                  );
                })}
              </nav>
            </ScrollArea>

            <Separator className="bg-white/10" />

            {/* User info + sign out */}
            <div className="shrink-0 p-3">
              <div className={cn('flex items-center gap-3 mb-3', collapsed && 'justify-center')}>
                <UserAvatar collapsed={collapsed} />
                {!collapsed && <UserInfo />}
              </div>
              <Button
                variant="ghost"
                className={cn(
                  'gap-2 text-slate-300 hover:bg-white/10 hover:text-white',
                  collapsed ? 'w-full justify-center px-0' : 'w-full justify-start'
                )}
                onClick={() => signOut({ callbackUrl: '/admin/login' })}
                title={collapsed ? 'Sign Out' : undefined}
              >
                <LogOut className="h-4 w-4" />
                {!collapsed && <span>Sign Out</span>}
              </Button>
            </div>
          </div>
        </motion.aside>
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="flex h-16 items-center justify-between border-b border-danphe-border bg-white px-4 lg:px-6 shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="lg:hidden h-9 w-9 p-0">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <SidebarContent onNavigate={() => setMobileOpen(false)} />
              </SheetContent>
            </Sheet>
            <h2 className="text-lg font-semibold text-danphe-text">{pageTitle}</h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Collapse toggle for desktop */}
            <Button
              variant="ghost"
              size="sm"
              className="hidden lg:flex h-8 w-8 p-0 text-muted-foreground hover:text-danphe-text"
              onClick={() => setCollapsed(!collapsed)}
            >
              <Menu className="h-4 w-4" />
            </Button>
            <DesktopUserAvatar />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

function UserAvatar({ collapsed }: { collapsed?: boolean }) {
  const { data: session } = useSession();
  const user = session?.user;
  const userName = user?.name ?? 'Admin';
  return (
    <Avatar className="h-8 w-8">
      <AvatarImage src={user?.image ?? ''} alt={userName} />
      <AvatarFallback className={cn('text-xs font-medium text-white', getAvatarColor(userName))}>
        {getInitials(userName)}
      </AvatarFallback>
    </Avatar>
  );
}

function DesktopUserAvatar() {
  return <UserAvatar />;
}

function UserInfo() {
  const { data: session } = useSession();
  const user = session?.user;
  const userName = user?.name ?? 'Admin User';
  const userRole = (user as Record<string, unknown>)?.role as string | undefined;
  return (
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium truncate">{userName}</p>
      <p className="text-xs text-slate-400 truncate">{userRole ?? 'Viewer'}</p>
    </div>
  );
}