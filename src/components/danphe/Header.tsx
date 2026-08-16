'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetClose,
} from '@/components/ui/sheet';
import {
  Mail,
  Phone,
  Menu,
  X,
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
} from 'lucide-react';

interface NavItem {
  label: string;
  url: string;
  location: string;
}

interface SiteSetting {
  logo: string;
  email: string;
  phone: string;
  facebookUrl: string;
  instagramUrl: string;
  address: string;
  mapEmbedUrl: string;
  footerText: string;
  copyrightText: string;
}

interface PublicData {
  siteSettings: SiteSetting | null;
  navByLocation: Record<string, NavItem[]>;
}

/* Hero section is ~682px. While over hero, use light text on dark bg.
   After scrolling past, switch to dark text on glass bg. */
const HERO_BREAKPOINT = 500;

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [overHero, setOverHero] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [siteData, setSiteData] = useState<PublicData | null>(null);

  useEffect(() => {
    fetch('/api/public-data')
      .then((res) => res.json())
      .then((data) => setSiteData(data))
      .catch(() => {});
  }, []);

  const handleScroll = useCallback(() => {
    const y = window.scrollY;
    setScrolled(y > 10);
    setOverHero(y < HERO_BREAKPOINT);
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight > 0) {
      setScrollProgress((y / docHeight) * 100);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  if (!siteData) return null;

  const settings = siteData.siteSettings;
  const headerNav = siteData.navByLocation.HEADER ?? [];
  const logoUrl = settings?.logo || 'https://danphehealth.com/frontend/img/logo.png';
  const email = settings?.email || '';
  const phone = settings?.phone || '';
  const facebookUrl = settings?.facebookUrl || '';
  const instagramUrl = settings?.instagramUrl || '';

  /* Dynamic text/border colors based on position */
  const contactTextColor = overHero && !scrolled
    ? 'text-white/70'
    : 'text-danphe-text-light';
  const contactHoverColor = overHero && !scrolled
    ? 'hover:text-white'
    : 'hover:text-danphe-accent';
  const dividerColor = overHero && !scrolled
    ? 'bg-white/20'
    : 'bg-danphe-border';
  const hamburgerColor = overHero && !scrolled
    ? 'text-white'
    : 'text-danphe-text';
  const hamburgerHoverBg = overHero && !scrolled
    ? 'hover:bg-white/10'
    : 'hover:bg-danphe-bg-light';
  const logoFilter = overHero && !scrolled
    ? 'brightness-0 invert'
    : '';

  return (
    <header className="fixed top-0 z-50 w-full transition-all duration-500">
      {/* Scroll progress bar */}
      <div className="absolute top-0 left-0 z-[60] h-[2px] w-full bg-transparent">
        <div
          className="h-full bg-danphe-accent transition-[width] duration-150 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Main navbar */}
      <nav
        className={`transition-all duration-500 ${
          scrolled
            ? 'glass shadow-lg shadow-black/5'
            : 'bg-transparent'
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-6">
          {/* Logo */}
          <Link href="/" aria-label="Danphe Health Home">
            <Image
              src={logoUrl}
              alt="Danphe Health Logo"
              width={160}
              height={44}
              unoptimized
              className={`h-10 w-auto transition-all duration-300 lg:h-11 ${logoFilter}`}
              priority
            />
          </Link>

          {/* All nav links moved to FloatingSideNav */}

          {/* Desktop right section: contacts + socials + CTA */}
          <div className="hidden items-center gap-4 lg:flex">
            {/* Email */}
            <a
              href={`mailto:${email}`}
              className={`flex items-center gap-1.5 text-sm transition-colors ${contactTextColor} ${contactHoverColor}`}
              aria-label="Email Danphe Health"
            >
              <Mail className="h-3.5 w-3.5" />
              <span>{email}</span>
            </a>
            {/* Phone */}
            <a
              href={`tel:${phone}`}
              className={`flex items-center gap-1.5 text-sm transition-colors ${contactTextColor} ${contactHoverColor}`}
              aria-label="Call Danphe Health"
            >
              <Phone className="h-3.5 w-3.5" />
              <span>{phone}</span>
            </a>

            {/* Divider */}
            <div className={`h-5 w-px ${dividerColor} transition-colors duration-300`} />

            {/* Social icons */}
            <div className="flex items-center gap-2">
              {[
                { icon: Facebook, href: facebookUrl, label: 'Facebook' },
                { icon: Instagram, href: instagramUrl, label: 'Instagram' },
                { icon: Linkedin, href: '#', label: 'LinkedIn' },
                { icon: Youtube, href: '#', label: 'YouTube' },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`transition-colors ${contactTextColor} ${contactHoverColor}`}
                  aria-label={s.label}
                >
                  <s.icon className="h-4 w-4" />
                </a>
              ))}
            </div>

            {/* CTA Button - always visible, always accent */}
            <Link
              href="/schedule-a-demo"
              className="rounded-full bg-danphe-accent px-5 py-2.5 text-sm font-semibold text-white shadow-glow-accent transition-all hover:bg-danphe-accent-light hover:shadow-lg"
            >
              Schedule a Demo
            </Link>
          </div>

          {/* Mobile hamburger */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <button
                aria-label="Open menu"
                className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${hamburgerColor} ${hamburgerHoverBg}`}
              >
                <Menu className="h-6 w-6" />
              </button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-80 border-none bg-danphe-dark p-0"
            >
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <div className="flex h-full flex-col">
                {/* Mobile sheet header */}
                <div className="flex items-center justify-between border-b border-white/10 p-5">
                  <Link href="/" onClick={() => setMobileOpen(false)}>
                    <Image
                      src={logoUrl}
                      alt="Danphe Health Logo"
                      width={140}
                      height={40}
                      unoptimized
                      className="h-9 w-auto brightness-0 invert"
                    />
                  </Link>
                  <SheetClose asChild>
                    <button
                      aria-label="Close menu"
                      className="flex h-9 w-9 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </SheetClose>
                </div>

                {/* Mobile nav links */}
                <nav
                  className="flex-1 overflow-y-auto p-5"
                  aria-label="Mobile navigation"
                >
                  <div className="flex flex-col gap-1">
                    {headerNav.map((item, idx) => (
                      <Link
                        key={item.label}
                        href={item.url}
                        onClick={() => setMobileOpen(false)}
                        className="rounded-lg px-4 py-3 text-sm font-medium text-white/80 transition-all hover:bg-white/10 hover:text-white hover:pl-5"
                        style={{ transitionDelay: `${idx * 30}ms` }}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </nav>

                {/* Mobile sheet footer */}
                <div className="border-t border-white/10 p-5">
                  <div className="mb-4 flex flex-col gap-2 text-sm text-white/60">
                    <a
                      href={`mailto:${email}`}
                      className="flex items-center gap-2 transition-colors hover:text-danphe-accent-light"
                    >
                      <Mail className="h-4 w-4" />
                      {email}
                    </a>
                    <a
                      href={`tel:${phone}`}
                      className="flex items-center gap-2 transition-colors hover:text-danphe-accent-light"
                    >
                      <Phone className="h-4 w-4" />
                      {phone}
                    </a>
                  </div>
                  <div className="mb-4 flex items-center gap-3">
                    {[
                      { icon: Facebook, href: facebookUrl, label: 'Facebook' },
                      { icon: Instagram, href: instagramUrl, label: 'Instagram' },
                      { icon: Linkedin, href: '#', label: 'LinkedIn' },
                      { icon: Youtube, href: '#', label: 'YouTube' },
                    ].map((s) => (
                      <a
                        key={s.label}
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white/50 transition-colors hover:text-white"
                        aria-label={s.label}
                      >
                        <s.icon className="h-4 w-4" />
                      </a>
                    ))}
                  </div>
                  <Link
                    href="/schedule-a-demo"
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-full bg-danphe-accent px-5 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-danphe-accent-light"
                  >
                    Schedule a Demo
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
