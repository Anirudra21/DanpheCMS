'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from '@/components/ui/sheet';
import { NAV_ITEMS } from '@/lib/constants';
import {
  Mail,
  Phone,
  Menu,
  Facebook,
  Instagram,
} from 'lucide-react';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-shadow duration-300 ${
        scrolled ? 'shadow-lg' : ''
      }`}
    >
      {/* Top utility bar */}
      <div className="bg-danphe-dark text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 text-sm">
          <div className="flex items-center gap-4 sm:gap-6">
            <a
              href="mailto:info@danphehealth.com"
              className="flex items-center gap-1.5 transition-colors hover:text-danphe-accent-light"
              aria-label="Email Danphe Health"
            >
              <Mail className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">info@danphehealth.com</span>
            </a>
            <a
              href="tel:+9779852088004"
              className="flex items-center gap-1.5 transition-colors hover:text-danphe-accent-light"
              aria-label="Call Danphe Health"
            >
              <Phone className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">+977-9852088004</span>
            </a>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://www.facebook.com/DapheHealth"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-danphe-accent-light"
              aria-label="Facebook"
            >
              <Facebook className="h-4 w-4" />
            </a>
            <a
              href="https://www.instagram.com/danphe_health/"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-danphe-accent-light"
              aria-label="Instagram"
            >
              <Instagram className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Main navbar */}
      <nav className="bg-white backdrop-blur-md bg-white/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          {/* Logo */}
          <Link href="/" aria-label="Danphe Health Home">
            <Image
              src="https://danphehealth.com/frontend/img/logo.png"
              alt="Danphe Health Logo"
              width={160}
              height={44}
              unoptimized
              className="h-10 w-auto sm:h-11"
              priority
            />
          </Link>

          {/* Desktop nav links */}
          <div className="hidden items-center gap-1 lg:flex">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md px-3 py-2 text-sm font-medium text-danphe-text transition-colors hover:bg-danphe-bg-light hover:text-danphe-primary"
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Desktop CTA + Mobile menu */}
          <div className="flex items-center gap-3">
            <Button
              asChild
              className="hidden bg-danphe-primary hover:bg-danphe-primary-light lg:inline-flex"
            >
              <a
                href="https://danphehealth.com/contact"
                target="_blank"
                rel="noopener noreferrer"
              >
                Schedule a Demo
              </a>
            </Button>

            {/* Mobile hamburger */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon" aria-label="Open menu">
                  <Menu className="h-6 w-6 text-danphe-text" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 bg-white p-0">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <div className="flex flex-col h-full">
                  <div className="border-b border-danphe-border p-4">
                    <Image
                      src="https://danphehealth.com/frontend/img/logo.png"
                      alt="Danphe Health Logo"
                      width={140}
                      height={40}
                      unoptimized
                      className="h-9 w-auto"
                    />
                  </div>
                  <div className="flex-1 overflow-y-auto p-4">
                    <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
                      {NAV_ITEMS.map((item) => (
                        <a
                          key={item.label}
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => setMobileOpen(false)}
                          className="rounded-md px-3 py-2.5 text-sm font-medium text-danphe-text transition-colors hover:bg-danphe-bg-light hover:text-danphe-primary"
                        >
                          {item.label}
                        </a>
                      ))}
                    </nav>
                  </div>
                  <div className="border-t border-danphe-border p-4">
                    <Button
                      asChild
                      className="w-full bg-danphe-primary hover:bg-danphe-primary-light"
                      onClick={() => setMobileOpen(false)}
                    >
                      <a
                        href="https://danphehealth.com/contact"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Schedule a Demo
                      </a>
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
    </header>
  );
}
