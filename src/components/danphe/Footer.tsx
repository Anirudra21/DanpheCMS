'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
  MapPin,
  Phone,
  Mail,
  Globe,
  ChevronRight,
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

function FooterColumn({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-heading mb-5 text-base font-semibold text-white">{heading}</h3>
      <div className="mb-5 h-0.5 w-8 bg-gradient-to-r from-danphe-accent to-transparent" />
      {children}
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: string }) {
  const isInternal = href.startsWith('/');
  const Component = isInternal ? Link : 'a';
  return (
    <li>
      <Component
        href={href}
        className="group flex items-center gap-1 text-sm text-white/75 transition-all duration-300 hover:text-danphe-accent-light hover:pl-1"
      >
        <ChevronRight className="h-3 w-3 opacity-0 -ml-3.5 transition-all duration-300 group-hover:ml-0 group-hover:opacity-100" />
        {children}
      </Component>
    </li>
  );
}

function SocialIcon({ icon: Icon, href, label }: { icon: React.ElementType; href: string; label: string }) {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      whileHover={{ scale: 1.15, y: -2 }}
      whileTap={{ scale: 0.95 }}
      className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 transition-colors duration-300 hover:bg-danphe-accent"
    >
      <Icon className="h-4 w-4 text-white/75 transition-colors duration-300 hover:!text-white" />
    </motion.a>
  );
}

export default function Footer({ className }: { className?: string }) {
  const [siteData, setSiteData] = useState<PublicData | null>(null);

  useEffect(() => {
    fetch('/api/public-data')
      .then((res) => res.json())
      .then((data) => setSiteData(data))
      .catch(() => {});
  }, []);

  if (!siteData) return null;

  const settings = siteData.siteSettings;
  const siteMenu = siteData.navByLocation.FOOTER_COMPANY ?? [];
  const hmisMenu = siteData.navByLocation.FOOTER_SOLUTIONS ?? [];
  const infoMenu = siteData.navByLocation.FOOTER_INFO ?? [];
  const facebookUrl = settings?.facebookUrl || '';
  const instagramUrl = settings?.instagramUrl || '';
  const address = settings?.address || '';
  const phone = settings?.phone || '';
  const email = settings?.email || '';
  const footerText = settings?.footerText || '';
  const copyrightText = settings?.copyrightText || '© Copyright 2024. All Rights Reserved.';

  const socialLinks = [
    { icon: Facebook, href: facebookUrl, label: 'Facebook' },
    { icon: Instagram, href: instagramUrl, label: 'Instagram' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: Youtube, href: '#', label: 'YouTube' },
  ];

  return (
    <footer className={`bg-danphe-dark text-white ${className ?? ''}`} aria-label="Site footer">
      <div className="mx-auto max-w-7xl px-4 py-16 md:py-20">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Site Menu */}
          <FooterColumn heading="Site Menu">
            <ul className="space-y-3">
              {siteMenu.map((item) => (
                <FooterLink key={item.label} href={item.url}>
                  {item.label}
                </FooterLink>
              ))}
            </ul>
          </FooterColumn>

          {/* HMIS with EMR Solutions */}
          <FooterColumn heading="HMIS with EMR Solutions">
            <ul className="space-y-3">
              {hmisMenu.map((item) => (
                <FooterLink key={item.label} href={item.url}>
                  {item.label}
                </FooterLink>
              ))}
            </ul>
          </FooterColumn>

          {/* Info */}
          <FooterColumn heading="Info">
            <ul className="space-y-3">
              {infoMenu.map((item) => (
                <FooterLink key={item.label} href={item.url}>
                  {item.label}
                </FooterLink>
              ))}
            </ul>
          </FooterColumn>

          {/* Contact Us */}
          <FooterColumn heading="Contact Us">
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-danphe-accent-light" />
                <span className="text-sm text-white/75">
                  {address}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 flex-shrink-0 text-danphe-accent-light" />
                <span className="text-sm text-white/75">
                  {phone}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 flex-shrink-0 text-danphe-accent-light" />
                <a
                  href={`mailto:${email}`}
                  className="text-sm text-white/75 transition-colors hover:text-danphe-accent-light"
                >
                  {email}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Globe className="h-4 w-4 flex-shrink-0 text-danphe-accent-light" />
                <span className="text-sm text-white/75">
                  {footerText}
                </span>
              </li>
            </ul>
          </FooterColumn>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 border-t border-white/8 pt-8">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <p className="text-sm text-white/60">
              {copyrightText}
            </p>
            <div className="flex items-center gap-3">
              {socialLinks.map((link) => (
                <SocialIcon
                  key={link.label}
                  icon={link.icon}
                  href={link.href}
                  label={link.label}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
